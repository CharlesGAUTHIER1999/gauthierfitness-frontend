import {useEffect, useState} from "react";
import {useAuth} from "../store/auth";
import {useNavigate, Link} from "react-router-dom";

// Registration form
export default function Register() {
    const {register, token} = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "", lastname: "", email: "", password: "", passwordConfirmation: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) navigate("/account");
    }, [token, navigate]);

    // Updates a single form field from its input's name/value
    function handleChange(e) {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    }

    // Submits the registration form and redirects home on success
    async function submit(e) {
        e.preventDefault();
        setError(null);

        if (form.password !== form.passwordConfirmation) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                firstname: form.firstname.trim(),
                lastname: form.lastname.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password, // do not trim
                password_confirmation: form.passwordConfirmation,
            };

            await register(payload);
            // Redirect happens in the effect above once the auth context
            // (token) has actually been updated — avoids racing route guards.
        } catch (e) {
            const validation = e?.response?.data?.errors;
            if (validation && typeof validation === "object") {
                const firstKey = Object.keys(validation)[0];
                const firstMsg = validation[firstKey]?.[0];
                setError(firstMsg || "Erreur de validation.");
            } else {
                const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Impossible de créer le compte.";
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }

    return (<form onSubmit={submit} style={{maxWidth: 360, margin: "50px auto"}}>
        <h2>Créer un compte</h2>
        {error && <div className="ck-error">{error}</div>}

        <div className="ck-grid" style={{marginTop: 18}}>
            <div className="ck-field ck-col-6">
                <label className="ck-label" htmlFor="register-firstname">Prénom</label>
                <input
                    id="register-firstname"
                    className="ck-input"
                    name="firstname"
                    placeholder="Prénom"
                    value={form.firstname}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                />
            </div>

            <div className="ck-field ck-col-6">
                <label className="ck-label" htmlFor="register-lastname">Nom</label>
                <input
                    id="register-lastname"
                    className="ck-input"
                    name="lastname"
                    placeholder="Nom"
                    value={form.lastname}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                />
            </div>

            <div className="ck-field ck-col-12">
                <label className="ck-label" htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    className="ck-input"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                />
            </div>

            <div className="ck-field ck-col-12">
                <label className="ck-label" htmlFor="register-password">Mot de passe</label>
                <input
                    id="register-password"
                    className="ck-input"
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    minLength={6}
                />
            </div>

            <div className="ck-field ck-col-12">
                <label className="ck-label" htmlFor="register-password-confirmation">
                    Confirmer le mot de passe
                </label>
                <input
                    id="register-password-confirmation"
                    className="ck-input"
                    type="password"
                    name="passwordConfirmation"
                    placeholder="Confirmer le mot de passe"
                    value={form.passwordConfirmation}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    minLength={6}
                />
            </div>
        </div>

        <button className="ck-submit" type="submit" disabled={loading} style={{marginTop: 18}}>
            {loading ? "Création..." : "Créer un compte"}
        </button>

        <p style={{marginTop: 14}}>
            Déjà inscrit ? <Link to="/login">Connexion</Link>
        </p>
    </form>);
}
