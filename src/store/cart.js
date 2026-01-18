import { create } from "zustand";
import api from "../api/axios";

export const useCartStore = create((set, get) => ({
    items: [],
    total: 0,

    fetchCart: async () => {
        const res = await api.get("/cart");
        set({
            items: res.data.items,
            total: res.data.total,
        });
    },

    addToCart: async (productId, quantity = 1) => {
        await api.post("/cart/add", { product_id: productId, quantity });
        await get().fetchCart();
    },

    updateItem: async (itemId, quantity) => {
        await api.post("/cart/update", { item_id: itemId, quantity });
        await get().fetchCart();
    },

    removeItem: async (productId) => {
        await api.delete(`/cart/remove/${productId}`);
        await get().fetchCart();
    }
}));
