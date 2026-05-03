import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";
import * as THREE from "three";
import { useTextureComposer } from "../hooks/useTextureComposer";

// GF13 : on préload les GLB connus du projet pour que le premier rendu
// soit instantané. Les nouveaux GLB ajoutés via productCustomizerConfigs
// seront simplement chargés au mount du canvas (léger lag la 1ère fois).
useGLTF.preload("/models/tshirt.glb");
useGLTF.preload("/models/tsoversized.glb");
useGLTF.preload("/models/sweatclassic.glb");
useGLTF.preload("/models/sweatzippe.glb");
useGLTF.preload("/models/vesteclassic.glb");
useGLTF.preload("/models/vestecoupevent.glb");

// GF12 V2 : silence les warnings Three.js dépréciés qu'on ne peut pas
// corriger côté app (ils viennent de drei / r3f en interne, pas de notre code).
// On ne le fait qu'une fois, en dev, pour ne pas polluer la console.
if (import.meta.env?.DEV && !window.__gf_three_warnings_silenced) {
    const origWarn = console.warn;
    const SILENCED = [
        "THREE.Clock",                         // drei utilise THREE.Clock en interne
        "THREE.WebGLShadowMap: PCFSoftShadowMap", // faux positif selon la version
    ];
    console.warn = function (...args) {
        const msg = args[0];
        if (typeof msg === "string" && SILENCED.some((s) => msg.includes(s))) return;
        origWarn.apply(console, args);
    };
    window.__gf_three_warnings_silenced = true;
}

// Passe à true pour voir les UV reçus + résultats hit-test en console.
const DEBUG_DRAG = false;

// GF13 : l'index du mesh actif est désormais lu depuis la config produit
// (model3d.activeMeshIndex dans productCustomizerConfigs). Le GLB Studio-Lab
// a besoin de 2 (high-poly), les GLB mono-mesh auront 0.

// GF12 V2 : zone UV "safe" où on autorise les textes/images à vivre.
// Si le user drag en dehors (bras, dos, col du t-shirt), on clamp pour
// éviter que le layer parte sur une UV island différente et devienne inatteignable.
// Le GLB Studio-Lab a des UVs non-overlapping, donc tout UV [0,1] est
// safe (aucune "zone fantôme"). On garde juste une petite marge pour
// éviter de coller au bord extrême.
const SAFE_UV = {
    xMin: 0.02, xMax: 0.98,
    yMin: 0.02, yMax: 0.98,
};

function clampUV(u, v) {
    return {
        x: Math.max(SAFE_UV.xMin, Math.min(SAFE_UV.xMax, u)),
        y: Math.max(SAFE_UV.yMin, Math.min(SAFE_UV.yMax, v)),
    };
}

// Si l'UV reçu est franchement hors zone (> 0.15 de marge), on ignore :
// ça veut dire que le curseur est sur une autre UV island (manche, dos).
function isWayOutsideSafeZone(u, v) {
    return (
        u < SAFE_UV.xMin - 0.15 || u > SAFE_UV.xMax + 0.15 ||
        v < SAFE_UV.yMin - 0.15 || v > SAFE_UV.yMax + 0.15
    );
}

/**
 * Mesh du t-shirt + gestion pointer events (hit-test UV) pour le drag & drop.
 *
 * Pour empêcher OrbitControls (qui écoute les events DOM natifs) de hijacker
 * le drag, on :
 *   1. appelle e.stopPropagation() côté r3f
 *   2. appelle e.nativeEvent.stopPropagation() côté DOM
 *   3. bascule l'état isDragging → OrbitControls.enabled = false au prochain render
 */
