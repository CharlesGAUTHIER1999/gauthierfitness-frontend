import { Link } from "react-router-dom";

export default function AddressesPage() {
    return (
        <div className="pay-result">
            <h1>Adresses</h1>
            <Link className="ck-link" to="/account">
                Retour aux détails du compte
            </Link>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
                <button className="ck-submit" type="button" style={{ width: 320 }}>
                    Ajouter une nouvelle adresse
                </button>
            </div>

            <div className="pay-result-box" style={{ marginTop: 18, textAlign: "center" }}>
                <div style={{ fontWeight: 700 }}>Par défaut</div>
                <div className="ck-muted" style={{ marginTop: 6 }}>France</div>

                <div className="pay-result-actions" style={{ justifyContent: "center" }}>
                    <button className="btn btn-outline" type="button">MODIFIER</button>
                    <button className="btn btn-outline" type="button">SUPPRIMER</button>
                </div>
            </div>
        </div>
    );
}