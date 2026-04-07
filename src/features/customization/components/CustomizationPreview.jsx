import { useEffect, useMemo, useState } from "react";
import {
    Stage,
    Layer,
    Image as KonvaImage,
    Rect,
    Text,
    Line,
    Group,
} from "react-konva";

function useHtmlImage(src) {
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (!src) {
            setImage(null);
            return;
        }

        const img = new window.Image();

        const isLocalPublicAsset =
            src.startsWith("/") ||
            src.startsWith(window.location.origin);

        if (isLocalPublicAsset) {
            img.crossOrigin = "anonymous";
        }

        img.onload = () => setImage(img);
        img.onerror = (err) => {
            console.error("Impossible de charger l'image :", src, err);
            setImage(null);
        };

        img.src = src;

        return () => {
            setImage(null);
        };
    }, [src]);

    return image;
}

function getPatternImageSrc(patternId) {
    if (!patternId) return null;

    switch (patternId) {
        case "motif1":
            return "/motifs/motif1.png";
        case "motif2":
            return "/motifs/motif2.png";
        case "motif3":
            return "/motifs/motif3.png";
        default:
            return null;
    }
}

function getGradientImageSrc(gradientId) {
    if (!gradientId) return null;

    switch (gradientId) {
        case "degrade1":
            return "/degrades/degrade1.jpg";
        case "degrade2":
            return "/degrades/degrade2.jpg";
        case "degrade3":
            return "/degrades/degrade3.jpg";
        default:
            return null;
    }
}

function getViewImage(product, view) {
    const images = Array.isArray(product?.images) ? product.images : [];

    if (!images.length) {
        return product?.main_image || null;
    }

    if (view === "back") {
        return images[1]?.url || images[0]?.url || product?.main_image || null;
    }

    return images[0]?.url || product?.main_image || null;
}

function getTemplateConfig(templateId, view) {
    if (view === "back") {
        return {
            printZone: { x: 272, y: 205, width: 215, height: 238 },
            designZone: { x: 272, y: 118, width: 205, height: 376 },
            logo: { x: 245, y: 220, width: 64, height: 64 },
        };
    }

    if (templateId === "clean-front-template") {
        return {
            printZone: { x: 300, y: 220, width: 165, height: 135 },
            designZone: { x: 278, y: 118, width: 200, height: 372 },
            logo: { x: 286, y: 205, width: 42, height: 42 },
        };
    }

    return {
        printZone: { x: 268, y: 224, width: 225, height: 162 },
        designZone: { x: 274, y: 118, width: 208, height: 380 },
        logo: { x: 245, y: 220, width: 64, height: 64 },
    };
}

function getTemplateDecor(templateId, view, textColor) {
    if (view === "back") return null;

    if (templateId === "clean-front-template") {
        return {
            type: "minimal",
            accentColor:
                textColor === "#ffffff"
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(17,17,17,0.08)",
            lineColor:
                textColor === "#ffffff"
                    ? "rgba(255,255,255,0.42)"
                    : "rgba(17,17,17,0.22)",
        };
    }

    return {
        type: "classic",
        stripeColor:
            textColor === "#ffffff"
                ? "rgba(255,255,255,0.14)"
                : "rgba(17,17,17,0.06)",
        borderColor:
            textColor === "#ffffff"
                ? "rgba(255,255,255,0.22)"
                : "rgba(17,17,17,0.12)",
    };
}

