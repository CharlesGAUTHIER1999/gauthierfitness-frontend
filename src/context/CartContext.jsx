import React, {
    createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState,
} from "react";
import api from "../api/axios";

const CartContext = createContext(null);

// Reducer holding the cart state
function cartReducer(state, action) {
    switch (action.type) {
        case "SET_CART":
            return action.payload;

        case "CLEAR":
            return {
                items: [], count: 0, subtotal: 0, currency: "EUR",
            };

        default:
            return state;
    }
}

// Maps raw API cart payload
function normalizeCart(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map((it) => {
            const customization = it.customization ?? null;
            const customizationPreviewPath = it.customization_preview_path || it.customization?.preview_image_path || null;

            return {
                id: Number(it.id),
                key: String(it.id),
                productId: Number(it.product_id),
                optionId: it.option?.id ?? null,
                customProductSessionId: it.custom_product_session_id ?? null,
                isCustomized: Boolean(it.is_customized) || Boolean(it.custom_product_session_id),
                name: it.name,
                image: customizationPreviewPath || it.image || "/placeholder.png",
                defaultImage: it.image || "/placeholder.png",
                customizationPreviewPath,
                quantity: Number(it.quantity || 0),
                price: Number(it.unit_price || 0),
                lineTotal: Number(it.line_total || 0),
                variantTitle: it.variant_title ?? null,
                variantValue: it.variant_value ?? null,
                optionLabel: it.option?.label ?? null,
                size: it.size ?? null,
                deliveryText: it.delivery_text ?? null,
                customization,
            };
        }),
        count: Number(payload?.count || 0),
        subtotal: Number(payload?.subtotal || 0),
        currency: payload?.currency || "EUR",
    };
}

// Provides cart state and actions
export function CartProvider({children}) {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [], count: 0, subtotal: 0, currency: "EUR",
    });

    const [isOpen, setIsOpen] = useState(false);

    const openCart = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeCart = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Reloads cart from the API
    const refetchCart = useCallback(async () => {
        try {
            const {data} = await api.get("/cart");

            dispatch({
                type: "SET_CART", payload: normalizeCart(data),
            });
        } catch (e) {
            if (e?.response?.status === 401) {
                dispatch({type: "CLEAR"});
                return;
            }

            console.error("Erreur refetchCart :", e);
        }
    }, []);

    // hydrate cart from database on mount
    useEffect(() => {
        void refetchCart();
    }, [refetchCart]);

    // Adds product to cart
    const addItem = useCallback(async ({
                                           productId, optionId = null, quantity = 1, customProductSessionId = null,
                                       }) => {
        await api.post("/cart/items", {
            product_id: productId,
            product_option_id: optionId,
            custom_product_session_id: customProductSessionId,
            quantity,
        });

        await refetchCart();
    }, [refetchCart]);

    // Updates quantity of cart item
    const setQty = useCallback(async (cartItemId, quantity) => {
        await api.patch(`/cart/items/${cartItemId}`, {quantity});
        await refetchCart();
    }, [refetchCart]);

    // Removes item from cart
    const removeItem = useCallback(async (cartItemId) => {
        await api.delete(`/cart/items/${cartItemId}`);
        await refetchCart();
    }, [refetchCart]);

    const clear = useCallback(() => {
        dispatch({type: "CLEAR"});
    }, []);

    const value = useMemo(() => ({
        items: state.items,
        count: state.count,
        subtotal: state.subtotal,
        currency: state.currency,
        isOpen,
        openCart,
        closeCart,
        refetchCart,
        addItem,
        setQty,
        inc: (item) => setQty(item.id, item.quantity + 1),
        dec: (item) => setQty(item.id, Math.max(1, item.quantity - 1)),
        remove: (item) => removeItem(item.id),
        clear,
    }), [state.items, state.count, state.subtotal, state.currency, isOpen, openCart, closeCart, refetchCart, addItem, setQty, removeItem, clear,]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to access cart context
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}