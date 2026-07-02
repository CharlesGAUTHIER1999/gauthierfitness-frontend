import {Suspense, useEffect, useRef, useState} from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls, useGLTF, Stage} from "@react-three/drei";
import * as THREE from "three";
import {useTextureComposer} from "../hooks/useTextureComposer";

useGLTF.preload("/models/tshirt.glb");

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

// Set to true to see received UVs + hit-test results in the console
const DEBUG_DRAG = false;
const ACTIVE_MESH_INDEX = 2;
const SAFE_UV = {
    xMin: 0.02,
    xMax: 0.98,
    yMin: 0.02,
    yMax: 0.98,
};

// Clamps a UV coordinate into the safe zone above.
function clampUV(u, v) {
    return {
        x: Math.max(SAFE_UV.xMin, Math.min(SAFE_UV.xMax, u)),
        y: Math.max(SAFE_UV.yMin, Math.min(SAFE_UV.yMax, v)),
    };
}

function isWayOutsideSafeZone(u, v) {
    return (
        u < SAFE_UV.xMin - 0.15 ||
        u > SAFE_UV.xMax + 0.15 ||
        v < SAFE_UV.yMin - 0.15 ||
        v > SAFE_UV.yMax + 0.15
    );
}

// T-shirt mesh + pointer event handling (UV hit-test) for drag & drop
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
    const {scene} = useGLTF(glbPath);
    const groupRef = useRef();
    const dragState = useRef(null); // { id, type, pointerId }
    const prunedRef = useRef(false);
    const centeredRef = useRef(false);

    useEffect(() => {
        if (!scene) return;

        const meshes = [];
        scene.traverse((child) => {
            if (child.isMesh) meshes.push(child);
        });

        // "pick" mode: GLB pack (Studio-Lab)
        if (meshMode === "pick") {
            if (!prunedRef.current) {
                const toRemove = meshes.filter((_, i) => i !== activeMeshIndex);
                toRemove.forEach((m) => m.parent?.remove(m));
                prunedRef.current = true;
            }

            const activeMesh = meshes[ACTIVE_MESH_INDEX];
            if (!activeMesh) return;

            if (!centeredRef.current) {
                activeMesh.geometry.computeBoundingBox();
                const box = activeMesh.geometry.boundingBox;
                const center = box.getCenter(new THREE.Vector3());
                activeMesh.geometry.translate(-center.x, -center.y, -center.z);
                activeMesh.position.set(0, 0, 0);
                centeredRef.current = true;
                activeMesh.geometry.computeBoundingBox();
                const newBox = activeMesh.geometry.boundingBox;
                const newSize = newBox.getSize(new THREE.Vector3());
                const newCtr = newBox.getCenter(new THREE.Vector3());
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

        // "all" mode: classic GLB
        if (meshes.length === 0) return;

        if (!centeredRef.current) {
            const globalBox = new THREE.Box3();

            meshes.forEach((m) => {
                m.geometry.computeBoundingBox();
                const b = m.geometry.boundingBox.clone();
                m.updateWorldMatrix(true, false);
                b.applyMatrix4(m.matrixWorld);
                globalBox.union(b);
            });

            const center = globalBox.getCenter(new THREE.Vector3());
            scene.position.sub(center);
            centeredRef.current = true;
            const size = globalBox.getSize(new THREE.Vector3());
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

    // Starts a drag if the pointer-down UV hits a known layer bbox
    function handlePointerDown(e) {
        const uv = e.uv;

        if (!uv) {
            if (DEBUG_DRAG) console.log("[DRAG] pointerDown without UV");
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

        // Hit-test with direct UV AND UV flipped on y
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

        // Stop propagation on the r3f side AND the DOM side
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

    // Updates the dragged layer's UV position, clamped to the safe zone
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

        if (isWayOutsideSafeZone(rawX, rawY)) {
            if (DEBUG_DRAG) {
                console.log(
                    "[DRAG] move ignored (outside safe zone)",
                    rawX.toFixed(3),
                    rawY.toFixed(3)
                );
            }
            return;
        }

        // Clamp to the safe zone
        const clamped = clampUV(rawX, rawY);
        onDragMove?.(state.id, state.type, clamped);
    }

    // Ends the current drag and clears drag state
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
            <primitive object={scene}/>
        </group>
    );
}

// Placeholder mesh shown while the GLB model is loading
function Loader() {
    return (
        <mesh>
            <boxGeometry args={[1, 1.5, 0.1]}/>
            <meshStandardMaterial color="#d1d5db" wireframe/>
        </mesh>
    );
}

// 3D customization canvas: renders the GLB garment with the composed texture, handles camera controls, and wires up layer drag & drop via UV hit-testing.
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
    const debugUVAllowed = new URLSearchParams(window.location.search).has("debuguv");
    const [debugUV, setDebugUV] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const glbPath = model3d?.glb || "/models/tshirt.glb";
    const meshMode = model3d?.meshMode || "pick";
    const activeMeshIndex = model3d?.activeMeshIndex ?? 0;
    const uvZones = model3d?.uvZones;
    const templateChest = model3d?.templateChest;
    const transformFallback = model3d?.transformFallback;

    const {texture, bboxesRef} = useTextureComposer(
        configuration,
        debugUV,
        {uvZones, templateChest, transformFallback}
    );

    // Disables OrbitControls while a layer is being dragged.
    function handleDragStart() {
        setIsDragging(true);
    }

    // Dispatches a UV move to the right update handler based on layer type.
    function handleDragMove(layerId, type, uv) {
        if (type === "text") {
            onUpdateTextLayer?.(layerId, {uv});
        } else if (type === "image") {
            onUpdateImageLayer?.(layerId, {uv});
        } else if (type === "logo") {
            onUpdateLogoUV?.(uv);
        } else if (type === "player_name") {
            onUpdatePlayerNameUV?.(uv);
        } else if (type === "player_number") {
            onUpdatePlayerNumberUV?.(uv);
        }
    }

    // Re-enables OrbitControls and notifies the parent that the drag ended.
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
                    {debugUV ? "Mode normal" : "Debug UV"}
                </button>
            )}

            <Canvas
                camera={{position: [0, 0, 5], fov: 45}}
                gl={{preserveDrawingBuffer: true}}
            >
                <Stage
                    intensity={0.5}
                    preset="rembrandt"
                    shadows="contact"
                    environment="studio"
                    adjustCamera={1.2}
                >
                    <Suspense fallback={<Loader/>}>
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
                    Cliquer-glisser pour faire pivoter · Molette pour zoomer
                    {" · "}
                    Cliquer un texte ou une image pour le déplacer
                </span>
            </div>
        </div>
    );
}