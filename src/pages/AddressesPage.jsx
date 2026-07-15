import {Link} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../store/auth";

export default function AddressesPage() {
    const {user, updateProfile} = useAuth();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        address: user?.address || "",
        zip: user?.zip || "",
        city: user?.city || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    function startEditing() {
        setForm({
            address: user?.address || "",
            zip: user?.zip || "",
            city: user?.city || "",
        });
        setError(null);
        setMessage(null);
        setEditing(true);
    }

    async function submit(e) {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            await updateProfile(form);
            setMessage("Adresse mise à jour.");
            setEditing(false);
        } catch (err) {
            const validation = err?.response?.data?.errors;
            if (validation && typeof validation === "object") {
                const firstKey = Object.keys(validation)[0];
                setError(validation[firstKey]?.[0] || "Erreur de validation.");
            } else {
                setError(
                    err?.response?.data?.message ||
                    "Impossible de mettre à jour l'adresse. Réessaie dans un instant."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    const hasAddress = Boolean(user?.address || user?.zip || user?.city);

    return (
        <div className="pay-result">
            <h1>Adresses</h1>
            <Link className="ck-link" to="/account">
                Retour aux détails du compte
            </Link>

            {message && <div className="ck-success mt-lg">{message}</div>}

            {!editing ? (
                <div className="pay-result-box mt-lg text-center">
                    <div style={{fontWeight: 700}}>Par défaut</div>

                    {hasAddress ? (
                        <div className="ck-muted mt-sm">
                            {user.address && <div>{user.address}</div>}
                            <div>{[user.zip, user.city].filter(Boolean).join(" ")}</div>
                            <div>France</div>
                        </div>
                    ) : (
                        <div className="ck-muted mt-sm">
                            Aucune adresse enregistrée pour le moment.
                        </div>
                    )}

                    <div className="pay-result-actions" style={{justifyContent: "center"}}>
                        <button className="btn btn-outline" type="button" onClick={startEditing}>
                            MODIFIER
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit} className="pay-result-box mt-lg" style={{maxWidth: 360}}>
                    {error && <div className="ck-error">{error}</div>}

                    <div className="ck-grid mt-md" style={{textAlign: "left"}}>
                        <div className="ck-field ck-col-12">
                            <label className="ck-label" htmlFor="address-street">Adresse</label>
                            <input
                                id="address-street"
                                className="ck-input"
                                type="text"
                                placeholder="12 rue de la Paix"
                                value={form.address}
                                onChange={(e) => setForm({...form, address: e.target.value})}
                                autoComplete="street-address"
                            />
                        </div>

                        <div className="ck-field ck-col-6">
                            <label className="ck-label" htmlFor="address-zip">Code postal</label>
                            <input
                                id="address-zip"
                                className="ck-input"
                                type="text"
                                placeholder="75002"
                                value={form.zip}
                                onChange={(e) => setForm({...form, zip: e.target.value})}
                                autoComplete="postal-code"
                            />
                        </div>

                        <div className="ck-field ck-col-6">
                            <label className="ck-label" htmlFor="address-city">Ville</label>
                            <input
                                id="address-city"
                                className="ck-input"
                                type="text"
                                placeholder="Paris"
                                value={form.city}
                                onChange={(e) => setForm({...form, city: e.target.value})}
                                autoComplete="address-level2"
                            />
                        </div>
                    </div>

                    <div className="pay-result-actions mt-lg" style={{justifyContent: "center"}}>
                        <button className="ck-submit" type="submit" disabled={loading}>
                            {loading ? "Enregistrement…" : "Enregistrer"}
                        </button>
                        <button
                            className="btn btn-outline"
                            type="button"
                            onClick={() => setEditing(false)}
                            disabled={loading}
                        >
                            ANNULER
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
