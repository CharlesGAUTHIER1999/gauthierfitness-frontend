import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function CheckoutButton({ cart }) {
    const checkout = async () => {
        const stripe = await stripePromise;

        if (!stripe) {
            console.error("Stripe non chargé");
            return;
        }

        const response = await fetch("http://localhost:8000/api/payment/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: cart }),
        });

        const data = await response.json();

        await stripe.redirectToCheckout({
            sessionId: data.id,
        });
    };

    return (
        <button onClick={checkout} className="pay-btn">
            Payer avec Stripe
        </button>
    );
}
