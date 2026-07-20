import {useEffect, useMemo, useRef} from "react";
import {useNavigate, useNavigationType} from "react-router-dom";
import {useCart} from "../../../context/CartContext";
import {generateAiDesign, uploadCustomizationImage} from "../services/customizationService";
import {createDefaultCustomization} from "../utils/defaultCustomization";
import {getProductCustomizer3DConfig} from "../utils/productCustomizerConfigs";
import {useCustomizationEditorBase} from "../hooks/useCustomizationEditorBase";
import {useCustomizationSubmission} from "../hooks/useCustomizationSubmission";
import CustomizationCanvas3D from "./CustomizationCanvas3D";
import CustomizationPanel from "./CustomizationPanel";

// Base colors available for 3D configurator
const COLOR_SWATCHES_3D = [{label: "Bleu fitness", value: "#1d4ed8"}, {
    label: "Noir", value: "#111111"
}, {label: "Blanc", value: "#f9fafb"}, {label: "Rouge", value: "#dc2626"}, {
    label: "Vert", value: "#16a34a"
}, {label: "Marine", value: "#1e3a5f"}, {label: "Gris anthracite", value: "#374151"}, {
    label: "Bordeaux", value: "#7f1d1d"
},];

// Builds default customization state for 3D configurator
function createDefault3DCustomization(product) {
    const base = createDefaultCustomization(product);

    return {
        ...base, product_color_hex: COLOR_SWATCHES_3D[0].value,
    };
}

// Top-level 3D product customizer
export default function Product3DCustomizer({
                                                product,
                                                selectedOptionId = null,
                                                selectedOptionMeta = null,
                                                disabled = false,
                                            }) {
    const navigate = useNavigate();
    const navigationType = useNavigationType();
    const {items, remove} = useCart();
    const resumedFromCartRef = useRef(false);

    const {
        configuration,
        setConfiguration,
        session,
        setSession,
        saving,
        setSaving,
        finishing,
        setFinishing,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        uploadLogoLoading,
        setUploadLogoLoading,
        uploadLogoError,
        setUploadLogoError,
        uploadImageLoading,
        setUploadImageLoading,
        uploadImageError,
        setUploadImageError,
        aiLoading,
        setAiLoading,
        aiError,
        setAiError,
        invalidateSavedSession,
        handleTemplateChange,
        handleViewChange,
        handleTextColorChange,
        handleAddTextLayer,
        handlePlayerNameChange,
        handlePlayerNumberChange,
        handleToggleLogo,
        handleLogoSelect,
        handleRemoveLogo,
        handleRemoveImageLayer,
        handlePatternToggle,
        handlePatternSelect,
        handleGradientToggle,
        handleGradientSelect,
        handleResetConfiguration,
    } = useCustomizationEditorBase(product, selectedOptionId, createDefault3DCustomization);

    const {handleUploadLogo, handleSaveCustomization, handleAddToCart} = useCustomizationSubmission({
        product,
        selectedOptionId,
        configuration,
        setConfiguration,
        disabled,
        session,
        setSession,
        setSaving,
        setFinishing,
        setError,
        setSuccessMessage,
        setUploadLogoLoading,
        setUploadLogoError,
        invalidateSavedSession,
    });

    // 3D config of the current product
    const model3d = useMemo(() => getProductCustomizer3DConfig(product), [product]);

    useEffect(() => {
        if (navigationType !== "POP" || resumedFromCartRef.current) return;

        const existingItem = items.find((it) => Number(it.productId) === Number(product?.id) && Number(it.optionId) === Number(selectedOptionId) && it.customProductSessionId);

        if (!existingItem) return;
        resumedFromCartRef.current = true;
        setConfiguration(existingItem.customization?.configuration || createDefault3DCustomization(product));
        setSession({id: existingItem.customProductSessionId});
        void remove(existingItem);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, navigationType, product?.id, selectedOptionId]);

    // ---- Handlers ----
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

    async function handleUploadImage(file) {
        try {
            setUploadImageLoading(true);
            setUploadImageError(null);

            const uploaded = await uploadCustomizationImage(file);
            const currentView = configuration?.view || "front";

            setConfiguration((prev) => ({
                ...prev, image_layers: [...(Array.isArray(prev.image_layers) ? prev.image_layers : []), {
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
                },],
            }));

            invalidateSavedSession();
        } catch (e) {
            setUploadImageError(e?.message || e?.response?.data?.message || "Impossible d'importer l'image.");
        } finally {
            setUploadImageLoading(false);
        }
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
                productId: product.id, productOptionId: selectedOptionId, prompt,
            });

            const currentView = configuration?.view || "front";

            setConfiguration((prev) => ({
                ...prev, image_layers: [...(Array.isArray(prev.image_layers) ? prev.image_layers : []), {
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
                },],
            }));
            invalidateSavedSession();
            return true;
        } catch (e) {
            setAiError(e?.response?.data?.message || "Impossible de générer le design.");
            return false;
        } finally {
            setAiLoading(false);
        }
    }

    // Handlers for UV drag & drop of layers on the 3D t-shirt
    function handleUpdateTextLayer(layerId, patch) {
        setConfiguration((prev) => ({
            ...prev, text_layers: (prev.text_layers || []).map((l) => l.id === layerId ? {...l, ...patch} : l),
        }));
    }

    // Applies a UV/patch update to image layer
    function handleUpdateImageLayer(layerId, patch) {
        setConfiguration((prev) => ({
            ...prev, image_layers: (prev.image_layers || []).map((l) => l.id === layerId ? {...l, ...patch} : l),
        }));
    }

    // Drag of the logo, player name, player number ("system" elements)
    function handleUpdateLogoUV(uv) {
        setConfiguration((prev) => ({
            ...prev, logo: {...(prev.logo || {}), uv},
        }));
    }

    function handleUpdatePlayerNameUV(uv) {
        setConfiguration((prev) => ({
            ...prev, player_name: {...(prev.player_name || {}), uv},
        }));
    }

    function handleUpdatePlayerNumberUV(uv) {
        setConfiguration((prev) => ({
            ...prev, player_number: {...(prev.player_number || {}), uv},
        }));
    }

    function handleDragEnd() {
        invalidateSavedSession();
    }

    return (<section className="pc-layout">
        <div className="pc-main">
            {error && (<div className="pc-alert pc-alert-error" role="alert">
                {error}
            </div>)}

            {successMessage && (<div className="pc-alert pc-alert-success" role="status">
                {successMessage}
            </div>)}

            {/* 3D canvas */}
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
            onAddToCart={handleAddToCart}
            saving={saving}
            finishing={finishing}
            disabled={disabled}
            mode="3d"
        />
    </section>);
}
