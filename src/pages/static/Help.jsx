import {Link} from "react-router-dom";
import StaticPage from "../../components/StaticPage.jsx";

// Static "Help center" placeholder page (feature coming soon)
export default function Help() {
    return (
        <StaticPage title="Centre d'aide">
            <div className="coming-soon">
                <span className="coming-soon__badge">En cours de réalisation</span>
                <h2>Notre centre d'aide arrive bientôt</h2>
                <p>
                    Nous préparons une FAQ complète (commandes, personnalisation,
                    paiement, suivi…). En attendant, notre équipe répond
                    directement à tes questions.
                </p>
                <Link to="/contact" className="btn">
                    Nous contacter
                </Link>
            </div>
        </StaticPage>
    );
}