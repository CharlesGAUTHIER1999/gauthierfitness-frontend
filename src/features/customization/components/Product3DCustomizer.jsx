import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../../../context/CartContext";
import {
    createCustomizationSession,
    generateAiDesign,
    uploadCustomizationLogo,
    uploadCustomizationImage
} from "../services/customizationService";
import {createDefaultCustomization} from "../utils/defaultCustomization";
import {getProductCustomizer3DConfig} from "../utils/productCustomizerConfigs";
import CustomizationCanvas3D from "./CustomizationCanvas3D";
import CustomizationPanel from "./CustomizationPanel";

// Base colors available for the 3D configurator
const COLOR_SWATCHES_3D = [
    {label: "Bleu fitness", value: "#1d4ed8"},
    {label: "Noir", value: "#111111"},
    {label: "Blanc", value: "#f9fafb"},
    {label: "Rouge", value: "#dc2626"},
    {label: "Vert", value: "#16a34a"},
    {label: "Marine", value: "#1e3a5f"},
    {label: "Gris anthracite", value: "#374151"},
    {label: "Bordeaux", value: "#7f1d1d"},
];

// Returns the style block for a given view, or a default disabled style if missing.
function ensureViewStyle(style, view) {
    return (
        style?.[view] || {
            pattern: {enabled: false, id: null},
            gradient: {enabled: false, id: null},
        }
    );
}

// Builds the default customization state for the 3D configurator, seeded with the first available 3D color swatch.
function createDefault3DCustomization(product) {
    const base = createDefaultCustomization(product);

    return {
        ...base,
        product_color_hex: COLOR_SWATCHES_3D[0].value,
    };
}