export default function CustomizationPreview({
                                                 product,
                                                 configuration,
                                                 onPlayerNamePositionChange,
                                                 onPlayerNumberPositionChange,
                                                 onLogoPositionChange,
                                                 onTextLayerPositionChange,
                                             }) {
    const width = 760;
    const height = 760;

    const currentView = configuration?.view || "front";
    const currentImageSrc = useMemo(
        () => getViewImage(product, currentView),
        [product, currentView]
    );

    const productImage = useHtmlImage(currentImageSrc);
    const logoImage = useHtmlImage(
        configuration?.logo?.enabled ? configuration?.logo?.src : null
    );

    const textLayers = Array.isArray(configuration?.text_layers)
        ? configuration.text_layers
        : [];

    const playerName =
        typeof configuration?.player_name?.value === "string"
            ? configuration.player_name.value.trim()
            : "";

    const playerNumber =
        typeof configuration?.player_number?.value === "string"
            ? configuration.player_number.value.trim()
            : "";

    const templateConfig = getTemplateConfig(configuration?.template_id, currentView);
    const printZone = templateConfig.printZone;
    const designZone = templateConfig.designZone;

    const logoX = configuration?.logo?.x ?? templateConfig.logo.x;
    const logoY = configuration?.logo?.y ?? templateConfig.logo.y;
    const logoWidth = configuration?.logo?.width ?? templateConfig.logo.width;
    const logoHeight = configuration?.logo?.height ?? templateConfig.logo.height;

    const textColor = configuration?.text_style?.color || "#111111";
    const decor = getTemplateDecor(configuration?.template_id, currentView, textColor);

    const currentStyle = configuration?.style?.[currentView] || {
        pattern: { enabled: false, id: null },
        gradient: { enabled: false, id: null },
    };

    const patternImageSrc = getPatternImageSrc(
        currentStyle?.pattern?.enabled ? currentStyle?.pattern?.id : null
    );

    const gradientImageSrc = getGradientImageSrc(
        currentStyle?.gradient?.enabled ? currentStyle?.gradient?.id : null
    );

    const patternImage = useHtmlImage(patternImageSrc);
    const gradientImage = useHtmlImage(gradientImageSrc);

    return (
        <div className="pc-preview-card">
            <div className="pc-preview-toolbar">
                <div className="pc-preview-toolbar-left">
                    <span className="pc-preview-badge">Aperçu 2D</span>
                    <span className="pc-preview-zone-label">
                        {currentView === "front" ? "Zone avant" : "Zone arrière"}
                    </span>
                </div>

                <span className="pc-preview-subtle">
                    Évolution prévue vers configurateur 3D
                </span>
            </div>

            <div className="pc-preview-stage">
                <Stage width={width} height={height}>
                    <Layer>
                        <Rect
                            x={0}
                            y={0}
                            width={width}
                            height={height}
                            cornerRadius={24}
                        />

                        {productImage ? (
                            <KonvaImage
                                image={productImage}
                                x={130}
                                y={30}
                                width={500}
                                height={690}
                            />
                        ) : (
                            <Rect
                                x={130}
                                y={30}
                                width={500}
                                height={690}
                                cornerRadius={24}
                            />
                        )}

                        {currentStyle?.gradient?.enabled && gradientImage && (
                            <Rect
                                x={designZone.x}
                                y={designZone.y}
                                width={designZone.width}
                                height={designZone.height}
                                cornerRadius={34}
                                fillPatternImage={gradientImage}
                                fillPatternRepeat="no-repeat"
                                fillPatternScaleX={designZone.width / gradientImage.width}
                                fillPatternScaleY={designZone.height / gradientImage.height}
                                opacity={0.35}
                            />
                        )}

                        {currentStyle?.pattern?.enabled && patternImage && (
                            <Rect
                                x={designZone.x}
                                y={designZone.y}
                                width={designZone.width}
                                height={designZone.height}
                                cornerRadius={34}
                                fillPatternImage={patternImage}
                                fillPatternRepeat="repeat"
                                opacity={0.22}
                            />
                        )}

                        {decor?.type === "classic" && (
                            <Group>
                                <Rect
                                    x={250}
                                    y={242}
                                    width={260}
                                    height={22}
                                    cornerRadius={14}
                                    fill={decor.stripeColor}
                                />
                                <Rect
                                    x={250}
                                    y={296}
                                    width={260}
                                    height={22}
                                    cornerRadius={14}
                                    fill={decor.stripeColor}
                                />
                                <Rect
                                    x={250}
                                    y={350}
                                    width={260}
                                    height={22}
                                    cornerRadius={14}
                                    fill={decor.stripeColor}
                                />
                                <Line
                                    points={[250, 242, 510, 242, 510, 372, 250, 372, 250, 242]}
                                    closed
                                    stroke={decor.borderColor}
                                    strokeWidth={2}
                                />
                            </Group>
                        )}

                        {decor?.type === "minimal" && (
                            <Group>
                                <Rect
                                    x={334}
                                    y={170}
                                    width={92}
                                    height={265}
                                    cornerRadius={24}
                                    fill={decor.accentColor}
                                />
                                <Line
                                    points={[380, 170, 380, 435]}
                                    stroke={decor.lineColor}
                                    strokeWidth={2}
                                />
                                <Line
                                    points={[322, 448, 438, 448]}
                                    stroke={decor.lineColor}
                                    strokeWidth={2}
                                />
                            </Group>
                        )}

                        <Rect
                            x={printZone.x}
                            y={printZone.y}
                            width={printZone.width}
                            height={printZone.height}
                            cornerRadius={16}
                            dash={[8, 8]}
                        />

                        {configuration?.logo?.enabled && currentView === "front" && (
                            logoImage ? (
                                <KonvaImage
                                    image={logoImage}
                                    x={logoX}
                                    y={logoY}
                                    width={logoWidth}
                                    height={logoHeight}
                                    draggable
                                    onDragEnd={(e) =>
                                        onLogoPositionChange?.({
                                            x: e.target.x(),
                                            y: e.target.y(),
                                        })
                                    }
                                />
                            ) : (
                                <Rect
                                    x={logoX}
                                    y={logoY}
                                    width={logoWidth}
                                    height={logoHeight}
                                    cornerRadius={8}
                                    draggable
                                    onDragEnd={(e) =>
                                        onLogoPositionChange?.({
                                            x: e.target.x(),
                                            y: e.target.y(),
                                        })
                                    }
                                />
                            )
                        )}

                        {currentView === "back" && playerNumber && (
                            <Text
                                x={configuration.player_number.x}
                                y={configuration.player_number.y}
                                width={120}
                                align="center"
                                text={playerNumber}
                                fontSize={84}
                                fontStyle="bold"
                                fontFamily="Arial"
                                fill={configuration.player_number.color || "#111111"}
                                draggable
                                onDragEnd={(e) =>
                                    onPlayerNumberPositionChange?.({
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }
                            />
                        )}

                        {currentView === "back" && playerName && (
                            <Text
                                x={configuration.player_name.x}
                                y={configuration.player_name.y}
                                width={220}
                                align="center"
                                text={playerName.toUpperCase()}
                                fontSize={28}
                                fontStyle="bold"
                                fontFamily="Arial"
                                fill={configuration.player_name.color || "#111111"}
                                draggable
                                onDragEnd={(e) =>
                                    onPlayerNamePositionChange?.({
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }
                            />
                        )}

                        {textLayers.map((layer, index) => (
                            <Text
                                key={`${layer.text}-${index}`}
                                x={layer.x ?? printZone.x + 20}
                                y={layer.y ?? printZone.y + 30}
                                text={layer.text}
                                fontSize={layer.size ?? 28}
                                fontFamily={layer.font ?? "Arial"}
                                fill={layer.color ?? "#111111"}
                                rotation={layer.rotation ?? 0}
                                draggable
                                onDragEnd={(e) =>
                                    onTextLayerPositionChange?.(index, {
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}