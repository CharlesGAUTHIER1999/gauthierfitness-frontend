import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CANVAS_SIZE = 1024;

/**
 * Dessine un texte avec le bon pré-transform pour compenser l'UV du GLB.
 * transform ∈ {"none", "mirror_x", "mirror_y", "rotate_180"}
 *   - "none"      : aucune transformation
 *   - "mirror_x"  : flip horizontal (scale(-1, 1))
 *   - "mirror_y"  : flip vertical (scale(1, -1))
 *   - "rotate_180": rotation 180° (équivalent à mirror_x + mirror_y combinés)
 * cx/cy = centre du texte. textAlign doit être "center", textBaseline "middle".
 */
function drawTextTransformed(ctx, text, cx, cy, transform, { stroke = false } = {}) {
    ctx.save();
    ctx.translate(cx, cy);
    if (transform === "rotate_180") {
        ctx.rotate(Math.PI);
    } else if (transform === "mirror_x") {
        ctx.scale(-1, 1);
    } else if (transform === "mirror_y") {
        ctx.scale(1, -1);
    }
    // "none" → pas de transform, on dessine tel quel
    if (stroke) ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

/**
 * Dessine une image avec le bon pré-transform pour compenser l'UV du GLB.
 * dx/dy = coin haut-gauche, dw/dh = dimensions.
 */
function drawImageTransformed(ctx, img, dx, dy, dw, dh, transform) {
    const cx = dx + dw / 2;
    const cy = dy + dh / 2;
    ctx.save();
    ctx.translate(cx, cy);
    if (transform === "rotate_180") {
        ctx.rotate(Math.PI);
    } else if (transform === "mirror_x") {
        ctx.scale(-1, 1);
    } else if (transform === "mirror_y") {
        ctx.scale(1, -1);
    }
    // "none" → pas de transform, on dessine tel quel
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
}

// ─── UV ZONES (calibrées sur le GLB Studio-Lab - GF12 V2) ────────────────────
// Valeurs en fractions de la canvas (0.0 → 1.0), lues via le mode Debug UV.
//
// Tests effectués sur "ANNE" (dos) et sur un logo UBB (devant) :
//   - back  + "mirror_y" → texte ANNE lisible correctement ✅
//   - front + "mirror_x" → logo apparaît pivoté de 180° ❌
//   - front + "mirror_y" → logo correctement orienté ✅
// Conclusion : les DEUX faces du GLB utilisent un flip Y (mirror_y). On
// pré-applique donc mirror_y partout pour compenser. Le "front" et le "back"
// ne diffèrent que par leur zone UV, pas par leur orientation.
const UV_ZONES = {
    // Face avant – logo poitrine gauche (défaut pour logo importé + image)
    // GF12 V2 : taille réduite 0.16 → 0.13 (retour utilisateur : "un peu gros")
    logo:          { x: 0.385, y: 0.18, w: 0.13, h: 0.13, transform: "mirror_y" },
    // Face avant – centre poitrine (référence)
    front_center:  { x: 0.35, y: 0.33, w: 0.20, h: 0.14, transform: "mirror_y" },
    // Face arrière – nom du joueur (défaut pour text_layers aussi)
    back_name:     { x: 0.40, y: 0.50, w: 0.30, h: 0.10, transform: "mirror_y" },
    // Face arrière – numéro
    back_number:   { x: 0.22, y: 0.60, w: 0.26, h: 0.30, transform: "mirror_y" },
};

// Détecte quel transform appliquer pour une UV donnée (layer draggé).
// Les deux faces du GLB Studio-Lab V2 utilisent mirror_y : la réponse est
// donc uniforme, mais on garde la structure au cas où un futur GLB aurait
// des îlots UV à orientations mixtes.
function detectTransformForUV(uv) {
    for (const key of Object.keys(UV_ZONES)) {
        const z = UV_ZONES[key];
        if (uv.x >= z.x && uv.x <= z.x + z.w &&
            uv.y >= z.y && uv.y <= z.y + z.h) {
            return z.transform;
        }
    }
    return "mirror_y";
}

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
 * Dessine un template (décor de fond) sur la face avant.
 * Les coordonnées sont en fraction de la canvas (0-1), calibrées pour
 * tomber dans la zone UV du devant du GLB Studio-Lab V2.
 *
 * Deux templates disponibles :
 *   - "basic-front-template" : 3 rayures horizontales + cadre (classique)
 *   - "clean-front-template" : rectangle central vertical + lignes (minimal)
 *
 * Rendu derrière le logo/textes pour servir de décor de fond.
 */
function drawTemplate(ctx, templateId, S, textColor) {
    if (!templateId) return;

    const isLight = textColor === "#ffffff";
    // GF12 V2 : opacités augmentées (0.18 → 0.45) pour que le décor soit
    // vraiment visible à travers la lumière/ombre du rendu 3D.
    const stripeColor = isLight ? "rgba(255,255,255,0.45)" : "rgba(17,17,17,0.28)";
    const borderColor = isLight ? "rgba(255,255,255,0.60)" : "rgba(17,17,17,0.40)";
    const accentColor = isLight ? "rgba(255,255,255,0.48)" : "rgba(17,17,17,0.28)";
    const lineColor   = isLight ? "rgba(255,255,255,0.85)" : "rgba(17,17,17,0.55)";

    ctx.save();
    // Les zones UV du devant ont le transform mirror_y ; comme les décors sont
    // des rectangles/lignes quasi-symétriques, on n'applique pas de flip (ça
    // ne changerait rien visuellement pour des rectangles mais compliquerait
    // le code sans gain).

    // Zone UV du devant : calé empiriquement pour que le décor apparaisse
    // visuellement centré sur le torse depuis la caméra par défaut.
    // Validé utilisateur après itération fine : CX=0.25 tombe pile au milieu.
    const CHEST_CX = 0.25;
    const CHEST_W  = 0.16;
    const CHEST_X  = CHEST_CX - CHEST_W / 2;
    if (templateId === "basic-front-template") {
        // 3 rayures horizontales sous le logo, en restant dans l'îlot UV devant.
        // Logo bas = y≈0.31, donc on commence en y=0.34 et on reste < 0.46.
        const stripes = [
            { y: 0.345, h: 0.026 },
            { y: 0.395, h: 0.026 },
            { y: 0.445, h: 0.026 },
        ];
        ctx.fillStyle = stripeColor;
        stripes.forEach((s) => {
            ctx.beginPath();
            const r = s.h * S * 0.5;
            const x = CHEST_X * S, y = s.y * S;
            const w = CHEST_W * S, h = s.h * S;
            // Pilule arrondie
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
        });

        // Cadre autour des rayures
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(CHEST_X * S, 0.34 * S, CHEST_W * S, 0.13 * S);
    } else if (templateId === "clean-front-template") {
        // Colonne centrale arrondie sur le torse, centrée sur CHEST_CX.
        // On reste entre y=0.34 (juste sous le logo) et y=0.46 (fin îlot UV).
        const colW = 0.075 * S;
        const colX = (CHEST_CX - 0.0375) * S;
        const colY = 0.345 * S;
        const colH = 0.115 * S;
        const r = 0.016 * S;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(colX + r, colY);
        ctx.lineTo(colX + colW - r, colY);
        ctx.quadraticCurveTo(colX + colW, colY, colX + colW, colY + r);
        ctx.lineTo(colX + colW, colY + colH - r);
        ctx.quadraticCurveTo(colX + colW, colY + colH, colX + colW - r, colY + colH);
        ctx.lineTo(colX + r, colY + colH);
        ctx.quadraticCurveTo(colX, colY + colH, colX, colY + colH - r);
        ctx.lineTo(colX, colY + r);
        ctx.quadraticCurveTo(colX, colY, colX + r, colY);
        ctx.closePath();
        ctx.fill();

        // Ligne verticale centrale
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(CHEST_CX * S, 0.345 * S);
        ctx.lineTo(CHEST_CX * S, 0.46 * S);
        ctx.stroke();

        // Ligne horizontale séparatrice en bas
        ctx.beginPath();
        ctx.moveTo((CHEST_CX - 0.045) * S, 0.47 * S);
        ctx.lineTo((CHEST_CX + 0.045) * S, 0.47 * S);
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * Dessine une grille de calibration UV numérotée sur le canvas.
 * Active en passant debugUV = true au hook.
 * Lis les numéros sur le t-shirt 3D et communique-les pour calibrer UV_ZONES.
 */
function drawDebugGrid(ctx, S) {
    const COLS = 10;
    const ROWS = 10;
    const cw = S / COLS;
    const ch = S / ROWS;
    const colors = ["#ff000055", "#00ff0055", "#0000ff55", "#ffff0055", "#ff00ff55", "#00ffff55"];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            // Fond coloré (damier 6 couleurs)
            ctx.fillStyle = colors[(row + col) % colors.length];
            ctx.fillRect(col * cw, row * ch, cw, ch);
            ctx.strokeStyle = "#000";
            ctx.lineWidth   = 1;
            ctx.strokeRect(col * cw, row * ch, cw, ch);

            // Affiche les coords UV du centre de la case
            // ex : "0.25 / 0.45"
            const uvx = (col + 0.5) / COLS;
            const uvy = (row + 0.5) / ROWS;
            ctx.fillStyle    = "#000";
            ctx.font         = `bold ${Math.round(cw * 0.22)}px Arial`;
            ctx.textAlign    = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(uvx.toFixed(2), col * cw + cw / 2, row * ch + ch * 0.4);
            ctx.fillText(uvy.toFixed(2), col * cw + cw / 2, row * ch + ch * 0.65);
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
    // GF12 V2 : registre des bboxes UV pour hit-testing du drag & drop.
    // Shape : [{ id, type: "text" | "image", uv: {x0, y0, x1, y1} }, ...]
    // Ordonné du dernier rendu au premier (LIFO), pour que le layer visuellement
    // au-dessus soit celui attrapé en priorité au clic.
    const bboxesRef = useRef([]);
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
            // GF12 V2 : opacité augmentée (0.25 → 0.60) + composite multiply pour
            // que le motif prenne la teinte de base au lieu d'être juste transparent.
            const frontStyle = configuration?.style?.front || {};
            if (frontStyle?.pattern?.enabled && frontStyle?.pattern?.id) {
                const img = await loadImage(getPatternSrc(frontStyle.pattern.id));
                if (!cancelled && img) {
                    ctx.save();
                    const patternOpacity = typeof frontStyle.pattern.opacity === "number"
                        ? frontStyle.pattern.opacity
                        : 0.60;
                    ctx.globalAlpha = patternOpacity;
                    ctx.globalCompositeOperation = "multiply";
                    const pat = ctx.createPattern(img, "repeat");
                    ctx.fillStyle = pat;
                    ctx.fillRect(0, 0, S, S);
                    ctx.restore();
                }
            }

            // ── 3. Dégradé overlay (toute la surface) ───────────────────────
            // GF12 V2 : opacité augmentée (0.35 → 0.70) + composite overlay pour
            // un rendu plus contrasté qui respecte la base.
            if (frontStyle?.gradient?.enabled && frontStyle?.gradient?.id) {
                const img = await loadImage(getGradientSrc(frontStyle.gradient.id));
                if (!cancelled && img) {
                    ctx.save();
                    const gradientOpacity = typeof frontStyle.gradient.opacity === "number"
                        ? frontStyle.gradient.opacity
                        : 0.70;
                    ctx.globalAlpha = gradientOpacity;
                    ctx.globalCompositeOperation = "overlay";
                    ctx.drawImage(img, 0, 0, S, S);
                    ctx.restore();
                }
            }

            if (cancelled) return;

            const textColor = configuration?.text_style?.color || "#ffffff";
            const view      = configuration?.view || "front";

            // ── 3 bis. Template (décor de fond sur face avant) ───────────────
            // Appliqué AVANT le logo/textes pour servir de fond décoratif.
            drawTemplate(ctx, configuration?.template_id, S, textColor);

            // GF12 V2 : on reconstruit le registre de bboxes à chaque rendu.
            // On y pousse nom/numéro/logo pour les rendre draggables au même
            // titre que les text_layers / image_layers personnalisés.
            const newBboxes = [];

            // ── 4. Logo (face avant) ─────────────────────────────────────────
            if (configuration?.logo?.enabled && configuration?.logo?.src) {
                const img = await loadImage(configuration.logo.src);
                if (!cancelled && img) {
                    // UV personnalisée si draguée, sinon UV_ZONES par défaut.
                    const dfltCx = UV_ZONES.logo.x + UV_ZONES.logo.w / 2;
                    const dfltCy = UV_ZONES.logo.y + UV_ZONES.logo.h / 2;
                    const lUV = configuration.logo.uv && typeof configuration.logo.uv.x === "number"
                        ? configuration.logo.uv
                        : { x: dfltCx, y: dfltCy };
                    const lW  = UV_ZONES.logo.w;
                    const lH  = UV_ZONES.logo.h;
                    const dx  = (lUV.x - lW / 2) * S;
                    const dy  = (lUV.y - lH / 2) * S;
                    const dw  = lW * S;
                    const dh  = lH * S;

                    ctx.save();
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = "rgba(255,255,255,0.15)";
                    ctx.fillRect(dx, dy, dw, dh);
                    ctx.restore();
                    drawImageTransformed(ctx, img, dx, dy, dw, dh, UV_ZONES.logo.transform);

                    newBboxes.push({
                        id:   "__logo__",
                        type: "logo",
                        uv:   { x0: lUV.x - lW / 2, y0: lUV.y - lH / 2,
                                x1: lUV.x + lW / 2, y1: lUV.y + lH / 2 },
                    });
                }
            }

            if (cancelled) return;

            // ── 5. Numéro (face arrière) ─────────────────────────────────────
            const playerNumber = configuration?.player_number?.value?.trim() || "";
            if (playerNumber) {
                const dfltCx = UV_ZONES.back_number.x + UV_ZONES.back_number.w / 2;
                const dfltCy = UV_ZONES.back_number.y + UV_ZONES.back_number.h / 2;
                const nUV = configuration.player_number.uv && typeof configuration.player_number.uv.x === "number"
                    ? configuration.player_number.uv
                    : { x: dfltCx, y: dfltCy };
                // GF12 V2 : taille réduite (0.9 → 0.55) pour éviter un numéro géant
                const size = Math.round(UV_ZONES.back_number.h * S * 0.55);

                ctx.save();
                ctx.fillStyle    = textColor;
                ctx.strokeStyle  = textColor === "#ffffff" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
                ctx.lineWidth    = Math.round(size * 0.04);
                ctx.font         = `900 ${size}px Arial`;
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                const cx = nUV.x * S;
                const cy = nUV.y * S;
                drawTextTransformed(ctx, playerNumber, cx, cy, UV_ZONES.back_number.transform, { stroke: true });
                ctx.restore();

                const metrics = (() => {
                    const c2 = canvas.getContext("2d");
                    c2.save();
                    c2.font = `900 ${size}px Arial`;
                    const m = c2.measureText(playerNumber);
                    c2.restore();
                    return m;
                })();
                const nw = metrics.width;
                const nh = size * 1.2;
                newBboxes.push({
                    id:   "__player_number__",
                    type: "player_number",
                    uv:   { x0: (cx - nw / 2) / S, y0: (cy - nh / 2) / S,
                            x1: (cx + nw / 2) / S, y1: (cy + nh / 2) / S },
                });
            }

            // ── 6. Nom du joueur (face arrière) ──────────────────────────────
            const playerName = configuration?.player_name?.value?.trim() || "";
            if (playerName) {
                const dfltCx = UV_ZONES.back_name.x + UV_ZONES.back_name.w / 2;
                const dfltCy = UV_ZONES.back_name.y + UV_ZONES.back_name.h / 2;
                const mUV = configuration.player_name.uv && typeof configuration.player_name.uv.x === "number"
                    ? configuration.player_name.uv
                    : { x: dfltCx, y: dfltCy };
                // GF12 V2 : taille réduite (0.7 → 0.45) pour garder GAUTHIER dans la zone
                const size = Math.round(UV_ZONES.back_name.h * S * 0.45);

                ctx.save();
                ctx.fillStyle    = textColor;
                ctx.font         = `800 ${size}px Arial`;
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                const cx = mUV.x * S;
                const cy = mUV.y * S;
                drawTextTransformed(ctx, playerName.toUpperCase(), cx, cy, UV_ZONES.back_name.transform);
                ctx.restore();

                const metrics = (() => {
                    const c2 = canvas.getContext("2d");
                    c2.save();
                    c2.font = `800 ${size}px Arial`;
                    const m = c2.measureText(playerName.toUpperCase());
                    c2.restore();
                    return m;
                })();
                const nw = metrics.width;
                const nh = size * 1.2;
                newBboxes.push({
                    id:   "__player_name__",
                    type: "player_name",
                    uv:   { x0: (cx - nw / 2) / S, y0: (cy - nh / 2) / S,
                            x1: (cx + nw / 2) / S, y1: (cy + nh / 2) / S },
                });
            }

            // ── 7. Textes libres ─────────────────────────────────────────────
            // Chaque layer utilise sa propre position UV (fallback = front_center).
            const textLayers = Array.isArray(configuration?.text_layers)
                ? configuration.text_layers
                : [];
            textLayers.forEach((layer) => {
                const fallbackUV = {
                    x: UV_ZONES.back_name.x + UV_ZONES.back_name.w / 2,
                    y: UV_ZONES.back_name.y + UV_ZONES.back_name.h / 2,
                };
                const uv = layer.uv && typeof layer.uv.x === "number" ? layer.uv : fallbackUV;

                // GF12 V2 : taille par défaut (60px) — compromis lisibilité / taille zone
                const fontSize = layer.size && layer.size > 20 ? layer.size : 60;
                ctx.save();
                ctx.fillStyle    = layer.color || textColor;
                ctx.font         = `bold ${fontSize}px ${layer.font || "Arial"}`;
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                const cx = uv.x * S;
                const cy = uv.y * S;
                drawTextTransformed(ctx, layer.text, cx, cy, detectTransformForUV(uv));

                // Calcul bbox UV à partir des metrics du texte
                const metrics = ctx.measureText(layer.text);
                const w = metrics.width;
                const h = fontSize * 1.2; // approximation hauteur ligne
                newBboxes.push({
                    id: layer.id,
                    type: "text",
                    uv: {
                        x0: (cx - w / 2) / S,
                        y0: (cy - h / 2) / S,
                        x1: (cx + w / 2) / S,
                        y1: (cy + h / 2) / S,
                    },
                });
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
                    const fallbackUV = {
                        x: UV_ZONES.logo.x + UV_ZONES.logo.w / 2,
                        y: UV_ZONES.logo.y + UV_ZONES.logo.h / 2,
                    };
                    const uv   = layer.uv   && typeof layer.uv.x === "number"
                        ? layer.uv
                        : fallbackUV;
                    const size = layer.size && typeof layer.size.w === "number"
                        ? layer.size
                        : { w: 0.05, h: 0.05 };

                    const drawX = (uv.x - size.w / 2) * S;
                    const drawY = (uv.y - size.h / 2) * S;
                    const drawW = size.w * S;
                    const drawH = size.h * S;

                    drawImageTransformed(ctx, img, drawX, drawY, drawW, drawH, detectTransformForUV(uv));

                    newBboxes.push({
                        id: layer.id,
                        type: "image",
                        uv: {
                            x0: uv.x - size.w / 2,
                            y0: uv.y - size.h / 2,
                            x1: uv.x + size.w / 2,
                            y1: uv.y + size.h / 2,
                        },
                    });
                }
            }

            // On inverse pour que les derniers rendus (visuellement devant)
            // soient trouvés en premier lors du hit-test.
            bboxesRef.current = newBboxes.reverse();

            // ── Notifier Three.js ────────────────────────────────────────────
            textureRef.current.needsUpdate = true;
        }

        compose();
        return () => { cancelled = true; };
    }, [configuration, debugUV]);

    // GF12 V2 : on expose aussi bboxesRef pour permettre au Canvas3D de
    // hit-tester les layers lors du drag & drop.
    return { texture, bboxesRef };
}
