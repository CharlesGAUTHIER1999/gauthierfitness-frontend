import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";
import * as THREE from "three";
import { useTextureComposer } from "../hooks/useTextureComposer";

useGLTF.preload("/models/tshirt.glb");

// GF12 V2: silences deprecated Three.js warnings we can't fix on the app
// side (they come from drei / r3f internals, not our code).
// Only done once, in dev, to avoid polluting the console.
if (import.meta.env?.DEV && !window.__gf_three_warnings_silenced) {
    const origWarn = console.warn;
    const SILENCED = [
        "THREE.Clock",
        "THREE.WebGLShadowMap: PCFSoftShadowMap",
    ];
    console.warn = function (...args) {
        const msg = args[0];
        if (typeof msg === "string" && SILENCED.some((s) => msg.includes(s))) return;
        origWarn.apply(console, args);
    };
    window.__gf_three_warnings_silenced = true;
}

// Set to true to see received UVs + hit-test results in the console.
const DEBUG_DRAG = false;

// GF12 V2: "safe" UV zone where texts/images are allowed to live.
// If the user drags outside it (sleeve, back, collar of the t-shirt), we clamp
// to avoid the layer landing on a different UV island and becoming unreachable.
// The Studio-Lab GLB has non-overlapping UVs, so any UV in [0,1] is
// safe (no "ghost zone"). We just keep a small margin to avoid
// sticking to the extreme edge.
const SAFE_UV = {
    xMin: 0.02,
    xMax: 0.98,
    yMin: 0.02,
    yMax: 0.98,
};

function clampUV(u, v) {
    return {
        x: Math.max(SAFE_UV.xMin, Math.min(SAFE_UV.xMax, u)),
        y: Math.max(SAFE_UV.yMin, Math.min(SAFE_UV.yMax, v)),
    };
}

// If the received UV is clearly outside the zone (> 0.15 margin), ignore it:
// it means the cursor is on a different UV island (sleeve, back).
function isWayOutsideSafeZone(u, v) {
    return (
        u < SAFE_UV.xMin - 0.15 ||
        u > SAFE_UV.xMax + 0.15 ||
        v < SAFE_UV.yMin - 0.15 ||
        v > SAFE_UV.yMax + 0.15
    );
}

/**
 * T-shirt mesh + pointer event handling (UV hit-test) for drag & drop.
 *
 * To prevent OrbitControls (which listens to native DOM events) from
 * hijacking the drag, we:
 *   1. call e.stopPropagation() on the r3f side
 *   2. call e.nativeEvent.stopPropagation() on the DOM side
 *   3. toggle isDragging → OrbitControls.enabled = false on the next render
 */
