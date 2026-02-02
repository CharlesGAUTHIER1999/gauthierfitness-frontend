import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";
import api from "../api/axios";

function makeKey(productId, optionId) {
    return `${productId}:${optionId ?? "none"}`;
}

function cartReducer(state, action) {
    switch (action.type) {
        case "INIT":
            return action.payload ?? { items: [] };

        case "ADD_ITEM": {
            const item = action.payload;
            const key = makeKey(item.productId, item.optionId);

            const existing = state.items.find((i) => i.key === key);

            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.key === key
                            ? { ...i, quantity: i.quantity + item.quantity }
                            : i
                    ),
                };
            }

            return {
                ...state,
                items: [
                    ...state.items,
                    {
                        key,
                        cartItemId: item.cartItemId, // id DB
                        productId: item.productId,
                        optionId: item.optionId ?? null,
                        optionLabel: item.optionLabel ?? null,
                        variantValue: item.variantValue ?? null,
                        name: item.name,
                        price: Number(item.price) || 0,
                        image: item.image || "/placeholder.jpg",
                        quantity: item.quantity ?? 1,
                    },
                ],
            };
        }

        case "SET_QTY": {
            const { key, quantity } = action.payload;
            return {
                ...state,
                items: state.items.map((i) =>
                    i.key === key ? { ...i, quantity } : i
                ),
            };
        }

        case "REMOVE":
            return {
                ...state,
                items: state.items.filter((i) => i.key !== action.payload),
            };

        case "CLEAR":
            return { items: [] };

        default:
            return state;
    }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("cart");
            if (raw) {
                dispatch({
                    type: "INIT",
                    payload: { items: JSON.parse(raw) },
                });
            }
        } catch (e) {
            console.warn("Failed to load cart:", e);
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem("cart", JSON.stringify(state.items));
    }, [hydrated, state.items]);

    const count = useMemo(
        () => state.items.reduce((a, i) => a + i.quantity, 0),
        [state.items]
    );

    const subtotal = useMemo(
        () => state.items.reduce((a, i) => a + i.price * i.quantity, 0),
        [state.items]
    );

    // (optionnel) si tu veux plus tard hydrater depuis DB
    async function syncFromBackend() {
        // const res = await api.get("/cart");
        // dispatch({ type: "INIT", payload: { items: normalize(res.data.items) } });
    }

    const value = useMemo(
        () => ({
            items: state.items,
            count,
            subtotal,
            isOpen,

            openCart: () => setIsOpen(true),
            closeCart: () => setIsOpen(false),

            syncFromBackend,

            addItem: async (item) => {
                const res = await api.post("/cart/items", {
                    product_id: item.productId,
                    product_option_id: item.optionId ?? null,
                    quantity: item.quantity ?? 1,
                });

                dispatch({
                    type: "ADD_ITEM",
                    payload: {
                        ...item,
                        cartItemId: res.data.id,
                    },
                });
            },

            inc: async (item) => {
                if (!item?.cartItemId) {
                    // fallback purement local
                    dispatch({
                        type: "SET_QTY",
                        payload: { key: item.key, quantity: item.quantity + 1 },
                    });
                    return;
                }

                await api.patch(`/cart/items/${item.cartItemId}`, {
                    quantity: item.quantity + 1,
                });

                dispatch({
                    type: "SET_QTY",
                    payload: { key: item.key, quantity: item.quantity + 1 },
                });
            },

            dec: async (item) => {
                const q = Math.max(1, item.quantity - 1);

                if (!item?.cartItemId) {
                    dispatch({ type: "SET_QTY", payload: { key: item.key, quantity: q } });
                    return;
                }

                await api.patch(`/cart/items/${item.cartItemId}`, {
                    quantity: q,
                });

                dispatch({
                    type: "SET_QTY",
                    payload: { key: item.key, quantity: q },
                });
            },

            remove: async (item) => {
                if (item?.cartItemId) {
                    await api.delete(`/cart/items/${item.cartItemId}`);
                }
                dispatch({ type: "REMOVE", payload: item.key });
            },

            clear: () => dispatch({ type: "CLEAR" }),
        }),
        [state.items, count, subtotal, isOpen]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    return useContext(CartContext);
}
