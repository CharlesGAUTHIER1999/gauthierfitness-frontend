import { useEffect } from "react";
import { useCartStore } from "../store/cart";

export default function Cart() {
    const { items, total, fetchCart, updateItem, removeItem } = useCartStore();

    useEffect(() => {
        void fetchCart();
    }, []);

    if (!items.length) return <p>Votre panier est vide.</p>;

    return (
        <div className="p-4">
            <h1>🛒 Votre Panier</h1>

            <div>
                {items.map(item => (
                    <div key={item.id} className="card">
                        <h3>{item.name}</h3>
                        <p>Prix : {item.price_ttc} €</p>

                        <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={(e) =>
                                updateItem(item.id, Number(e.target.value))
                            }
                        />

                        <button onClick={() => removeItem(item.product_id)}>
                            Retirer
                        </button>
                    </div>
                ))}
            </div>

            <h2>Total : {total} €</h2>

            <button
                className="btn btn-primary"
                onClick={() => (window.location.href = "/checkout")}
            >
                Passer au paiement
            </button>
        </div>
    );
}
