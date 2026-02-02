import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export default function PaymentCancel() {
    const location = useLocation();

    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const paymentIntent = params.get("payment_intent");
    const redirectStatus = params.get("redirect_status"); // souvent "failed" ou null

    return (
        <div className="pay-result">
            <h1>Paiement annulé ❌</h1>
            <p>Aucun montant n’a été débité. Vous pouvez réessayer quand vous voulez.</p>

            {(paymentIntent || redirectStatus) && (
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
                </div>
            )}

            <div className="pay-result-actions">
                <Link to="/checkout" className="btn">
                    Revenir au paiement
                </Link>
                <Link to="/cart" className="btn btn-outline">
                    Retour panier
                </Link>
            </div>
        </div>
    );
}