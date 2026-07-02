import {useEffect, useMemo, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {useCart} from "../context/CartContext.jsx";

// Shown after a successful Stripe payment : clears the cart and confirms the order
export default function PaymentSuccess() {
    const location = useLocation();
    const {refetchCart, clear, closeCart} = useCart();
    const [done, setDone] = useState(false);

    const params = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    );

    const redirectStatus = params.get("redirect_status");
    const paymentIntent = params.get("payment_intent");
    const isDev = import.meta.env.DEV;

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                await refetchCart();
                clear();
                closeCart?.();
            } finally {
                if (!cancelled) {
                    setDone(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [refetchCart, clear, closeCart]);

    return (
        <div className="pay-result">
            <h1>Paiement réussi 🎉</h1>

            <p>
                Merci pour votre commande. Vous recevrez un e-mail de confirmation sous
                quelques minutes.
            </p>

            <div className="pay-result-box">
                {redirectStatus && (
                    <p>
                        Statut : <strong>{redirectStatus}</strong>
                    </p>
                )}

                {isDev && paymentIntent && (
                    <p style={{wordBreak: "break-word"}}>
                        PaymentIntent : <strong>{paymentIntent}</strong>
                    </p>
                )}

                {!done && (
                    <p className="ck-muted" style={{marginTop: 10}}>
                        Mise à jour du panier…
                    </p>
                )}
            </div>

            <div className="pay-result-actions">
                <Link to="/account/orders" className="btn">
                    Voir ma commande
                </Link>
                <Link to="/products" className="btn btn-outline">
                    Retour boutique
                </Link>
            </div>
        </div>
    );
}