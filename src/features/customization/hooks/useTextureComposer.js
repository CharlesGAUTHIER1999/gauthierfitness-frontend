import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CANVAS_SIZE = 1024;

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

    if (stroke) ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

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

    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
}

const DEFAULT_UV_ZONES = {
    logo: { x: 0.385, y: 0.18, w: 0.13, h: 0.13, transform: "mirror_y" },
    front_center: { x: 0.35, y: 0.33, w: 0.20, h: 0.14, transform: "mirror_y" },
    back_name: { x: 0.40, y: 0.50, w: 0.30, h: 0.10, transform: "mirror_y" },
    back_number: { x: 0.22, y: 0.60, w: 0.26, h: 0.30, transform: "mirror_y" },
};

const DEFAULT_TEMPLATE_CHEST = {
    cx: 0.50,
    cy: 0.60,
    w: 0.28,
    h: 0.24,
};

function detectTransformForUV(uv, uvZones, fallback = "mirror_y") {
    for (const key of Object.keys(uvZones)) {
        const z = uvZones[key];

        if (
            uv.x >= z.x &&
            uv.x <= z.x + z.w &&
            uv.y >= z.y &&
            uv.y <= z.y + z.h
        ) {
            return z.transform;
        }
    }

    return fallback;
}

async function loadImage(src) {
    if (!src) return null;

    const isLocalPublic = src.startsWith("/") && !src.startsWith("//");

    if (isLocalPublic) {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    try {
        const res = await fetch(src, { mode: "cors", credentials: "omit" });
        if (!res.ok) return null;

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        return new Promise((resolve) => {
            const img = new window.Image();

            img.onload = () => {
                URL.revokeObjectURL(blobUrl);
                resolve(img);
            };

            img.onerror = () => {
                URL.revokeObjectURL(blobUrl);
                resolve(null);
            };

            img.src = blobUrl;
        });
    } catch {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
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

function drawTemplate(ctx, templateId, S, textColor, chestCenter) {
    if (!templateId) return;

    const isLight = textColor === "#ffffff";

    const stripeColor = isLight
        ? "rgba(255,255,255,0.55)"
        : "rgba(17,17,17,0.32)";

    const borderColor = isLight
        ? "rgba(255,255,255,0.75)"
        : "rgba(17,17,17,0.50)";

    const accentColor = isLight
        ? "rgba(255,255,255,0.55)"
        : "rgba(17,17,17,0.32)";

    const lineColor = isLight
        ? "rgba(255,255,255,0.90)"
        : "rgba(17,17,17,0.65)";

    const CHEST_CX = chestCenter?.cx ?? DEFAULT_TEMPLATE_CHEST.cx;
    const CHEST_CY = chestCenter?.cy ?? DEFAULT_TEMPLATE_CHEST.cy;
    const CHEST_W = chestCenter?.w ?? DEFAULT_TEMPLATE_CHEST.w;
    const CHEST_H = chestCenter?.h ?? DEFAULT_TEMPLATE_CHEST.h;

    const CHEST_X = CHEST_CX - CHEST_W / 2;
    const CHEST_TOP_Y = CHEST_CY - CHEST_H / 2;

    ctx.save();

    if (templateId === "basic-front-template") {
        const stripeH = CHEST_H * 0.20;

        const stripes = [
            { y: CHEST_TOP_Y + CHEST_H * 0.04, h: stripeH },
            { y: CHEST_TOP_Y + CHEST_H * 0.42, h: stripeH },
            { y: CHEST_TOP_Y + CHEST_H * 0.81, h: stripeH },
        ];

        ctx.fillStyle = stripeColor;

        stripes.forEach((stripe) => {
            ctx.beginPath();

            const x = CHEST_X * S;
            const y = stripe.y * S;
            const w = CHEST_W * S;
            const h = stripe.h * S;
            const r = h * 0.5;

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

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(CHEST_X * S, CHEST_TOP_Y * S, CHEST_W * S, CHEST_H * S);
    }

    if (templateId === "clean-front-template") {
        const colW = CHEST_W * 0.47 * S;
        const colX = (CHEST_CX - CHEST_W * 0.235) * S;
        const colY = (CHEST_TOP_Y + CHEST_H * 0.04) * S;
        const colH = CHEST_H * 0.88 * S;
        const r = CHEST_W * 0.10 * S;

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

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(CHEST_CX * S, (CHEST_TOP_Y + CHEST_H * 0.04) * S);
        ctx.lineTo(CHEST_CX * S, (CHEST_TOP_Y + CHEST_H * 0.92) * S);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo((CHEST_CX - CHEST_W * 0.28) * S, (CHEST_TOP_Y + CHEST_H) * S);
        ctx.lineTo((CHEST_CX + CHEST_W * 0.28) * S, (CHEST_TOP_Y + CHEST_H) * S);
        ctx.stroke();
    }

    ctx.restore();
}

function drawDebugGrid(ctx, S) {
    const COLS = 10;
    const ROWS = 10;
    const cw = S / COLS;
    const ch = S / ROWS;
    const colors = [
        "#ff000055",
        "#00ff0055",
        "#0000ff55",
        "#ffff0055",
        "#ff00ff55",
        "#00ffff55",
    ];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.fillStyle = colors[(row + col) % colors.length];
            ctx.fillRect(col * cw, row * ch, cw, ch);

            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeRect(col * cw, row * ch, cw, ch);

            const uvx = (col + 0.5) / COLS;
            const uvy = (row + 0.5) / ROWS;

            ctx.fillStyle = "#000";
            ctx.font = `bold ${Math.round(cw * 0.22)}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(uvx.toFixed(2), col * cw + cw / 2, row * ch + ch * 0.4);
            ctx.fillText(uvy.toFixed(2), col * cw + cw / 2, row * ch + ch * 0.65);
        }
    }
}

export function useTextureComposer(configuration, debugUV = false, options = {}) {
    const uvZones = options.uvZones || DEFAULT_UV_ZONES;
    const templateChest = options.templateChest || DEFAULT_TEMPLATE_CHEST;
    const transformFallback = options.transformFallback || "mirror_y";

    const canvasRef = useRef(null);
    const textureRef = useRef(null);
    const bboxesRef = useRef([]);

    const [texture, setTexture] = useState(null);

    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        canvasRef.current = canvas;

        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false;
        textureRef.current = tex;
        setTexture(tex);
    }, []);

    useEffect(() => {
        if (!canvasRef.current || !textureRef.current) return;

        let cancelled = false;

        async function compose() {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            const S = CANVAS_SIZE;

            const baseColor = configuration?.product_color_hex || "#3b82f6";
            const textColor = configuration?.text_style?.color || "#ffffff";
            const view = configuration?.view || "front";

            ctx.clearRect(0, 0, S, S);
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, S, S);

            if (debugUV) {
                if (view === "front") {
                    drawTemplate(ctx, configuration?.template_id, S, textColor, templateChest);
                }

                ctx.save();
                ctx.globalAlpha = 0.75;
                drawDebugGrid(ctx, S);
                ctx.restore();

                textureRef.current.needsUpdate = true;
                return;
            }

            const frontStyle = configuration?.style?.front || {};

            if (frontStyle?.pattern?.enabled && frontStyle?.pattern?.id) {
                const img = await loadImage(getPatternSrc(frontStyle.pattern.id));

                if (!cancelled && img) {
                    ctx.save();
                    ctx.globalAlpha =
                        typeof frontStyle.pattern.opacity === "number"
                            ? frontStyle.pattern.opacity
                            : 0.60;
                    ctx.globalCompositeOperation = "multiply";
                    ctx.fillStyle = ctx.createPattern(img, "repeat");
                    ctx.fillRect(0, 0, S, S);
                    ctx.restore();
                }
            }

            if (frontStyle?.gradient?.enabled && frontStyle?.gradient?.id) {
                const img = await loadImage(getGradientSrc(frontStyle.gradient.id));

                if (!cancelled && img) {
                    ctx.save();
                    ctx.globalAlpha =
                        typeof frontStyle.gradient.opacity === "number"
                            ? frontStyle.gradient.opacity
                            : 0.70;
                    ctx.globalCompositeOperation = "overlay";
                    ctx.drawImage(img, 0, 0, S, S);
                    ctx.restore();
                }
            }

            if (cancelled) return;

            if (view === "front") {
                drawTemplate(ctx, configuration?.template_id, S, textColor, templateChest);
            }

            const newBboxes = [];

            if (configuration?.logo?.enabled && configuration?.logo?.src) {
                const img = await loadImage(configuration.logo.src);

                if (!cancelled && img) {
                    const dfltCx = uvZones.logo.x + uvZones.logo.w / 2;
                    const dfltCy = uvZones.logo.y + uvZones.logo.h / 2;

                    const lUV =
                        configuration.logo.uv && typeof configuration.logo.uv.x === "number"
                            ? configuration.logo.uv
                            : { x: dfltCx, y: dfltCy };

                    const lW = uvZones.logo.w;
                    const lH = uvZones.logo.h;

                    const dx = (lUV.x - lW / 2) * S;
                    const dy = (lUV.y - lH / 2) * S;
                    const dw = lW * S;
                    const dh = lH * S;

                    ctx.save();
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = "rgba(255,255,255,0.15)";
                    ctx.fillRect(dx, dy, dw, dh);
                    ctx.restore();

                    drawImageTransformed(
                        ctx,
                        img,
                        dx,
                        dy,
                        dw,
                        dh,
                        detectTransformForUV(lUV, uvZones, transformFallback)
                    );

                    newBboxes.push({
                        id: "__logo__",
                        type: "logo",
                        uv: {
                            x0: lUV.x - lW / 2,
                            y0: lUV.y - lH / 2,
                            x1: lUV.x + lW / 2,
                            y1: lUV.y + lH / 2,
                        },
                    });
                }
            }

            if (cancelled) return;

            const playerNumber = configuration?.player_number?.value?.trim() || "";

            if (playerNumber) {
                const dfltCx = uvZones.back_number.x + uvZones.back_number.w / 2;
                const dfltCy = uvZones.back_number.y + uvZones.back_number.h / 2;

                const nUV =
                    configuration.player_number.uv &&
                    typeof configuration.player_number.uv.x === "number"
                        ? configuration.player_number.uv
                        : { x: dfltCx, y: dfltCy };

                const size = Math.round(uvZones.back_number.h * S * 0.38);

                ctx.save();
                ctx.fillStyle = textColor;
                ctx.strokeStyle =
                    textColor === "#ffffff"
                        ? "rgba(0,0,0,0.3)"
                        : "rgba(255,255,255,0.3)";
                ctx.lineWidth = Math.round(size * 0.04);
                ctx.font = `900 ${size}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const cx = nUV.x * S;
                const cy = nUV.y * S;

                drawTextTransformed(
                    ctx,
                    playerNumber,
                    cx,
                    cy,
                    detectTransformForUV(nUV, uvZones, transformFallback),
                    { stroke: true }
                );

                const metrics = ctx.measureText(playerNumber);
                const nw = metrics.width;
                const nh = size * 1.2;

                newBboxes.push({
                    id: "__player_number__",
                    type: "player_number",
                    uv: {
                        x0: (cx - nw / 2) / S,
                        y0: (cy - nh / 2) / S,
                        x1: (cx + nw / 2) / S,
                        y1: (cy + nh / 2) / S,
                    },
                });

                ctx.restore();
            }

            const playerName = configuration?.player_name?.value?.trim() || "";

            if (playerName) {
                const dfltCx = uvZones.back_name.x + uvZones.back_name.w / 2;
                const dfltCy = uvZones.back_name.y + uvZones.back_name.h / 2;

                const mUV =
                    configuration.player_name.uv &&
                    typeof configuration.player_name.uv.x === "number"
                        ? configuration.player_name.uv
                        : { x: dfltCx, y: dfltCy };

                const size = Math.round(uvZones.back_name.h * S * 0.32);

                ctx.save();
                ctx.fillStyle = textColor;
                ctx.font = `800 ${size}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const cx = mUV.x * S;
                const cy = mUV.y * S;

                drawTextTransformed(
                    ctx,
                    playerName.toUpperCase(),
                    cx,
                    cy,
                    detectTransformForUV(mUV, uvZones, transformFallback)
                );

                const metrics = ctx.measureText(playerName.toUpperCase());
                const nw = metrics.width;
                const nh = size * 1.2;

                newBboxes.push({
                    id: "__player_name__",
                    type: "player_name",
                    uv: {
                        x0: (cx - nw / 2) / S,
                        y0: (cy - nh / 2) / S,
                        x1: (cx + nw / 2) / S,
                        y1: (cy + nh / 2) / S,
                    },
                });

                ctx.restore();
            }

            const textLayers = Array.isArray(configuration?.text_layers)
                ? configuration.text_layers
                : [];

            textLayers.forEach((layer) => {
                const fallbackUV = {
                    x: uvZones.front_center.x + uvZones.front_center.w / 2,
                    y: uvZones.front_center.y + uvZones.front_center.h / 2,
                };

                const uv =
                    layer.uv && typeof layer.uv.x === "number" ? layer.uv : fallbackUV;

                const fontSize =
                    layer.size && layer.size > 20 ? Math.min(layer.size, 44) : 42;

                ctx.save();
                ctx.fillStyle = layer.color || textColor;
                ctx.font = `bold ${fontSize}px ${layer.font || "Arial"}`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const cx = uv.x * S;
                const cy = uv.y * S;

                drawTextTransformed(
                    ctx,
                    layer.text,
                    cx,
                    cy,
                    detectTransformForUV(uv, uvZones, transformFallback)
                );

                const metrics = ctx.measureText(layer.text);
                const w = metrics.width;
                const h = fontSize * 1.2;

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

            const imageLayers = Array.isArray(configuration?.image_layers)
                ? configuration.image_layers
                : [];

            for (const layer of imageLayers) {
                if (!layer?.src) continue;

                const img = await loadImage(layer.src);

                if (cancelled) return;

                if (img) {
                    const fallbackUV = {
                        x: uvZones.logo.x + uvZones.logo.w / 2,
                        y: uvZones.logo.y + uvZones.logo.h / 2,
                    };

                    const uv =
                        layer.uv && typeof layer.uv.x === "number"
                            ? layer.uv
                            : fallbackUV;

                    const size =
                        layer.size && typeof layer.size.w === "number"
                            ? layer.size
                            : { w: 0.05, h: 0.05 };

                    const drawX = (uv.x - size.w / 2) * S;
                    const drawY = (uv.y - size.h / 2) * S;
                    const drawW = size.w * S;
                    const drawH = size.h * S;

                    drawImageTransformed(
                        ctx,
                        img,
                        drawX,
                        drawY,
                        drawW,
                        drawH,
                        detectTransformForUV(uv, uvZones, transformFallback)
                    );

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

            bboxesRef.current = newBboxes.reverse();
            textureRef.current.needsUpdate = true;
        }

        compose();

        return () => {
            cancelled = true;
        };
    }, [configuration, debugUV, uvZones, templateChest, transformFallback]);

    return { texture, bboxesRef };
}