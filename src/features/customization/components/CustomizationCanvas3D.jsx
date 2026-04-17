import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";
import * as THREE from "three";
import { useTextureComposer } from "../hooks/useTextureComposer";

useGLTF.preload("/models/tshirt.glb");

function TShirtMesh({ texture }) {
    const { scene } = useGLTF("/models/tshirt.glb");
    const groupRef  = useRef();

    useEffect(() => {
        if (!scene) return;

        // Log dimensions pour debug (visible une seule fois en console)
        const box  = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        console.log("[3D] Taille modèle (x,y,z) :", size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));

        scene.traverse((child) => {
            if (child.isMesh) {
                if (!child.userData._cloned) {
                    child.material = child.material.clone();
                    child.userData._cloned = true;
                }
                if (texture) {
                    child.material.map         = texture;
                    child.material.needsUpdate = true;
                }
                child.castShadow    = true;
                child.receiveShadow = true;
            }
        });
    }, [scene, texture]);

    return (
        <group ref={groupRef}>
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

export default function CustomizationCanvas3D({ configuration }) {
    const [debugUV, setDebugUV] = useState(false);
    const texture = useTextureComposer(configuration, debugUV);

    return (
        <div className="pc3d-canvas-wrapper">
            {/* Bouton debug UV — à retirer une fois les zones calibrées */}
            <button
                type="button"
                className="pc3d-debug-btn"
                onClick={() => setDebugUV((v) => !v)}
                title="Affiche une grille numérotée pour calibrer les zones UV du modèle"
            >
                {debugUV ? "🎨 Mode normal" : "🔧 Debug UV"}
            </button>

            <Canvas
                shadows
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
                        <TShirtMesh texture={texture} />
                    </Suspense>
                </Stage>

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={0.5}
                    maxDistance={20}
                    makeDefault
                />
            </Canvas>

            <div className="pc3d-canvas-hint">
                <span>🖱 Cliquer-glisser pour faire pivoter · Molette pour zoomer</span>
            </div>
        </div>
    );
}
