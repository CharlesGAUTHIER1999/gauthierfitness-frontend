import api from "../../../api/axios.js";

/**
 * Transforme une URL absolue du backend (http://localhost:8000/storage/...)
 * en chemin relatif (/storage/...) pour passer par le proxy Vite en dev.
 */
function toRelativeStorageUrl(url) {
    if (!url || typeof url !== "string") return url;
    try {
        const parsed = new URL(url);
        // Si c'est une URL storage du backend, on ne garde que le pathname
        if (parsed.pathname.startsWith("/storage")) {
            return parsed.pathname;
        }
    } catch {
        // Ce n'est pas une URL absolue → on la retourne telle quelle
    }
    return url;
}

export async function createCustomizationSession({
                                                     productId,
                                                     productOptionId = null,
                                                     configuration,
                                                     previewImagePath = null,
                                                     designId = null,
                                                 }) {
    const { data } = await api.post("/customization/sessions", {
        product_id: productId,
        product_option_id: productOptionId,
        configuration,
        preview_image_path: previewImagePath,
        design_id: designId,
    });
    return data?.data;
}

export async function updateCustomizationSession(sessionId, payload) {
    const { data } = await api.patch(`/customization/sessions/${sessionId}`, payload);
    return data?.data;
}

export async function uploadCustomizationLogo(file) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/customization/assets/logo", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    const result = data?.data;
    if (result?.url) {
        result.url = toRelativeStorageUrl(result.url);
    }
    return result;
}

/**
 * Génère un design via l'IA (OpenAI) et retourne l'objet Design persisté.
 * Le backend modère le prompt puis l'image : un contenu rejeté renvoie un 422
 * (avec `reason` = `prompt_flagged` | `image_flagged`) que l'appelant doit gérer.
 */
export async function generateAiDesign({
                                           productId,
                                           productOptionId = null,
                                           prompt,
                                           name = null,
                                       }) {
    const { data } = await api.post(
        "/ai/designs/generate",
        {
            product_id: productId,
            product_option_id: productOptionId,
            prompt,
            name,
        },
        // La génération (modération + gpt-image-1 + modération image) dépasse
        // le timeout global de 15 s : on l'étend pour cette requête uniquement.
        { timeout: 180000 }
    );

    const design = data?.data;
    if (design?.preview_url) {
        design.preview_url = toRelativeStorageUrl(design.preview_url);
    }
    return design;
}

export async function uploadCustomizationImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/customization/assets/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    const result = data?.data;
    if (result?.url) {
        result.url = toRelativeStorageUrl(result.url);
    }
    return result;
}