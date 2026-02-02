import { useMemo, useState } from "react";
import {
    ExpressCheckoutElement,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";

export default function CheckoutPayment({ email }) {
    const stripe = useStripe();
    const elements = useElements();

    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState(null);

    const returnUrl = useMemo(
        () => `${window.location.origin}/payment-success`,
        []
    );

    async function confirm() {
        if (!stripe || !elements) return;

        setIsPaying(true);
        setError(null);

        try {
            // Valide le PaymentElement (card, etc.)
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message || "Vérifie les informations de paiement.");
                setIsPaying(false);
                return;
            }

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    receipt_email: email || undefined,
                    return_url: returnUrl,
                },
                redirect: "if_required",
            });

            if (confirmError) {
                setError(confirmError.message || "Paiement impossible.");
                setIsPaying(false);
                return;
            }

            // Pas de redirect requis => paiement confirmé côté Stripe.
            // Le webhook back validera la commande.
            setIsPaying(false);
        } catch (e) {
            setError(e?.message || "Erreur inattendue pendant le paiement.");
            setIsPaying(false);
        }
    }

    return (
        <div className="ck-payment-box">
            <div className="ck-payment-head">
                <div className="ck-payment-title">Paiement</div>
                <div className="ck-payment-sub">
                    Toutes les transactions sont sécurisées et chiffrées.
                </div>
            </div>

            {/* ✅ Express (Apple Pay / Google Pay) - apparait seulement si dispo */}
            <div className="ck-express">
                <ExpressCheckoutElement
                    onConfirm={async () => {
                        // L’ExpressCheckoutElement lance la confirmation; tu confirmes ici
                        await confirm();
                    }}
                    onReady={() => {
                        // (optionnel) tu peux loguer si tu veux
                    }}
                    onClick={() => {
                        setError(null);
                    }}
                    onCancel={() => {
                        // (optionnel) si user annule le sheet wallet
                    }}
                />
                <div className="ck-or">
                    <span>OU</span>
                </div>
            </div>

            {/* ✅ Card / methods via PaymentElement */}
            <div className="ck-payment-element">
                <PaymentElement
                    options={{
                        layout: "tabs", // look plus “checkout”
                    }}
                />
            </div>

            {error && (
                <div className="ck-error" role="alert" style={{ marginTop: 10 }}>
                    {error}
                </div>
            )}

            <button
                type="button"
                className="ck-submit"
                onClick={confirm}
                disabled={!stripe || !elements || isPaying}
                style={{ marginTop: 12 }}
            >
                {isPaying ? "Paiement en cours..." : "Payer maintenant"}
            </button>

            <div className="ck-muted" style={{ marginTop: 10 }}>
                Apple Pay / Google Pay s’affichent seulement si l’appareil et la config Stripe le permettent.
            </div>
        </div>
    );
}
