import {useEffect, useState} from "react";

// Returns style block
export function ensureViewStyle(style, view) {
    return (style?.[view] || {
        pattern: {enabled: false, id: null}, gradient: {enabled: false, id: null},
    });
}

// Shared state + simple field setters
export function useCustomizationEditorBase(product, selectedOptionId, createDefault) {
    const [configuration, setConfiguration] = useState(() => createDefault(product));
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

    useEffect(() => {
        setConfiguration(createDefault(product));
        setSession(null);
        setError(null);
        setSuccessMessage("");
        setUploadLogoError(null);
        setUploadImageError(null);
    }, [createDefault, product]);

    useEffect(() => {
        setSession(null);
        setSuccessMessage("");
    }, [selectedOptionId]);

    // Clears saved session
    function invalidateSavedSession() {
        setSession(null);
        setSuccessMessage("");
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
            text_layers: (prev.text_layers || []).map((layer) => ({...layer, color})),
        }));
        invalidateSavedSession();
    }

    function handleAddTextLayer(textLayer) {
        setConfiguration((prev) => ({
            ...prev, text_layers: [...(prev.text_layers || []), textLayer],
        }));
        invalidateSavedSession();
    }

    function handlePlayerNameChange(value) {
        setConfiguration((prev) => ({
            ...prev, player_name: {...prev.player_name, value},
        }));
        invalidateSavedSession();
    }

    function handlePlayerNumberChange(value) {
        setConfiguration((prev) => ({
            ...prev, player_number: {...prev.player_number, value},
        }));
        invalidateSavedSession();
    }

    function handleToggleLogo(enabled) {
        setConfiguration((prev) => ({
            ...prev, logo: {...prev.logo, enabled},
        }));
        invalidateSavedSession();
    }

    function handleLogoSelect(src) {
        setConfiguration((prev) => ({
            ...prev, logo: {...prev.logo, src},
        }));
        invalidateSavedSession();
    }

    function handleRemoveLogo() {
        setConfiguration((prev) => ({
            ...prev, logo: {...prev.logo, enabled: false, src: ""},
        }));
        invalidateSavedSession();
    }

    function handleRemoveImageLayer(layerId) {
        setConfiguration((prev) => ({
            ...prev, image_layers: (prev.image_layers || []).filter((layer) => layer.id !== layerId),
        }));
        invalidateSavedSession();
    }

    function handlePatternToggle(enabled) {
        setConfiguration((prev) => {
            const view = prev.view || "front";
            const currentViewStyle = ensureViewStyle(prev.style, view);

            return {
                ...prev, style: {
                    ...prev.style, [view]: {
                        ...currentViewStyle, pattern: {
                            enabled, id: enabled ? currentViewStyle.pattern?.id || "motif1" : null,
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
                ...prev, style: {
                    ...prev.style, [view]: {
                        ...currentViewStyle, pattern: {enabled: true, id: patternId},
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
                ...prev, style: {
                    ...prev.style, [view]: {
                        ...currentViewStyle, gradient: {
                            enabled, id: enabled ? currentViewStyle.gradient?.id || "degrade1" : null,
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
                ...prev, style: {
                    ...prev.style, [view]: {
                        ...currentViewStyle, gradient: {enabled: true, id: gradientId},
                    },
                },
            };
        });
        invalidateSavedSession();
    }

    function handleResetConfiguration() {
        setConfiguration(createDefault(product));
        setSession(null);
        setError(null);
        setSuccessMessage("");
        setUploadLogoError(null);
        setUploadImageError(null);
        setAiError(null);
    }

    return {
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
    };
}