function TShirtMesh({
                        texture,
                        bboxesRef,
                        onDragStart,
                        onDragMove,
                        onDragEnd,
                        glbPath,
                        meshMode,
                        activeMeshIndex,
                    }) {
    const { scene } = useGLTF(glbPath);
    const groupRef = useRef();
    const dragState = useRef(null); // { id, type, pointerId }

    // Replaces scene.userData._pruned / scene.userData._centered
    // to avoid the ESLint react-hooks/immutability error.
    const prunedRef = useRef(false);
    const centeredRef = useRef(false);

    useEffect(() => {
        if (!scene) return;

        const meshes = [];
        scene.traverse((child) => {
            if (child.isMesh) meshes.push(child);
        });

        // ── "pick" mode: GLB pack (Studio-Lab). We pick ONE mesh, remove the others.
        if (meshMode === "pick") {
            if (!prunedRef.current) {
                const toRemove = meshes.filter((_, i) => i !== activeMeshIndex);
                toRemove.forEach((m) => m.parent?.remove(m));
                prunedRef.current = true;
            }

        const activeMesh = meshes[activeMeshIndex];
        if (!activeMesh) return;

            if (!centeredRef.current) {
                activeMesh.geometry.computeBoundingBox();
                const box = activeMesh.geometry.boundingBox;
                const center = box.getCenter(new THREE.Vector3());

                activeMesh.geometry.translate(-center.x, -center.y, -center.z);
                activeMesh.position.set(0, 0, 0);

                centeredRef.current = true;
            }

            if (!activeMesh.userData._cloned) {
                activeMesh.material = activeMesh.material.clone();
                activeMesh.userData._cloned = true;
            }

            if (texture) {
                activeMesh.material.map = texture;
                activeMesh.material.needsUpdate = true;
            }

            activeMesh.castShadow = true;
            activeMesh.receiveShadow = true;
            return;
        }

        // ── "all" mode: classic GLB. All meshes make up the garment.
        // We apply the texture to each one, and center the whole thing on the global centroid.
        if (meshes.length === 0) return;

        if (!centeredRef.current) {
            // Global bounding box (union of all local bboxes expressed in world space)
            const globalBox = new THREE.Box3();

            meshes.forEach((m) => {
                m.geometry.computeBoundingBox();
                const b = m.geometry.boundingBox.clone();

                // We want the bbox in the shared local space (scene), so we apply the world matrix
                m.updateWorldMatrix(true, false);
                b.applyMatrix4(m.matrixWorld);
                globalBox.union(b);
            });

            const center = globalBox.getCenter(new THREE.Vector3());

            // Translate the scene root to center the whole model on the origin.
            // (We don't touch individual geometries so UVs/normals stay intact.)
            scene.position.sub(center);
            centeredRef.current = true;
        }

        meshes.forEach((m) => {
            if (!m.userData._cloned && m.material) {
                m.material = m.material.clone();
                m.userData._cloned = true;
            }

            if (texture && m.material && m.geometry?.attributes?.uv) {
                m.material.map = texture;
                m.material.needsUpdate = true;
            }

            m.castShadow = true;
            m.receiveShadow = true;
        });
    }, [scene, texture, meshMode, activeMeshIndex]);

    function hitTestUV(u, v) {
        const list = bboxesRef?.current || [];

        for (const bb of list) {
            if (
                u >= bb.uv.x0 &&
                u <= bb.uv.x1 &&
                v >= bb.uv.y0 &&
                v <= bb.uv.y1
            ) {
                return bb;
            }
        }

        return null;
    }

    function handlePointerDown(e) {
        const uv = e.uv;

        if (!uv) {
            if (DEBUG_DRAG) console.log("[DRAG] pointerDown sans UV");
            return;
        }

        if (DEBUG_DRAG) {
            console.log(
                "[DRAG] pointerDown UV =",
                uv.x.toFixed(3),
                uv.y.toFixed(3),
                "| bboxes:",
                (bboxesRef?.current || []).length
            );

            (bboxesRef?.current || []).forEach((bb) => {
                console.log(
                    "  bbox",
                    bb.id,
                    bb.type,
                    `x:[${bb.uv.x0.toFixed(3)}-${bb.uv.x1.toFixed(3)}]`,
                    `y:[${bb.uv.y0.toFixed(3)}-${bb.uv.y1.toFixed(3)}]`
                );
            });
        }

        // Hit-test with direct UV AND UV flipped on y (in case flipY applies)
        let hit = hitTestUV(uv.x, uv.y);
        let flipped = false;

        if (!hit) {
            hit = hitTestUV(uv.x, 1 - uv.y);
            if (hit) flipped = true;
        }

        if (DEBUG_DRAG) {
            console.log("[DRAG] hit =", hit?.id || "null", flipped ? "(flipped Y)" : "");
        }

        if (!hit) return;

        // Stop propagation on the r3f side AND the DOM side (to block OrbitControls)
        e.stopPropagation();
        e.nativeEvent?.stopPropagation?.();

        dragState.current = {
            id: hit.id,
            type: hit.type,
            pointerId: e.pointerId,
            flipY: flipped,
        };

        onDragStart?.();
    }

    function handlePointerMove(e) {
        const state = dragState.current;

        if (!state) return;
        if (e.pointerId !== state.pointerId) return;

        const uv = e.uv;

        if (!uv) return;

        e.stopPropagation();
        e.nativeEvent?.stopPropagation?.();

        const rawY = state.flipY ? 1 - uv.y : uv.y;
        const rawX = uv.x;

        // GF12 V2: if the cursor is clearly on a different UV island
        // (sleeve / back / collar), ignore the movement to prevent the
        // layer from "jumping" to a zone invisible from the front view.
        if (isWayOutsideSafeZone(rawX, rawY)) {
            if (DEBUG_DRAG) {
                console.log(
                    "[DRAG] move ignoré (hors safe zone)",
                    rawX.toFixed(3),
                    rawY.toFixed(3)
                );
            }
            return;
        }

        // Clamp to the safe zone to guarantee the layer stays reachable.
        const clamped = clampUV(rawX, rawY);
        onDragMove?.(state.id, state.type, clamped);
    }

    function handlePointerUp(e) {
        const state = dragState.current;

        if (!state) return;
        if (e.pointerId !== state.pointerId) return;

        e.stopPropagation?.();
        e.nativeEvent?.stopPropagation?.();

        dragState.current = null;
        onDragEnd?.();
    }

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <primitive object={scene} />
        </group>
    );
}

