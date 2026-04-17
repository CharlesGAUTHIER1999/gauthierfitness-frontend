import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CANVAS_SIZE = 1024;

// ─── UV ZONES (à calibrer selon le debug ci-dessous) ──────────────────────────
// Ces valeurs sont en fractions de la canvas (0.0 → 1.0).
// Lance le mode DEBUG_UV pour voir quelle zone correspond à quelle partie du t-shirt.
const UV_ZONES = {
    // Face avant – logo poitrine gauche
    logo:          { x: 0.15, y: 0.20, w: 0.18, h: 0.18 },
    // Face avant – texte libre / numéro centre
    front_center:  { x: 0.10, y: 0.35, w: 0.35, h: 0.30 },
    // Face arrière – nom du joueur
    back_name:     { x: 0.55, y: 0.55, w: 0.38, h: 0.10 },
    // Face arrière – numéro
    back_number:   { x: 0.57, y: 0.28, w: 0.35, h: 0.25 },
};

/**
 * Charge une image en gérant les problèmes CORS.
 * Pour les images distantes (backend Laravel sur un autre port),
 * on passe par fetch() + blob URL pour éviter le canvas taint.
 */
async function loadImage(src) {
    if (!src) return null;

    // Assets locaux /public (logos preset, motifs, dégradés) → chargement direct
    const isLocalPublic = src.startsWith("/") && !src.startsWith("//");
    if (isLocalPublic) {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload  = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    // Images uploadées (ex: http://localhost:8000/storage/...) → fetch + blob URL
    // Cela contourne complètement le canvas taint cross-origin
    try {
        const res = await fetch(src, { mode: "cors", credentials: "omit" });
        if (!res.ok) return null;
        const blob   = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                URL.revokeObjectURL(blobUrl); // libère la mémoire
                resolve(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(blobUrl);
                resolve(null);
            };
            img.src = blobUrl;
        });
    } catch {
        // Fallback : tentative directe avec crossOrigin
        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload  = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }
}

function getPatternSrc(id) {
    return id ? `/motifs/${id}.png` : null;
}
function getGradientSrc(id) {
    return id ? `/degrades/${id}.jpg` : null;
}

/**
 * Dessine une grille de calibration UV numérotée sur le canvas.
 * Active en passant debugUV = true au hook.
 * Lis les numéros sur le t-shirt 3D et communique-les pour calibrer UV_ZONES.
 */
