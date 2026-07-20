import {useCart} from "../../../context/CartContext";
import {createCustomizationSession, uploadCustomizationLogo} from "../services/customizationService";

// Logo upload, session save, and add-to-cart - same between 2D (ProductCustomizer) and 3D (Product3DCustomizer)
export function useCustomizationSubmission({
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
                                               previewImagePath = null,
                                           }) {
    const {addItem, openCart} = useCart();

    async function handleUploadLogo(file) {
        try {
            setUploadLogoLoading(true);
            setUploadLogoError(null);
            const uploaded = await uploadCustomizationLogo(file);

            setConfiguration((prev) => ({
                ...prev, logo: {...prev.logo, enabled: true, src: uploaded?.url || ""},
            }));

            invalidateSavedSession();
        } catch (e) {
            setUploadLogoError(e?.response?.data?.message || "Impossible d'importer le logo.");
        } finally {
            setUploadLogoLoading(false);
        }
    }

    // Persists current configuration
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
                productId: product.id, productOptionId: selectedOptionId, configuration, previewImagePath,
            });

            setSession(createdSession);
            setSuccessMessage("Configuration enregistrée.");
            return createdSession;
        } catch (e) {
            setError(e?.response?.data?.message || "Impossible d'enregistrer la personnalisation.");
            return null;
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveCustomization() {
        await saveCustomization();
    }

    // Saves session
    async function handleAddToCart() {
        if (disabled) {
            setError("Veuillez d'abord sélectionner l'option requise.");
            return;
        }

        try {
            setFinishing(true);
            setError(null);
            let currentSession = session;
            if (!currentSession?.id) currentSession = await saveCustomization();

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
            setError(e?.response?.data?.message || "Impossible d'ajouter au panier.");
        } finally {
            setFinishing(false);
        }
    }

    return {handleUploadLogo, saveCustomization, handleSaveCustomization, handleAddToCart};
}