function Loader() {
    return (
        <mesh>
            <boxGeometry args={[1, 1.5, 0.1]} />
            <meshStandardMaterial color="#d1d5db" wireframe />
        </mesh>
    );
}

export default function CustomizationCanvas3D({
                                                  configuration,
                                                  model3d,
                                                  onUpdateTextLayer,
                                                  onUpdateImageLayer,
                                                  onUpdateLogoUV,
                                                  onUpdatePlayerNameUV,
                                                  onUpdatePlayerNumberUV,
                                                  onDragEnd,
                                              }) {
    // UV debug: only if ?debuguv is present in the URL.
    // Hidden by default in dev AND prod — add ?debuguv to enable it.
    const debugUVAllowed = new URLSearchParams(window.location.search).has("debuguv");
    const [debugUV, setDebugUV] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // GF13: the 3D config (GLB, UV zones, template chest center) is read
    // from productCustomizerConfigs.model3d via the model3d prop. Defensive
    // fallback in case a 3D product has no config (shouldn't happen).
    const glbPath = model3d?.glb || "/models/tshirt.glb";
    const meshMode = model3d?.meshMode || "pick";
    const activeMeshIndex = model3d?.activeMeshIndex ?? 0;
    const uvZones = model3d?.uvZones;
    const templateChest = model3d?.templateChest;
    const transformFallback = model3d?.transformFallback;

    const { texture, bboxesRef } = useTextureComposer(
        configuration,
        debugUV,
        { uvZones, templateChest, transformFallback }
    );

    function handleDragStart() {
        setIsDragging(true);
    }

    function handleDragMove(layerId, type, uv) {
        if (type === "text") {
            onUpdateTextLayer?.(layerId, { uv });
        } else if (type === "image") {
            onUpdateImageLayer?.(layerId, { uv });
        } else if (type === "logo") {
            onUpdateLogoUV?.(uv);
        } else if (type === "player_name") {
            onUpdatePlayerNameUV?.(uv);
        } else if (type === "player_number") {
            onUpdatePlayerNumberUV?.(uv);
        }
    }

    function handleDragEnd() {
        setIsDragging(false);
        onDragEnd?.();
    }

    return (
        <div className="pc3d-canvas-wrapper">
            {debugUVAllowed && (
                <button
                    type="button"
                    className="pc3d-debug-btn"
                    onClick={() => setDebugUV((v) => !v)}
                    title="Affiche une grille numérotée pour calibrer les zones UV du modèle"
                >
                    {debugUV ? "🎨 Mode normal" : "🔧 Debug UV"}
                </button>
            )}

            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
            >
                <Stage
                    intensity={0.5}
                    preset="rembrandt"
                    shadows="contact"
                    environment={{ files: "/hdri/studio_small_03_1k.hdr" }}
                    adjustCamera={1.2}
                >
                    <Suspense fallback={<Loader />}>
                        <TShirtMesh
                            key={glbPath}
                            texture={texture}
                            bboxesRef={bboxesRef}
                            onDragStart={handleDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                            glbPath={glbPath}
                            activeMeshIndex={activeMeshIndex}
                            meshMode={meshMode}
                        />
                    </Suspense>
                </Stage>

                {/* OrbitControls disabled while dragging a layer.
                    enableDamping=false to avoid the inertia that keeps
                    the rotation going after release. */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    enableDamping={false}
                    rotateSpeed={0.6}
                    minDistance={0.5}
                    maxDistance={20}
                    enabled={!isDragging}
                    makeDefault
                />
            </Canvas>

            <div className="pc3d-canvas-hint">
                <span>
                    🖱 Cliquer-glisser pour faire pivoter · Molette pour zoomer
                    {" · "}
                    ✋ Cliquer un texte ou une image pour le déplacer
                </span>
            </div>
        </div>
    );
}