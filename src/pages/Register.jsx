import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const { register, token } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) navigate("/account");
    }, [token, navigate]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function submit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const payload = {
                firstname: form.firstname.trim(),
                lastname: form.lastname.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password, // ne pas trim
            };

            await register(payload);
            navigate("/");
        } catch (e) {
            // Laravel validation: { message, errors: { field: [msg] } }
            const validation = e?.response?.data?.errors;
            if (validation && typeof validation === "object") {
                const firstKey = Object.keys(validation)[0];
                const firstMsg = validation[firstKey]?.[0];
                setError(firstMsg || "Erreur de validation.");
            } else {
                const msg =
                    e?.response?.data?.message ||
                    e?.response?.data?.error ||
                    e?.message ||
                    "Impossible de créer le compte.";
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 320, margin: "50px auto" }}>
            <h2>Créer un compte</h2>

            {error && <div className="ck-error">{error}</div>}

            <input
                name="firstname"
                placeholder="Prénom"
                value={form.firstname}
                onChange={handleChange}
                required
                autoComplete="given-name"
            />
            <br />
            <br />

            <input
                name="lastname"
                placeholder="Nom"
                value={form.lastname}
                onChange={handleChange}
                required
                autoComplete="family-name"
            />
            <br />
            <br />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
            />
            <br />
            <br />

            <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                minLength={6}
            />
            <br />
            <br />

            <button type="submit" disabled={loading}>
                {loading ? "Création..." : "S'enregistrer"}
            </button>

            <p>
                Déjà inscrit ? <Link to="/login">Connexion</Link>
            </p>
        </form>
    );
}
