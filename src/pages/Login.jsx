import {useEffect, useState} from "react";
import {useAuth} from "../store/auth";
import {useNavigate, Link, useSearchParams, useLocation} from "react-router-dom";

// Login form : authenticates via email/password and redirects on success
export default function Login() {
    const {login, token} = useAuth();
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
        const destination = redirectParam || fromPath || "/";
        navigate(destination, {replace: true});
    }, [loggedIn, token, redirectParam, fromPath, navigate]);

    // Submits credentials and logs the user in ; redirect happens in the effect above.
    // Without an explicit ?redirect= or origin page, everyone lands on the home page —
    // admins reach the back-office through its own nav entry, not an automatic redirect.
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
        <form onSubmit={submit} style={{maxWidth: 360, margin: "50px auto"}}>
            <h2>Connexion</h2>
            {error && <div className="ck-error">{error}</div>}

            <div className="ck-grid" style={{marginTop: 18}}>
                <div className="ck-field ck-col-12">
                    <label className="ck-label" htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        className="ck-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="ck-field ck-col-12">
                    <label className="ck-label" htmlFor="login-password">Mot de passe</label>
                    <input
                        id="login-password"
                        className="ck-input"
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
            </div>

            <button className="ck-submit" type="submit" style={{marginTop: 18}}>
                Se connecter
            </button>

            <p style={{marginTop: 14}}>
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </p>
            <p>
                Pas de compte ? <Link to="/register">Créer un compte</Link>
            </p>
        </form>
    );
}