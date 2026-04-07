import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { createCustomizationSession } from "../services/customizationService";
import { createDefaultCustomization } from "../utils/defaultCustomization";
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

export default function ProductCustomizer({ product, selectedOptionId = null, disabled = false, }) {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [configuration, setConfiguration] = useState(() =>  createDefaultCustomization(product) );
    const [session, setSession] = useState(null);
    const [saving, setSaving] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const hasSavedSession = useMemo(() => !!session?.id, [session]);

    useEffect(() => {
        setConfiguration(createDefaultCustomization(product));
        setSession(null);
        setError(null);
        setSuccessMessage("");
    }, [product?.id]);

    useEffect(() => {
        setSession(null);
        setSuccessMessage("");
    }, [selectedOptionId]);

    function invalidateSavedSession() {
        setSession(null);
        setSuccessMessage("");
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
                onPatternToggle={handlePatternToggle}
                onPatternSelect={handlePatternSelect}
                onGradientToggle={handleGradientToggle}
                onGradientSelect={handleGradientSelect}
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