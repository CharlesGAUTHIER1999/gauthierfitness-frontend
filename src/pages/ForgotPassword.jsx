import { useState } from "react";
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const { forgotPassword } = useAuth();

    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            const res = await forgotPassword(email);
            setMessage(res.message);
        } catch (e) {
            const validation = e?.response?.data?.errors;
            if (validation && typeof validation === "object") {
                const firstKey = Object.keys(validation)[0];
                setError(validation[firstKey]?.[0] || "Erreur de validation.");
            } else {
                setError(
                    e?.response?.data?.message ||
                        "Impossible d'envoyer le lien de réinitialisation."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 320, margin: "50px auto" }}>
            <h2>Mot de passe oublié</h2>

            {error && <div className="ck-error">{error}</div>}
            {message && <div className="ck-success">{message}</div>}

            {!message && (
                <>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <br />
                    <br />

                    <button type="submit" disabled={loading}>
                        {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
                    </button>
                </>
            )}

            <p>
                <Link to="/login">Retour à la connexion</Link>
            </p>
        </form>
    );
}
