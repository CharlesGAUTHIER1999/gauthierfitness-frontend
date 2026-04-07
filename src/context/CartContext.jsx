import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";
import api from "../api/axios";

const CartContext = createContext(null);

function cartReducer(state, action) {
    switch (action.type) {
        case "SET_CART":
            return action.payload;

        case "CLEAR":
            return {
                items: [],
                count: 0,
                subtotal: 0,
                currency: "EUR",
            };

        default:
            return state;
    }
}

function normalizeCart(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map((it) => {
            const customization = it.customization ?? null;
            const customizationPreviewPath =
                it.customization_preview_path ||
                it.customization?.preview_image_path ||
                null;

            return {
                id: Number(it.id),
                key: String(it.id),

                productId: Number(it.product_id),
                optionId: it.option?.id ?? null,
                customProductSessionId: it.custom_product_session_id ?? null,
                isCustomized:
                    Boolean(it.is_customized) ||
                    Boolean(it.custom_product_session_id),

                name: it.name,
                image: customizationPreviewPath || it.image || "/placeholder.jpg",
                defaultImage: it.image || "/placeholder.jpg",
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

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        count: 0,
        subtotal: 0,
        currency: "EUR",
    });

    const [isOpen, setIsOpen] = useState(false);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);

    const refetchCart = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            dispatch({ type: "CLEAR" });
            return;
        }

        try {
            const { data } = await api.get("/cart");
            dispatch({
                type: "SET_CART",
                payload: normalizeCart(data),
            });
        } catch (e) {
            if (e?.response?.status === 401) {
                dispatch({ type: "CLEAR" });
                return;
            }

            console.error("Erreur refetchCart :", e);
        }
    }, []);

    // boot: hydrate depuis DB
    useEffect(() => {
        void refetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addItem = useCallback(
        async ({
                   productId,
                   optionId = null,
                   quantity = 1,
                   customProductSessionId = null,
               }) => {
            await api.post("/cart/items", {
                product_id: productId,
                product_option_id: optionId,
                custom_product_session_id: customProductSessionId,
                quantity,
            });

            await refetchCart();
        },
        [refetchCart]
    );

    const setQty = useCallback(
        async (cartItemId, quantity) => {
            await api.patch(`/cart/items/${cartItemId}`, { quantity });
            await refetchCart();
        },
        [refetchCart]
    );

    const removeItem = useCallback(
        async (cartItemId) => {
            await api.delete(`/cart/items/${cartItemId}`);
            await refetchCart();
        },
        [refetchCart]
    );

    const clear = useCallback(() => {
        dispatch({ type: "CLEAR" });
    }, []);

    const value = useMemo(
        () => ({
            items: state.items,
            count: state.count,
            subtotal: state.subtotal,
            currency: state.currency,
            isOpen,

            openCart: () => setIsOpen(true),
            closeCart: () => setIsOpen(false),

            refetchCart,
            addItem,
            setQty,
            inc: (item) => setQty(item.id, item.quantity + 1),
            dec: (item) => setQty(item.id, Math.max(1, item.quantity - 1)),
            remove: (item) => removeItem(item.id),
            clear,
        }),
        [
            state,
            isOpen,
            openCart,
            closeCart,
            refetchCart,
            addItem,
            setQty,
            removeItem,
            clear,
        ]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
