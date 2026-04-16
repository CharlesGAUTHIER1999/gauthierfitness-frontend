import api from "../../../api/axios.js";

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

    return data?.data;
}

export async function uploadCustomizationImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/customization/assets/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return data?.data;
}