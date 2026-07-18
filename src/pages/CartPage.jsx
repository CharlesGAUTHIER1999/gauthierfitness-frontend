import {Link, useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {useCart} from "../context/CartContext";
import {estimateShippingCost} from "../constants/shipping.js";

// Cart page : lists items, lets user adjust quantity/remove, and proceed to checkout
export default function CartPage() {
    const navigate = useNavigate();
    const {items, subtotal, inc, dec, remove} = useCart();

    // Preview only (standard rate) — the actual method is chosen at checkout.
    const shippingCost = useMemo(() => estimateShippingCost("standard", subtotal), [subtotal]);
    const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

    if (items.length === 0) {
        return (
            <div className="p-6">
                <h1>Votre panier</h1>
                <p>Votre panier est vide.</p>
                <Link to="/products">Continuer vos achats</Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1>Votre panier</h1>

            {items.map((it) => (
                <div key={it.key} className="cart-row">
                    <img src={it.image} alt={it.name}/>

                    <div>
                        <strong>{it.name}</strong>
                        {it.isCustomized && <div>Produit personnalisé</div>}
                        {it.variantValue && <div>{it.variantValue}</div>}
                        {it.optionLabel && <div>{it.optionLabel}</div>}
                        {it.customization?.configuration?.text_layers?.length > 0 && (
                            <div>Texte : {it.customization.configuration.text_layers[0]?.text}</div>
                        )}
                    </div>

                    <div>
                        <button onClick={() => dec(it)}>–</button>
                        <span>{it.quantity}</span>
                        <button onClick={() => inc(it)}>+</button>
                    </div>

                    <div>{(it.price * it.quantity).toFixed(2)} €</div>
                    <button onClick={() => remove(it)}>Supprimer</button>
                </div>
            ))}
            <hr/>

            <div>Sous-total : {subtotal.toFixed(2)} €</div>
            <div>Livraison (standard) : {shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(2)} €`}</div>
            <strong>Total : {total.toFixed(2)} €</strong>

            <button onClick={() => navigate("/checkout")}>
                Passer au paiement
            </button>
        </div>
    );
}