function drawDebugGrid(ctx, S) {
    const COLS = 6;
    const ROWS = 6;
    const cw = S / COLS;
    const ch = S / ROWS;
    const colors = ["#ff000066", "#00ff0066", "#0000ff66", "#ffff0066", "#ff00ff66", "#00ffff66"];
    let n = 1;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.fillStyle = colors[(row + col) % colors.length];
            ctx.fillRect(col * cw, row * ch, cw, ch);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.strokeRect(col * cw, row * ch, cw, ch);
            ctx.fillStyle = "#000";
            ctx.font = `bold ${Math.round(cw * 0.4)}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(String(n), col * cw + cw / 2, row * ch + ch * 0.65);
            n++;
        }
    }
}

/**
 * Génère une THREE.CanvasTexture à partir de la configuration customisation.
 * @param {object}  configuration  - objet config customisation
 * @param {boolean} debugUV        - si true, dessine la grille de calibration UV
 */
export function useTextureComposer(configuration, debugUV = false) {
    const canvasRef  = useRef(null);
    const textureRef = useRef(null);
    const [texture, setTexture]   = useState(null);

    // Initialise canvas + texture Three.js une seule fois
    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width  = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        canvasRef.current = canvas;

        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false; // important pour glTF
        textureRef.current = tex;
        setTexture(tex);
    }, []);

    // Recompose la texture à chaque changement de config ou de mode debug
    useEffect(() => {
        if (!canvasRef.current || !textureRef.current) return;
        let cancelled = false;

        async function compose() {
            const canvas = canvasRef.current;
            const ctx    = canvas.getContext("2d");
            const S      = CANVAS_SIZE;

            // ── Mode debug UV ────────────────────────────────────────────────
            if (debugUV) {
                ctx.clearRect(0, 0, S, S);
                drawDebugGrid(ctx, S);
                textureRef.current.needsUpdate = true;
                return;
            }

            // ── 1. Fond couleur de base ──────────────────────────────────────
            const baseColor = configuration?.product_color_hex || "#3b82f6";
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, S, S);

            // ── 2. Motif overlay (toute la surface) ──────────────────────────
            const frontStyle = configuration?.style?.front || {};
            if (frontStyle?.pattern?.enabled && frontStyle?.pattern?.id) {
                const img = await loadImage(getPatternSrc(frontStyle.pattern.id));
                if (!cancelled && img) {
                    ctx.save();
                    ctx.globalAlpha = 0.25;
                    const pat = ctx.createPattern(img, "repeat");
                    ctx.fillStyle = pat;
                    ctx.fillRect(0, 0, S, S);
                    ctx.restore();
                }
            }

            // ── 3. Dégradé overlay (toute la surface) ───────────────────────
            if (frontStyle?.gradient?.enabled && frontStyle?.gradient?.id) {
                const img = await loadImage(getGradientSrc(frontStyle.gradient.id));
                if (!cancelled && img) {
                    ctx.save();
                    ctx.globalAlpha = 0.35;
                    ctx.drawImage(img, 0, 0, S, S);
                    ctx.restore();
                }
            }

            if (cancelled) return;

            const textColor = configuration?.text_style?.color || "#ffffff";
            const view      = configuration?.view || "front";

            // ── 4. Logo (face avant) ─────────────────────────────────────────
            if (configuration?.logo?.enabled && configuration?.logo?.src) {
                const img = await loadImage(configuration.logo.src);
                if (!cancelled && img) {
                    const z = UV_ZONES.logo;
                    ctx.save();
                    ctx.globalAlpha = 1;
                    // Fond blanc arrondi pour lisibilité
                    ctx.fillStyle = "rgba(255,255,255,0.15)";
                    ctx.fillRect(z.x * S, z.y * S, z.w * S, z.h * S);
                    ctx.drawImage(img, z.x * S, z.y * S, z.w * S, z.h * S);
                    ctx.restore();
                }
            }

            if (cancelled) return;

            // ── 5. Numéro (face arrière) ─────────────────────────────────────
            const playerNumber = configuration?.player_number?.value?.trim() || "";
            if (playerNumber) {
                const z    = UV_ZONES.back_number;
                const size = Math.round(z.h * S * 0.9);
                ctx.save();
                ctx.fillStyle   = textColor;
                ctx.strokeStyle = textColor === "#ffffff" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
                ctx.lineWidth   = Math.round(size * 0.04);
                ctx.font        = `900 ${size}px Arial`;
                ctx.textAlign   = "center";
                ctx.textBaseline = "middle";
                const cx = (z.x + z.w / 2) * S;
                const cy = (z.y + z.h / 2) * S;
                ctx.strokeText(playerNumber, cx, cy);
                ctx.fillText(playerNumber, cx, cy);
                ctx.restore();
            }

            // ── 6. Nom du joueur (face arrière) ──────────────────────────────
            const playerName = configuration?.player_name?.value?.trim() || "";
            if (playerName) {
                const z    = UV_ZONES.back_name;
                const size = Math.round(z.h * S * 0.7);
                ctx.save();
                ctx.fillStyle    = textColor;
                ctx.font         = `800 ${size}px Arial`;
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                    playerName.toUpperCase(),
                    (z.x + z.w / 2) * S,
                    (z.y + z.h / 2) * S
                );
                ctx.restore();
            }

            // ── 7. Textes libres ─────────────────────────────────────────────
            const textLayers = Array.isArray(configuration?.text_layers)
                ? configuration.text_layers
                : [];
            textLayers.forEach((layer) => {
                const z  = UV_ZONES.front_center;
                ctx.save();
                ctx.fillStyle    = layer.color || textColor;
                ctx.font         = `bold ${layer.size || 40}px ${layer.font || "Arial"}`;
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                    layer.text,
                    (z.x + z.w / 2) * S,
                    (z.y + z.h / 2) * S
                );
                ctx.restore();
            });

            // ── 8. Images libres importées ───────────────────────────────────
            const imageLayers = Array.isArray(configuration?.image_layers)
                ? configuration.image_layers
                : [];
            for (const layer of imageLayers) {
                if (!layer?.src) continue;
                const img = await loadImage(layer.src);
                if (cancelled) return;
                if (img) {
                    // Zone par défaut : centre avant du t-shirt
                    const z = UV_ZONES.front_center;
                    ctx.save();
                    ctx.globalAlpha = 1;
                    ctx.drawImage(img, z.x * S, z.y * S, z.w * S, z.h * S);
                    ctx.restore();
                }
            }

            // ── Notifier Three.js ────────────────────────────────────────────
            textureRef.current.needsUpdate = true;
        }

        compose();
        return () => { cancelled = true; };
    }, [configuration, debugUV]);

    return texture;
}
