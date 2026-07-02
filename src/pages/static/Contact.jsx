import {useState} from "react";
import StaticPage from "../../components/StaticPage.jsx";
import api from "../../api/axios";
import Footer from "../../components/Footer.jsx";

const EMPTY = {name: "", email: "", subject: "", message: ""};

// Contact page with a form that posts the message to the backend contact endpoint.
export default function Contact() {
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState("");

    // Updates a single form field from its input event
    function update(e) {
        setForm((f) => ({...f, [e.target.name]: e.target.value}));
    }

    // Submits the contact form to the API and resets it on success
    async function onSubmit(e) {
        e.preventDefault();
        setStatus("sending");
        setError("");
        try {
            await api.post("/contact", form);
            setStatus("ok");
            setForm(EMPTY);
        } catch (err) {
            setStatus("error");
            setError(
                err?.response?.data?.message ||
                "Une erreur est survenue. Réessaie dans un instant."
            );
        }
    }

    return (
        <div>
            <StaticPage
                title="Contact"
                subtitle="Vous avez des questions ? Posez-les nous en toute simplicité via notre formule de contact. Pour toute demande de partenariat, écrivez à : charles.gauthier99@gmail.com."
            >
                {status === "ok" && (
                    <div className="contact-form__status contact-form__status--ok">
                        Merci ! Votre message a bien été envoyé - nous allons vous répondre au plus vite.
                    </div>
                )}
                {status === "error" && (
                    <div className="contact-form__status contact-form__status--error">
                        {error}
                    </div>
                )}

                <form className="contact-form" onSubmit={onSubmit}>
                    <label>
                        Nom
                        <input name="name" value={form.name} onChange={update} required maxLength={120}/>
                    </label>
                    <label>
                        Email
                        <input type="email" name="email" value={form.email} onChange={update} required maxLength={190}/>
                    </label>
                    <label>
                        Sujet
                        <input name="subject" value={form.subject} onChange={update} maxLength={160}/>
                    </label>
                    <label>
                        Message
                        <textarea name="message" value={form.message} onChange={update} required maxLength={5000}/>
                    </label>
                    <button
                        type="submit"
                        className="btn"
                        disabled={status === "sending"}
                    >
                        {status === "sending" ? "Envoi…" : "Envoyer"}
                    </button>
                </form>

            </StaticPage>
            <Footer/>
        </div>
    );
}
