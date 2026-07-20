import {Link} from "react-router-dom";
import StaticPage from "../../components/layout/StaticPage.jsx";

// Returns portal page
export default function ReturnsPortal() {
    return (
        <div>
            <StaticPage title="Portail des retours">
                <div className="coming-soon">
                    <span className="coming-soon__badge">En cours de réalisation</span>
                    <h2>Le portail des retours arrive bientôt</h2>
                    <p>
                        Tu pourras bientôt déclarer un retour et générer ton étiquette
                        en quelques clics. En attendant, consulte nos conditions de{" "}
                        <Link to="/refunds">retours &amp; remboursements</Link> ou
                        contacte-nous pour toute demande.
                    </p>
                    <Link to="/contact" className="btn">
                        Demander un retour
                    </Link>
                </div>
            </StaticPage>
        </div>
    );
}