import {useCart} from "../../../context/CartContext";
import {
    createCustomizationSession,
    generateAiDesign,
    uploadCustomizationImage,
    uploadCustomizationLogo,
} from "../services/customizationService";
import {createDefaultCustomization} from "../utils/defaultCustomization";
import {useCustomizationEditorBase} from "../hooks/useCustomizationEditorBase";
import CustomizationPanel from "./CustomizationPanel";
import CustomizationPreview from "./CustomizationPreview";

// Default x,y, size for a newly added image layer, depending on the current view.
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

// Top-level 2D product customizer
export default function ProductCustomizer({
                                              product,
                                              selectedOptionId = null,
                                              disabled = false,
                                          }) {
    const {addItem, openCart} = useCart();

    const {
        configuration, setConfiguration,
        session, setSession,
        saving, setSaving,
        finishing, setFinishing,
        error, setError,
        successMessage, setSuccessMessage,
        uploadLogoLoading, setUploadLogoLoading,
        uploadLogoError, setUploadLogoError,
        uploadImageLoading, setUploadImageLoading,
        uploadImageError, setUploadImageError,
        aiLoading, setAiLoading,
        aiError, setAiError,
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
                const existingLayers = Array.isArray(prev.image_layers)
                    ? prev.image_layers
                    : [];

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

    async function handleGenerateAiDesign(prompt) {
        if (disabled) {
            setAiError("Veuillez d'abord sélectionner l'option requise.");
            return false;
        }

        const currentImageLayers = Array.isArray(configuration?.image_layers)
            ? configuration.image_layers
            : [];

        if (currentImageLayers.length >= 3) {
            setAiError("Maximum 3 images libres autorisées.");
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
            const defaults = getDefaultImageLayerPosition(currentView);

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
                        x: defaults.x,
                        y: defaults.y,
                        width: defaults.width,
                        height: defaults.height,
                        rotation: 0,
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
                i === index ? {...layer, ...position} : layer
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
                        return {...layer, ...position};
                    }

                    return layer;
                }),
            };
        });

        invalidateSavedSession();
    }

    // Persists the current configuration
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
                previewImagePath: product.main_image || null,
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

    // Ensures the session is saved, then adds the item to the cart. Stays on the
    // page (rather than jumping to checkout) so the customer can keep configuring
    // and adding more items — checkout is a separate, deliberate step from the cart.
    async function handleAddToCart() {
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

            setSuccessMessage("Ajouté au panier.");
            openCart();
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                "Impossible d'ajouter au panier."
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
        </section>
    );
}
