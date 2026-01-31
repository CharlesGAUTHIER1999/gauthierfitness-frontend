import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function AccountPage() {
    const { user, logout } = useAuth();

    return (
        <div className="pay-result">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h1>Compte</h1>
                <button className="ck-link" type="button" onClick={logout}>
                    Déconnexion
                </button>
            </div>

            <div className="pay-result-box" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, margin: 0 }}>Historique des commandes</h2>
                    <p className="ck-muted" style={{ marginTop: 6 }}>
                        Vous n’avez encore passé aucune commande.
                    </p>
                </div>

                <div>
                    <h2 style={{ fontSize: 18, margin: 0 }}>Détails du compte</h2>
                    <div className="ck-muted" style={{ marginTop: 6 }}>
                        {user?.country || "France"}
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <Link className="ck-link" to="/account/addresses">
                            Voir les adresses (1)
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}