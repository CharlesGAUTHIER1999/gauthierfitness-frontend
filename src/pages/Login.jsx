import {useEffect, useState} from "react";
import {useAuth} from "../store/auth";
import {useNavigate, Link, useSearchParams, useLocation} from "react-router-dom";

// Login form : authenticates via email/password and redirects on success
export default function Login() {
    const {login, token, user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const redirectParam = searchParams.get("redirect");
    // ProtectedRoute redirects here with state={{from: location}} so we can
    // send the user back where they actually wanted to go.
    const fromPath = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ""}`
        : null;

    // Only navigate once the auth context (token/user) has actually been
    // committed — navigating right after `login()` resolves races the
    // route guards, which may still read the stale, pre-login context.
    useEffect(() => {
        if (!loggedIn || !token) return;
        const destination = redirectParam || fromPath || (user?.is_admin ? "/admin" : "/");
        navigate(destination, {replace: true});
    }, [loggedIn, token, user, redirectParam, fromPath, navigate]);

    // Submits credentials and logs the user in ; redirect happens in the effect above.
    // Without an explicit ?redirect=, admins land on the back-office instead of the home page.
    async function submit(e) {
        e.preventDefault();
        setError(null);

        try {
            const safeEmail = email.trim().toLowerCase();
            await login(safeEmail, password);
            setLoggedIn(true);
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Email ou mot de passe incorrect.";
            setError(msg);
        }
    }

    return (
        <form onSubmit={submit} style={{maxWidth: 320, margin: "50px auto"}}>
            <h2>Connexion</h2>
            {error && <div className="ck-error">{error}</div>}

            <label className="sr-only" htmlFor="login-email">Email</label>
            <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
            />
            <br/>
            <br/>

            <label className="sr-only" htmlFor="login-password">Mot de passe</label>
            <input
                id="login-password"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
            />
            <br/>
            <br/>

            <button type="submit">Se connecter</button>

            <p>
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </p>
            <p>
                Pas de compte ? <Link to="/register">Créer un compte</Link>
            </p>
        </form>
    );
}