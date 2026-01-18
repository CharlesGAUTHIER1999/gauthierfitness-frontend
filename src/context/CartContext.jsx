import { createContext, useContext, useEffect, useState } from "react";
import { getCart, addToCart, updateCart, removeFromCart } from "../services/cartService";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const fetchCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data.items || []);
        } catch (err) {
            console.log("❌ Cart fetch error", err);
        }
    };

    const addItem = async (productId, quantity = 1) => {
        await addToCart(productId, quantity);
        await fetchCart();
    };

    const updateItem = async (productId, quantity) => {
        await updateCart(productId, quantity);
        await fetchCart();
    };

    const removeItem = async (productId) => {
        await removeFromCart(productId);
        await fetchCart();
    };

    useEffect(() => {
    }, []);

    return (
        <CartContext.Provider value={{ cart, addItem, updateItem, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);