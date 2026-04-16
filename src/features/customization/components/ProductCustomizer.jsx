import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import {
    createCustomizationSession,
    uploadCustomizationImage,
    uploadCustomizationLogo,
} from "../services/customizationService";
import { createDefaultCustomization } from "../utils/defaultCustomization";
import { getProductCustomizerConfig } from "../utils/productCustomizerConfigs";
import CustomizationPanel from "./CustomizationPanel";
import CustomizationPreview from "./CustomizationPreview";

function ensureViewStyle(style, view) {
    return (
        style?.[view] || {
            pattern: { enabled: false, id: null },
            gradient: { enabled: false, id: null },
        }
    );
}

function getProductImageUrl(image) {
    if (!image) return null;
    if (typeof image === "string") return image;
    return image.full_url || image.url || null;
}

function getDefaultImageLayerPosition(view) {
    if (view === "back") {
        return {
            x: 315,
            y: 255,
            width: 90,
            height: 90,
        };
    }

    return {
        x: 325,
        y: 285,
        width: 90,
        height: 90,
    };
}

export default function ProductCustomizer({
                                              product,
                                              selectedOptionId = null,
                                              selectedOptionMeta = null,
                                              disabled = false,
                                          }) {
    const navigate = useNavigate();
    const { addItem } = useCart();

    const productCustomizerConfig = useMemo(
        () => getProductCustomizerConfig(product),
        [product]
    );

    const [configuration, setConfiguration] = useState(() =>
        createDefaultCustomization(product)
    );
    const [session, setSession] = useState(null);
    const [saving, setSaving] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [uploadLogoLoading, setUploadLogoLoading] = useState(false);
    const [uploadLogoError, setUploadLogoError] = useState(null);
    const [uploadImageLoading, setUploadImageLoading] = useState(false);
    const [uploadImageError, setUploadImageError] = useState(null);

    const hasSavedSession = useMemo(() => !!session?.id, [session]);

    useEffect(() => {
        setConfiguration(createDefaultCustomization(product));
        setSession(null);
        setError(null);
        setSuccessMessage("");
        setUploadLogoError(null);
        setUploadImageError(null);
    }, [product?.id]);

    useEffect(() => {
        setSession(null);
        setSuccessMessage("");
    }, [selectedOptionId]);

    function invalidateSavedSession() {
        setSession(null);
        setSuccessMessage("");
    }

    function handleVariantSelect(variantSlug) {
        if (!variantSlug || variantSlug === product?.slug) return;

        navigate(`/products/${variantSlug}/customize`, {
            state: {
                selectedOptionId,
                selectedOptionType: selectedOptionMeta?.type ?? null,
                selectedOptionCode: selectedOptionMeta?.code ?? null,
                selectedOptionLabel: selectedOptionMeta?.label ?? null,
            },
        });
    }

    function handleTemplateChange(templateId) {
        setConfiguration((prev) => ({
            ...prev,
            template_id: templateId,
        }));
        invalidateSavedSession();
    }

    function handleViewChange(view) {
        setConfiguration((prev) => ({
            ...prev,
            view,
        }));
        invalidateSavedSession();
    }

    function handleTextColorChange(color) {
        setConfiguration((prev) => ({
            ...prev,
            text_style: {
                ...prev.text_style,
                color,
            },
            player_name: {
                ...prev.player_name,
                color,
            },
            player_number: {
                ...prev.player_number,
                color,
            },
            text_layers: (prev.text_layers || []).map((layer) => ({
                ...layer,
                color,
            })),
        }));
        invalidateSavedSession();
    }

    function handleAddTextLayer(textLayer) {
        setConfiguration((prev) => ({
            ...prev,
            text_layers: [...(prev.text_layers || []), textLayer],
        }));
        invalidateSavedSession();
    }

    function handlePlayerNameChange(value) {
        setConfiguration((prev) => ({
            ...prev,
            player_name: {
                ...prev.player_name,
                value,
            },
        }));
        invalidateSavedSession();
    }

    function handlePlayerNumberChange(value) {
        setConfiguration((prev) => ({
            ...prev,
            player_number: {
                ...prev.player_number,
                value,
            },
        }));
        invalidateSavedSession();
    }

    function handleToggleLogo(enabled) {
        setConfiguration((prev) => ({
            ...prev,
            logo: {
                ...prev.logo,
                enabled,
            },
        }));
        invalidateSavedSession();
    }

    function handleLogoSelect(src) {
        setConfiguration((prev) => ({
            ...prev,
            logo: {
                ...prev.logo,
                src,
            },
        }));
        invalidateSavedSession();
    }

    function handleRemoveLogo() {
        setConfiguration((prev) => ({
            ...prev,
            logo: {
                ...prev.logo,
                enabled: false,
                src: "",
            },
        }));
        invalidateSavedSession();
    }

    async function handleUploadLogo(file) {
        try {
            setUploadLogoLoading(true);
            setUploadLogoError(null);

            const uploaded = await uploadCustomizationLogo(file);

            setConfiguration((prev) => ({
                ...prev,
                logo: {
                    ...prev.logo,
                    enabled: true,
                    src: uploaded?.url || "",
                },
            }));

            invalidateSavedSession();
        } catch (e) {
            setUploadLogoError(
                e?.response?.data?.message ||
                "Impossible d'importer le logo."
            );
        } finally {
            setUploadLogoLoading(false);
        }
    }

    async function handleUploadImage(file) {
        try {
            setUploadImageLoading(true);
            setUploadImageError(null);

            setConfiguration((prev) => {
                const existingLayers = Array.isArray(prev.image_layers) ? prev.image_layers : [];
                if (existingLayers.length >= 3) {
                    throw new Error("Maximum 3 images libres autorisées.");
                }
                return prev;
            });

            const uploaded = await uploadCustomizationImage(file);
            const currentView = configuration?.view || "front";
            const defaults = getDefaultImageLayerPosition(currentView);

            setConfiguration((prev) => ({
                ...prev,
                image_layers: [
                    ...(Array.isArray(prev.image_layers) ? prev.image_layers : []),
                    {
                        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        src: uploaded?.url || "",
                        original_name: uploaded?.original_name || file.name,
                        view: currentView,
                        x: defaults.x,
                        y: defaults.y,
                        width: defaults.width,
                        height: defaults.height,
                        rotation: 0,
                    },
                ],
            }));

            invalidateSavedSession();
        } catch (e) {
            setUploadImageError(
                e?.message ||
                e?.response?.data?.message ||
                "Impossible d'importer l'image."
            );
        } finally {
            setUploadImageLoading(false);
        }
    }

    function handleRemoveImageLayer(layerId) {
        setConfiguration((prev) => ({
            ...prev,
            image_layers: (prev.image_layers || []).filter((layer) => layer.id !== layerId),
        }));
        invalidateSavedSession();
    }

    function handleResetConfiguration() {
        setConfiguration(createDefaultCustomization(product));
        setSession(null);
        setError(null);
        setSuccessMessage("");
        setUploadLogoError(null);
        setUploadImageError(null);
    }

    function handlePlayerNamePositionChange(position) {
        setConfiguration((prev) => ({
            ...prev,
            player_name: {
                ...prev.player_name,
                ...position,
            },
        }));
        invalidateSavedSession();
    }

    function handlePlayerNumberPositionChange(position) {
        setConfiguration((prev) => ({
            ...prev,
            player_number: {
                ...prev.player_number,
                ...position,
            },
        }));
        invalidateSavedSession();
    }

    function handleLogoPositionChange(position) {
        setConfiguration((prev) => ({
            ...prev,
            logo: {
                ...prev.logo,
                ...position,
            },
        }));
        invalidateSavedSession();
    }

    function handleTextLayerPositionChange(index, position) {
        setConfiguration((prev) => ({
            ...prev,
            text_layers: (prev.text_layers || []).map((layer, i) =>
                i === index ? { ...layer, ...position } : layer
            ),
        }));
        invalidateSavedSession();
    }

    function handleImageLayerPositionChange(index, position) {
        const currentView = configuration?.view || "front";

        setConfiguration((prev) => {
            let visibleIndex = -1;

            return {
                ...prev,
                image_layers: (prev.image_layers || []).map((layer) => {
                    const layerView = layer?.view || "front";
                    if (layerView === currentView) {
                        visibleIndex += 1;
                    }

                    if (layerView === currentView && visibleIndex === index) {
                        return { ...layer, ...position };
                    }

                    return layer;
                }),
            };
        });

        invalidateSavedSession();
    }

    function handlePatternToggle(enabled) {
        setConfiguration((prev) => {
            const view = prev.view || "front";
            const currentViewStyle = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...currentViewStyle,
                        pattern: {
                            enabled,
                            id: enabled
                                ? currentViewStyle.pattern?.id || "motif1"
                                : null,
                        },
                    },
                },
            };
        });
        invalidateSavedSession();
    }

    function handlePatternSelect(patternId) {
        setConfiguration((prev) => {
            const view = prev.view || "front";
            const currentViewStyle = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...currentViewStyle,
                        pattern: {
                            enabled: true,
                            id: patternId,
                        },
                    },
                },
            };
        });
        invalidateSavedSession();
    }

    function handleGradientToggle(enabled) {
        setConfiguration((prev) => {
            const view = prev.view || "front";
            const currentViewStyle = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...currentViewStyle,
                        gradient: {
                            enabled,
                            id: enabled
                                ? currentViewStyle.gradient?.id || "degrade1"
                                : null,
                        },
                    },
                },
            };
        });
        invalidateSavedSession();
    }

    function handleGradientSelect(gradientId) {
        setConfiguration((prev) => {
            const view = prev.view || "front";
            const currentViewStyle = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...currentViewStyle,
                        gradient: {
                            enabled: true,
                            id: gradientId,
                        },
                    },
                },
            };
        });
        invalidateSavedSession();
    }

    async function saveCustomization() {
        if (disabled) {
            setError("Veuillez d'abord sélectionner l'option requise.");
            return null;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage("");

            const fallbackPreviewPath =
                getProductImageUrl(product?.main_image) || null;

            const createdSession = await createCustomizationSession({
                productId: product.id,
                productOptionId: selectedOptionId,
                configuration,
                previewImagePath: fallbackPreviewPath,
            });

            setSession(createdSession);
            setSuccessMessage("Configuration enregistrée.");
            return createdSession;
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                "Impossible d'enregistrer la personnalisation."
            );
            return null;
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveCustomization() {
        await saveCustomization();
    }

    async function handleFinishConfiguration() {
        if (disabled) {
            setError("Veuillez d'abord sélectionner l'option requise.");
            return;
        }

        try {
            setFinishing(true);
            setError(null);

            let currentSession = session;

            if (!currentSession?.id) {
                currentSession = await saveCustomization();
            }

            if (!currentSession?.id) {
                setFinishing(false);
                return;
            }

            await addItem({
                productId: product.id,
                optionId: selectedOptionId,
                quantity: 1,
                customProductSessionId: currentSession.id,
            });

            navigate("/checkout");
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                "Impossible de terminer la configuration."
            );
        } finally {
            setFinishing(false);
        }
    }

    return (
        <section className="pc-layout">
            <div className="pc-main">
                {error && (
                    <div className="pc-alert pc-alert-error" role="alert">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="pc-alert pc-alert-success" role="status">
                        {successMessage}
                    </div>
                )}

                <CustomizationPreview
                    product={product}
                    configuration={configuration}
                    onPlayerNamePositionChange={handlePlayerNamePositionChange}
                    onPlayerNumberPositionChange={handlePlayerNumberPositionChange}
                    onLogoPositionChange={handleLogoPositionChange}
                    onTextLayerPositionChange={handleTextLayerPositionChange}
                    onImageLayerPositionChange={handleImageLayerPositionChange}
                />
            </div>

            <CustomizationPanel
                product={product}
                configuration={configuration}
                variants={Array.isArray(product?.variants) ? product.variants : []}
                currentVariantSlug={product?.slug}
                onVariantSelect={handleVariantSelect}
                onTemplateChange={handleTemplateChange}
                onViewChange={handleViewChange}
                onAddTextLayer={handleAddTextLayer}
                onPlayerNameChange={handlePlayerNameChange}
                onPlayerNumberChange={handlePlayerNumberChange}
                onToggleLogo={handleToggleLogo}
                onTextColorChange={handleTextColorChange}
                onLogoSelect={handleLogoSelect}
                onUploadLogo={handleUploadLogo}
                uploadLogoLoading={uploadLogoLoading}
                uploadLogoError={uploadLogoError}
                onRemoveLogo={handleRemoveLogo}
                onUploadImage={handleUploadImage}
                uploadImageLoading={uploadImageLoading}
                uploadImageError={uploadImageError}
                onRemoveImageLayer={handleRemoveImageLayer}
                onPatternToggle={handlePatternToggle}
                onPatternSelect={handlePatternSelect}
                onGradientToggle={handleGradientToggle}
                onGradientSelect={handleGradientSelect}
                onResetConfiguration={handleResetConfiguration}
                onSave={handleSaveCustomization}
                onFinish={handleFinishConfiguration}
                saving={saving}
                finishing={finishing}
                disabled={disabled}
                hasSavedSession={hasSavedSession}
            />
        </section>
    );
}