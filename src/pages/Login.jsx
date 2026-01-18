import { useState } from "react";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth(); // ✅ FIX ICI
    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault();
        await login(email, password);
        navigate("/dashboard");
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 300, margin: "50px auto" }}>
            <h2>Connexion</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <br /><br />

            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <br /><br />

            <button type="submit">Se connecter</button>

            <p>
                Pas de compte ? <Link to="/register">Créer un compte</Link>
            </p>
        </form>
    );
}
