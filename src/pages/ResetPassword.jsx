import { useState } from "react";
import { useAuth } from "../store/auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await resetPassword({
                email,
                token,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate("/login");
        } catch (e) {
            const validation = e?.response?.data?.errors;
            if (validation && typeof validation === "object") {
                const firstKey = Object.keys(validation)[0];
                setError(validation[firstKey]?.[0] || "Erreur de validation.");
            } else {
                setError(
                    e?.response?.data?.message ||
                        "Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 320, margin: "50px auto" }}>
            <h2>Réinitialiser le mot de passe</h2>

            {error && <div className="ck-error">{error}</div>}

            <label className="sr-only" htmlFor="reset-password">Nouveau mot de passe</label>
            <input
                id="reset-password"
                type="password"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
            />
            <br />
            <br />

            <label className="sr-only" htmlFor="reset-password-confirmation">Confirmer le mot de passe</label>
            <input
                id="reset-password-confirmation"
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
            />
            <br />
            <br />

            <button type="submit" disabled={loading}>
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>

            <p>
                <Link to="/login">Retour à la connexion</Link>
            </p>
        </form>
    );
}
