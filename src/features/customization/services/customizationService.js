import api from "../../../api/axios.js";

function toRelativeStorageUrl(url) {
    if (!url || typeof url !== "string") return url;
    try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith("/storage")) {
            return parsed.pathname;
        }
    } catch {
        // Not absolute URL
    }
    return url;
}

// Creates new customization session
export async function createCustomizationSession({
                                                     productId,
                                                     productOptionId = null,
                                                     configuration,
                                                     previewImagePath = null,
                                                     designId = null,
                                                 }) {
    const {data} = await api.post("/customization/sessions", {
        product_id: productId,
        product_option_id: productOptionId,
        configuration,
        preview_image_path: previewImagePath,
        design_id: designId,
    });
    return data?.data;
}

// Updates existing customization session
export async function updateCustomizationSession(sessionId, payload) {
    const {data} = await api.patch(`/customization/sessions/${sessionId}`, payload);
    return data?.data;
}

// Uploads custom logo image asset
export async function uploadCustomizationLogo(file) {
    const formData = new FormData();
    formData.append("file", file);

    const {data} = await api.post("/customization/assets/logo", formData, {
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

// Generates a design via AI (OpenAI)
export async function generateAiDesign({
                                           productId, productOptionId = null, prompt, name = null,
                                       }) {
    const {data} = await api.post("/ai/designs/generate", {
        product_id: productId, product_option_id: productOptionId, prompt, name,
    }, {timeout: 180000});

    const design = data?.data;
    if (design?.preview_url) {
        design.preview_url = toRelativeStorageUrl(design.preview_url);
    }
    return design;
}

// Uploads free image asset
export async function uploadCustomizationImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const {data} = await api.post("/customization/assets/image", formData, {
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