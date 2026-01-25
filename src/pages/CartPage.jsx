import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
    const navigate = useNavigate();
    const { items, subtotal, inc, dec, remove } = useCart();

    const shippingCost = useMemo(() => (subtotal >= 50 ? 0 : 3.9), [subtotal]);
    const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

    if (items.length === 0) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-3">Votre panier</h1>
                <p>Votre panier est vide.</p>
                <div className="mt-4">
                    <Link to="/products" className="underline">
                        Continuer vos achats
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Votre panier</h1>

            <div className="grid gap-4">
                {items.map((it) => (
                    <div
                        key={it.key}
                        className="flex items-start gap-4 border-b pb-4"
                    >
                        <img
                            src={it.image ?? "/no-image.png"}
                            className="w-20 h-24 object-cover rounded-lg bg-gray-100"
                            alt={it.name}
                        />

                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold">{it.name}</h2>
                                    <div className="text-sm text-gray-500">
                                        {it.variantValue ? it.variantValue : null}
                                        {it.optionLabel ? ` • ${it.optionLabel}` : null}
                                    </div>
                                </div>

                                <div className="font-semibold whitespace-nowrap">
                                    {(Number(it.price) * Number(it.quantity)).toFixed(2)} €
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="inline-flex items-center border rounded-full overflow-hidden h-9">
                                    <button
                                        type="button"
                                        className="w-9 h-9"
                                        onClick={() => dec(it.productId, it.optionId)}
                                        aria-label="Réduire"
                                    >
                                        –
                                    </button>
                                    <div className="w-10 text-center text-sm">{it.quantity}</div>
                                    <button
                                        type="button"
                                        className="w-9 h-9"
                                        onClick={() => inc(it.productId, it.optionId)}
                                        aria-label="Augmenter"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="text-sm underline text-gray-600"
                                    onClick={() => remove(it.productId, it.optionId)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 border-t pt-4 grid gap-2">
                <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span className="font-semibold">{subtotal.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between">
                    <span>Expédition</span>
                    <span className="font-semibold">
            {shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(2)} €`}
          </span>
                </div>

                <div className="flex justify-between text-lg font-bold mt-2">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                </div>

                <button
                    className="mt-4 h-12 rounded-full bg-black text-white font-semibold"
                    onClick={() => navigate("/checkout")}
                >
                    Passer au paiement
                </button>
            </div>
        </div>
    );
}