function TShirtMesh({
                        texture,
                        bboxesRef,
                        onDragStart,
                        onDragMove,
                        onDragEnd,
                        glbPath,
                        activeMeshIndex,
                        meshMode,
                    }) {
    const { scene } = useGLTF(glbPath);
    const groupRef  = useRef();
    const dragState = useRef(null); // { id, type, pointerId }

    useEffect(() => {
        if (!scene) return;

        // GF12 V2 / GF13 : diagnostic structure du GLB
        const meshes = [];
        scene.traverse((child) => {
            if (child.isMesh) meshes.push(child);
        });
        console.log("[3D] Structure modèle :", meshes.length, "mesh(es), mode =", meshMode);
        console.table(meshes.map((m, i) => ({
            index:    i,
            name:     m.name || "(sans nom)",
            material: m.material?.name || "(sans nom)",
            vertices: m.geometry?.attributes?.position?.count || 0,
            hasUV:    !!m.geometry?.attributes?.uv,
            active:   meshMode === "pick" ? i === activeMeshIndex : true,
        })));

        // ── Mode "pick" : GLB pack (Studio-Lab). On choisit UN mesh, on vire les autres.
        if (meshMode === "pick") {
            if (!scene.userData._pruned) {
                const toRemove = meshes.filter((_, i) => i !== activeMeshIndex);
                toRemove.forEach((m) => m.parent?.remove(m));
                scene.userData._pruned = true;
            }

            const activeMesh = meshes[activeMeshIndex];
            if (!activeMesh) return;

            if (!scene.userData._centered) {
                activeMesh.geometry.computeBoundingBox();
                const box    = activeMesh.geometry.boundingBox;
                const center = box.getCenter(new THREE.Vector3());
                activeMesh.geometry.translate(-center.x, -center.y, -center.z);
                activeMesh.position.set(0, 0, 0);
                scene.userData._centered = true;

                activeMesh.geometry.computeBoundingBox();
                const newBox  = activeMesh.geometry.boundingBox;
                const newSize = newBox.getSize(new THREE.Vector3());
                const newCtr  = newBox.getCenter(new THREE.Vector3());
                console.log("[3D] Mesh actif :", activeMesh.name,
                    "| taille :", newSize.x.toFixed(3), newSize.y.toFixed(3), newSize.z.toFixed(3),
                    "| centre :", newCtr.x.toFixed(3), newCtr.y.toFixed(3), newCtr.z.toFixed(3));
            }

            if (!activeMesh.userData._cloned) {
                activeMesh.material = activeMesh.material.clone();
                activeMesh.userData._cloned = true;
            }
            if (texture) {
                activeMesh.material.map         = texture;
                activeMesh.material.needsUpdate = true;
            }
            activeMesh.castShadow    = true;
            activeMesh.receiveShadow = true;
            return;
        }

        // ── Mode "all" : GLB classique. Tous les meshes constituent le garment.
        // On applique la texture à chacun, et on centre l'ensemble sur le barycentre global.
        if (meshes.length === 0) return;

        if (!scene.userData._centered) {
            // Bounding box globale (union de toutes les bbox locales exprimées en world)
            const globalBox = new THREE.Box3();
            meshes.forEach((m) => {
                m.geometry.computeBoundingBox();
                const b = m.geometry.boundingBox.clone();
                // On veut la bbox en local-space commun (scene), donc on applique la matrix monde
                m.updateWorldMatrix(true, false);
                b.applyMatrix4(m.matrixWorld);
                globalBox.union(b);
            });
            const center = globalBox.getCenter(new THREE.Vector3());

            // On translate le scene root pour centrer tout le modèle sur l'origine.
            // (On ne touche pas aux géométries individuelles pour garder les UV/normales intactes.)
            scene.position.sub(center);
            scene.userData._centered = true;

            const size = globalBox.getSize(new THREE.Vector3());
            console.log("[3D] Modèle (mode all) centré |",
                "taille :", size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3),
                "| offset appliqué :", center.x.toFixed(3), center.y.toFixed(3), center.z.toFixed(3));
        }

        meshes.forEach((m) => {
            if (!m.userData._cloned && m.material) {
                m.material = m.material.clone();
                m.userData._cloned = true;
            }
            if (texture && m.material && m.geometry?.attributes?.uv) {
                m.material.map         = texture;
                m.material.needsUpdate = true;
            }
            m.castShadow    = true;
            m.receiveShadow = true;
        });
    }, [scene, texture, meshMode, activeMeshIndex]);

    function hitTestUV(u, v) {
        const list = bboxesRef?.current || [];
        for (const bb of list) {
            if (
                u >= bb.uv.x0 && u <= bb.uv.x1 &&
                v >= bb.uv.y0 && v <= bb.uv.y1
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
                "[DRAG] pointerDown UV =", uv.x.toFixed(3), uv.y.toFixed(3),
                "| bboxes:", (bboxesRef?.current || []).length
            );
            (bboxesRef?.current || []).forEach((bb) => {
                console.log(
                    "  bbox", bb.id, bb.type,
                    `x:[${bb.uv.x0.toFixed(3)}-${bb.uv.x1.toFixed(3)}]`,
                    `y:[${bb.uv.y0.toFixed(3)}-${bb.uv.y1.toFixed(3)}]`
                );
            });
        }

        // Hit-test avec UV direct ET UV inversé sur y (au cas où flipY joue)
        let hit = hitTestUV(uv.x, uv.y);
        let flipped = false;
        if (!hit) {
            hit = hitTestUV(uv.x, 1 - uv.y);
            if (hit) flipped = true;
        }

        if (DEBUG_DRAG) console.log("[DRAG] hit =", hit?.id || "null", flipped ? "(flipped Y)" : "");

        if (!hit) return;

        // Stop propagation côté r3f ET côté DOM (pour bloquer OrbitControls)
        e.stopPropagation();
        e.nativeEvent?.stopPropagation?.();

        dragState.current = {
            id:        hit.id,
            type:      hit.type,
            pointerId: e.pointerId,
            flipY:     flipped,
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

        // GF12 V2 : si le curseur est clairement sur une autre UV island
        // (manche / dos / col), on ignore le mouvement pour éviter que le
        // layer "saute" dans une zone invisible depuis la vue de face.
        if (isWayOutsideSafeZone(rawX, rawY)) {
            if (DEBUG_DRAG) console.log("[DRAG] move ignoré (hors safe zone)", rawX.toFixed(3), rawY.toFixed(3));
            return;
        }

        // Clamp à la zone safe pour garantir que le layer reste atteignable.
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
    // Debug UV : uniquement si ?debuguv est présent dans l'URL.
    // Invisible par défaut en dev ET en prod — ajouter ?debuguv pour l'activer.
    const debugUVAllowed = new URLSearchParams(window.location.search).has("debuguv");
    const [debugUV, setDebugUV]       = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // GF13 : la config 3D (GLB, UV zones, chest center du template) est lue
    // depuis productCustomizerConfigs.model3d via la prop model3d. Fallback
    // défensif si un produit 3D n'a pas de config (ne devrait pas arriver).
    const glbPath         = model3d?.glb             || "/models/tshirt.glb";
    const meshMode        = model3d?.meshMode        || "pick";
    const activeMeshIndex = model3d?.activeMeshIndex ?? 0;
    const uvZones           = model3d?.uvZones;
    const templateChest     = model3d?.templateChest;
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
                    environment="studio"
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

                {/* OrbitControls désactivé pendant le drag d'un layer.
                    enableDamping=false pour éviter l'inertie qui fait
                    continuer la rotation après le relâchement. */}
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
