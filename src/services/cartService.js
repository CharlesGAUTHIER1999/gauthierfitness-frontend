import api from "../api/axios.js";

export const getCart = () => api.get("/cart");
export const addToCart = (productId, quantity = 1) =>
    api.post("/cart/add", { product_id: productId, quantity });

export const updateCart = (productId, quantity) =>
    api.post("/cart/update", { product_id: productId, quantity });

export const removeFromCart = (productId) =>
    api.delete(`/cart/remove/${productId}`);