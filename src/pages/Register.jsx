import { useState } from "react";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
    });

    const { register } = useAuth(); // ✅ ICI
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    async function submit(e) {
        e.preventDefault();
        await register(form);
        navigate("/dashboard");
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 300, margin: "50px auto" }}>
            <h2>Créer un compte</h2>

            <input
                name="firstname"
                placeholder="Prénom"
                value={form.firstname}
                onChange={handleChange}
                required
            /><br /><br />

            <input
                name="lastname"
                placeholder="Nom"
                value={form.lastname}
                onChange={handleChange}
                required
            /><br /><br />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
            /><br /><br />

            <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
            /><br /><br />

            <button type="submit">S'enregistrer</button>

            <p>
                Déjà inscrit ? <Link to="/login">Connexion</Link>
            </p>
        </form>
    );
}