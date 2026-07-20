import {generateAiDesign, uploadCustomizationImage} from "../services/customizationService";
import {createDefaultCustomization} from "../utils/defaultCustomization";
import {useCustomizationEditorBase} from "../hooks/useCustomizationEditorBase";
import {useCustomizationSubmission} from "../hooks/useCustomizationSubmission";
import CustomizationPanel from "./CustomizationPanel";
import CustomizationPreview from "./CustomizationPreview";

// Default x,y, size for newly image layer
function getDefaultImageLayerPosition(view) {
    if (view === "back") {
        return {
            x: 315, y: 255, width: 90, height: 90,
        };
    }

    return {
        x: 325, y: 285, width: 90, height: 90,
    };
}

// Top-level 2D product customizer
export default function ProductCustomizer({
                                              product, selectedOptionId = null, disabled = false,
                                          }) {
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
    } = useCustomizationEditorBase(product, selectedOptionId, createDefaultCustomization);

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
        previewImagePath: product.main_image || null,
    });

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
                ...prev, image_layers: [...(Array.isArray(prev.image_layers) ? prev.image_layers : []), {
                    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    src: uploaded?.url || "",
                    original_name: uploaded?.original_name || file.name,
                    view: currentView,
                    x: defaults.x,
                    y: defaults.y,
                    width: defaults.width,
                    height: defaults.height,
                    rotation: 0,
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

        const currentImageLayers = Array.isArray(configuration?.image_layers) ? configuration.image_layers : [];

        if (currentImageLayers.length >= 3) {
            setAiError("Maximum 3 images libres autorisées.");
            return false;
        }

        try {
            setAiLoading(true);
            setAiError(null);

            const design = await generateAiDesign({
                productId: product.id, productOptionId: selectedOptionId, prompt,
            });

            const currentView = configuration?.view || "front";
            const defaults = getDefaultImageLayerPosition(currentView);

            setConfiguration((prev) => ({
                ...prev, image_layers: [...(Array.isArray(prev.image_layers) ? prev.image_layers : []), {
                    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    src: design?.preview_url || "",
                    original_name: design?.name || "Design IA",
                    design_id: design?.id ?? null,
                    view: currentView,
                    x: defaults.x,
                    y: defaults.y,
                    width: defaults.width,
                    height: defaults.height,
                    rotation: 0,
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

    function handlePlayerNamePositionChange(position) {
        setConfiguration((prev) => ({
            ...prev, player_name: {
                ...prev.player_name, ...position,
            },
        }));
        invalidateSavedSession();
    }

    function handlePlayerNumberPositionChange(position) {
        setConfiguration((prev) => ({
            ...prev, player_number: {
                ...prev.player_number, ...position,
            },
        }));
        invalidateSavedSession();
    }

    function handleLogoPositionChange(position) {
        setConfiguration((prev) => ({
            ...prev, logo: {
                ...prev.logo, ...position,
            },
        }));
        invalidateSavedSession();
    }

    function handleTextLayerPositionChange(index, position) {
        setConfiguration((prev) => ({
            ...prev,
            text_layers: (prev.text_layers || []).map((layer, i) => i === index ? {...layer, ...position} : layer),
        }));
        invalidateSavedSession();
    }

    function handleImageLayerPositionChange(index, position) {
        const currentView = configuration?.view || "front";

        setConfiguration((prev) => {
            let visibleIndex = -1;

            return {
                ...prev, image_layers: (prev.image_layers || []).map((layer) => {
                    const layerView = layer?.view || "front";

                    if (layerView === currentView) {
                        visibleIndex += 1;
                    }

                    if (layerView === currentView && visibleIndex === index) {
                        return {...layer, ...position};
                    }

                    return layer;
                }),
            };
        });

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
            configuration={configuration}
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
            onResetConfiguration={handleResetConfiguration}
            onSave={handleSaveCustomization}
            onAddToCart={handleAddToCart}
            saving={saving}
            finishing={finishing}
            disabled={disabled}
        />
    </section>);
}
