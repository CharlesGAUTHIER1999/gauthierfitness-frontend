import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext.jsx"; // optionnel si tu veux clear

export default function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    // const { clear } = useCart(); // optionnel

    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const paymentIntent = params.get("payment_intent");
    const redirectStatus = params.get("redirect_status"); // succeeded / failed (selon flow)
    const sessionId = params.get("session_id"); // si jamais tu utilises Checkout Session plus tard

    useEffect(() => {
        // Optionnel : si pas de param, tu peux quand même accepter la page,
        // mais si tu veux être strict :
        // if (!paymentIntent && !sessionId) navigate("/checkout", { replace: true });

        // Optionnel : clear du panier côté front (si tu veux)
        // clear();
    }, [navigate]);

    return (
        <div className="pay-result">
            <h1>Paiement réussi 🎉</h1>
            <p>Merci pour votre commande.</p>

            <div className="pay-result-box">
                {redirectStatus && (
                    <p>
                        Statut : <strong>{redirectStatus}</strong>
                    </p>
                )}
                {paymentIntent && (
                    <p style={{ wordBreak: "break-word" }}>
                        PaymentIntent : <strong>{paymentIntent}</strong>
                    </p>
                )}
                {sessionId && (
                    <p style={{ wordBreak: "break-word" }}>
                        Session : <strong>{sessionId}</strong>
                    </p>
                )}
            </div>

            <div className="pay-result-actions">
                <Link to="/products" className="btn">
                    Retour boutique
                </Link>
                <Link to="/dashboard" className="btn btn-outline">
                    Voir mes commandes
                </Link>
            </div>
        </div>
    );
}
