import api from "../../../api/axios.js";

export async function createCustomizationSession({productId, productOptionId = null, configuration, previewImagePath = null, designId = null,
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