// Top-level 3D product customizer : owns configuration state and orchestrates the 3D canvas + side panel, plus save/checkout flow.
export default function Product3DCustomizer({
                                                product,
                                                selectedOptionId = null,
                                                selectedOptionMeta = null,
                                                disabled = false,
                                            }) {
    const navigate = useNavigate();
    const {addItem} = useCart();
    const [configuration, setConfiguration] = useState(() => createDefault3DCustomization(product));
    const [session, setSession] = useState(null);
    const [saving, setSaving] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [uploadLogoLoading, setUploadLogoLoading] = useState(false);
    const [uploadLogoError, setUploadLogoError] = useState(null);
    const [uploadImageLoading, setUploadImageLoading] = useState(false);
    const [uploadImageError, setUploadImageError] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const hasSavedSession = useMemo(() => !!session?.id, [session]);

    // 3D config of the current product (GLB, UV zones, template chest center).
    const model3d = useMemo(
        () => getProductCustomizer3DConfig(product),
        [product]
    );

    useEffect(() => {
        setConfiguration(createDefault3DCustomization(product));
        setSession(null);
        setError(null);
        setSuccessMessage("");
    }, [product]);

    useEffect(() => {
        setSession(null);
        setSuccessMessage("");
    }, [selectedOptionId]);

    // Clears session
    function invalidateSavedSession() {
        setSession(null);
        setSuccessMessage("");
    }

    // ---- Handlers ----
    // Navigates to another color/variants customize page, preserving the selected option.
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

    function handleColorHexChange(hex) {
        setConfiguration((prev) => ({...prev, product_color_hex: hex}));
        invalidateSavedSession();
    }

    function handleTemplateChange(templateId) {
        setConfiguration((prev) => ({...prev, template_id: templateId}));
        invalidateSavedSession();
    }

    function handleViewChange(view) {
        setConfiguration((prev) => ({...prev, view}));
        invalidateSavedSession();
    }

    function handleTextColorChange(color) {
        setConfiguration((prev) => ({
            ...prev,
            text_style: {...prev.text_style, color},
            player_name: {...prev.player_name, color},
            player_number: {...prev.player_number, color},
            text_layers: (prev.text_layers || []).map((l) => ({...l, color})),
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
            player_name: {...prev.player_name, value},
        }));

        invalidateSavedSession();
    }

    function handlePlayerNumberChange(value) {
        setConfiguration((prev) => ({
            ...prev,
            player_number: {...prev.player_number, value},
        }));

        invalidateSavedSession();
    }

    function handleToggleLogo(enabled) {
        setConfiguration((prev) => ({
            ...prev,
            logo: {...prev.logo, enabled},
        }));

        invalidateSavedSession();
    }

    function handleLogoSelect(src) {
        setConfiguration((prev) => ({
            ...prev,
            logo: {...prev.logo, src},
        }));

        invalidateSavedSession();
    }

    function handleRemoveLogo() {
        setConfiguration((prev) => ({
            ...prev,
            logo: {...prev.logo, enabled: false, src: ""},
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
                logo: {...prev.logo, enabled: true, src: uploaded?.url || ""},
            }));

            invalidateSavedSession();
        } catch (e) {
            setUploadLogoError(
                e?.response?.data?.message || "Impossible d'importer le logo."
            );
        } finally {
            setUploadLogoLoading(false);
        }
    }

    async function handleUploadImage(file) {
        try {
            setUploadImageLoading(true);
            setUploadImageError(null);

            const uploaded = await uploadCustomizationImage(file);
            const currentView = configuration?.view || "front";

            setConfiguration((prev) => ({
                ...prev,
                image_layers: [
                    ...(Array.isArray(prev.image_layers) ? prev.image_layers : []),
                    {
                        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        src: uploaded?.url || "",
                        original_name: uploaded?.original_name || file.name,
                        view: currentView,
                        x: 325,
                        y: 285,
                        width: 90,
                        height: 90,
                        rotation: 0,
                        uv: {x: 0.45, y: 0.25},
                        size: {w: 0.05, h: 0.05},
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
            image_layers: (prev.image_layers || []).filter((l) => l.id !== layerId),
        }));

        invalidateSavedSession();
    }

    async function handleGenerateAiDesign(prompt) {
        if (disabled) {
            setAiError("Veuillez d'abord sélectionner l'option requise.");
            return false;
        }

        try {
            setAiLoading(true);
            setAiError(null);

            const design = await generateAiDesign({
                productId: product.id,
                productOptionId: selectedOptionId,
                prompt,
            });

            const currentView = configuration?.view || "front";

            setConfiguration((prev) => ({
                ...prev,
                image_layers: [
                    ...(Array.isArray(prev.image_layers) ? prev.image_layers : []),
                    {
                        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        src: design?.preview_url || "",
                        original_name: design?.name || "Design IA",
                        design_id: design?.id ?? null,
                        view: currentView,
                        x: 325,
                        y: 285,
                        width: 90,
                        height: 90,
                        rotation: 0,
                        uv: {x: 0.45, y: 0.25},
                        size: {w: 0.05, h: 0.05},
                    },
                ],
            }));
            invalidateSavedSession();
            return true;
        } catch (e) {
            setAiError(
                e?.response?.data?.message ||
                "Impossible de générer le design."
            );
            return false;
        } finally {
            setAiLoading(false);
        }
    }

    // Handlers for UV drag & drop of layers on the 3D t-shirt
    function handleUpdateTextLayer(layerId, patch) {
        setConfiguration((prev) => ({
            ...prev,
            text_layers: (prev.text_layers || []).map((l) =>
                l.id === layerId ? {...l, ...patch} : l
            ),
        }));
    }

    // Applies a UV/patch update to an image layer during drag
    function handleUpdateImageLayer(layerId, patch) {
        setConfiguration((prev) => ({
            ...prev,
            image_layers: (prev.image_layers || []).map((l) =>
                l.id === layerId ? {...l, ...patch} : l
            ),
        }));
    }

    // Drag of the logo, player name, player number ("system" elements)
    function handleUpdateLogoUV(uv) {
        setConfiguration((prev) => ({
            ...prev,
            logo: {...(prev.logo || {}), uv},
        }));
    }

    function handleUpdatePlayerNameUV(uv) {
        setConfiguration((prev) => ({
            ...prev,
            player_name: {...(prev.player_name || {}), uv},
        }));
    }

    function handleUpdatePlayerNumberUV(uv) {
        setConfiguration((prev) => ({
            ...prev,
            player_number: {...(prev.player_number || {}), uv},
        }));
    }

    function handleDragEnd() {
        // Invalidate the session only once, at the end of the drag
        invalidateSavedSession();
    }

    function handlePatternToggle(enabled) {
        setConfiguration((prev) => {
            const view = prev.view || "front";
            const current = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...current,
                        pattern: {
                            enabled,
                            id: enabled ? current.pattern?.id || "motif1" : null,
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
            const current = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...current,
                        pattern: {enabled: true, id: patternId},
                    },
                },
            };
        });

        invalidateSavedSession();
    }

    function handleGradientToggle(enabled) {
        setConfiguration((prev) => {
            const view = prev.view || "front";
            const current = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...current,
                        gradient: {
                            enabled,
                            id: enabled ? current.gradient?.id || "degrade1" : null,
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
            const current = ensureViewStyle(prev.style, view);

            return {
                ...prev,
                style: {
                    ...prev.style,
                    [view]: {
                        ...current,
                        gradient: {enabled: true, id: gradientId},
                    },
                },
            };
        });

        invalidateSavedSession();
    }

    function handleResetConfiguration() {
        setConfiguration(createDefault3DCustomization(product));
        setSession(null);
        setError(null);
        setSuccessMessage("");
        setUploadLogoError(null);
        setUploadImageError(null);
        setAiError(null);
    }

    // Persists the current configuration as a customization session on the backend.
    async function saveCustomization() {
        if (disabled) {
            setError("Veuillez d'abord sélectionner l'option requise.");
            return null;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage("");

            const createdSession = await createCustomizationSession({
                productId: product.id,
                productOptionId: selectedOptionId,
                configuration,
                previewImagePath: null,
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

    // Ensures the session is saved, adds the item to the cart, then goes to checkout.
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

                {/* 3D canvas : no more top bar, swatches are in the right-hand panel */}
                <CustomizationCanvas3D
                    configuration={configuration}
                    model3d={model3d}
                    onUpdateTextLayer={handleUpdateTextLayer}
                    onUpdateImageLayer={handleUpdateImageLayer}
                    onUpdateLogoUV={handleUpdateLogoUV}
                    onUpdatePlayerNameUV={handleUpdatePlayerNameUV}
                    onUpdatePlayerNumberUV={handleUpdatePlayerNumberUV}
                    onDragEnd={handleDragEnd}
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
                onGenerateAiDesign={handleGenerateAiDesign}
                aiLoading={aiLoading}
                aiError={aiError}
                onPatternToggle={handlePatternToggle}
                onPatternSelect={handlePatternSelect}
                onGradientToggle={handleGradientToggle}
                onGradientSelect={handleGradientSelect}
                onProductColorChange={handleColorHexChange}
                onResetConfiguration={handleResetConfiguration}
                onSave={handleSaveCustomization}
                onFinish={handleFinishConfiguration}
                saving={saving}
                finishing={finishing}
                disabled={disabled}
                hasSavedSession={hasSavedSession}
                mode="3d"
            />
        </section>
    );
}