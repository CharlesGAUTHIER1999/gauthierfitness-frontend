import { useState } from "react";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    async function submit(e) {
        e.preventDefault();
        setError(null);

        try {
            const safeEmail = email.trim().toLowerCase();
            await login(safeEmail, password);
            navigate("/");
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Email ou mot de passe incorrect.";
            setError(msg);
        }
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 320, margin: "50px auto" }}>
            <h2>Connexion</h2>

            {error && <div className="ck-error">{error}</div>}

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

            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
            />
            <br />
            <br />

            <button type="submit">Se connecter</button>

            <p>
                Pas de compte ? <Link to="/register">Créer un compte</Link>
            </p>
        </form>
    );
}
