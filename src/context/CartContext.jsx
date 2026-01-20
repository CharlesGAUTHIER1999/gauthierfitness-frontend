import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";

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
                            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
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
                        productId: item.productId,
                        optionId: item.optionId ?? null,
                        optionLabel: item.optionLabel ?? null,

                        // (optionnel) si tu veux afficher couleur/goût plus tard
                        variantTitle: item.variantTitle ?? null,
                        variantValue: item.variantValue ?? null,

                        name: item.name,
                        price: Number(item.price) || 0,
                        image: item.image || "/placeholder.jpg",
                        quantity: item.quantity ?? 1,
                    },
                ],
            };
        }

        case "INC": {
            const key = action.payload;
            return {
                ...state,
                items: state.items.map((i) =>
                    i.key === key ? { ...i, quantity: i.quantity + 1 } : i
                ),
            };
        }

        case "DEC": {
            const key = action.payload;
            return {
                ...state,
                items: state.items.map((i) =>
                    i.key === key
                        ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                        : i
                ),
            };
        }

        case "REMOVE": {
            const key = action.payload;
            return {
                ...state,
                items: state.items.filter((i) => i.key !== key),
            };
        }

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

    // init localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem("cart");
            if (raw) dispatch({ type: "INIT", payload: JSON.parse(raw) });
        } catch {}
    }, []);

    // persist
    useEffect(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(state));
        } catch {}
    }, [state]);

    const count = useMemo(
        () => state.items.reduce((acc, i) => acc + i.quantity, 0),
        [state.items]
    );

    const subtotal = useMemo(
        () => state.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
        [state.items]
    );

    const api = useMemo(
        () => ({
            items: state.items,
            count,
            subtotal,
            isOpen,

            openCart: () => setIsOpen(true),
            closeCart: () => setIsOpen(false),

            addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),

            // ✅ ICI: on accepte (productId, optionId) comme ton CartDrawer
            inc: (productId, optionId) =>
                dispatch({ type: "INC", payload: makeKey(productId, optionId) }),

            dec: (productId, optionId) =>
                dispatch({ type: "DEC", payload: makeKey(productId, optionId) }),

            remove: (productId, optionId) =>
                dispatch({ type: "REMOVE", payload: makeKey(productId, optionId) }),

            clear: () => dispatch({ type: "CLEAR" }),
        }),
        [state.items, count, subtotal, isOpen]
    );

    return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
    return useContext(CartContext);
}
