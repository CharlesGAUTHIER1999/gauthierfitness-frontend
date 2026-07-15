import {Link} from "react-router-dom";
import {FiAlertTriangle} from "react-icons/fi";
import StaticPage from "../../components/layout/StaticPage.jsx";

const PH = ({children}) => (
    <span className="placeholder-field">{children}</span>
);

// Static returns & refunds policy page
export default function Refunds() {
    return (
        <div>
            <StaticPage
                title="Retours & remboursements"
                subtitle="Comment retourner un article et obtenir un remboursement."
            >
                <h2>Délai de retour</h2>
                <p>
                    Tu disposes de <strong>14 jours</strong> à compter de la réception
                    pour nous retourner un article standard, conformément à ton droit
                    de rétractation (voir <Link to="/cgv">CGV</Link>).
                </p>

                <div className="static-notice">
                    <FiAlertTriangle/> <strong>Produits personnalisés</strong> - Les articles
                    confectionnés via le configurateur (couleurs, motifs, logos sur
                    mesure) ne sont <strong>ni repris ni échangés</strong>, sauf défaut
                    de fabrication ou de conformité (art. L221-28 du Code de la
                    consommation).
                </div>

                <h2>Conditions</h2>
                <ul>
                    <li>Article non porté, non lavé, dans son état et emballage d'origine.</li>
                    <li>Étiquettes d'origine présentes.</li>
                    <li>Preuve d'achat (numéro de commande).</li>
                </ul>

                <h2>Procédure</h2>
                <ol>
                    <li>
                        Déclare ton retour via le{" "}
                        <Link to="/returns">portail des retours</Link> (bientôt
                        disponible) ou la <Link to="/contact">page contact</Link>.
                    </li>
                    <li>Renvoie le colis à l'adresse indiquée <PH>[34 rue du Vélodrome, 33200, Bordeaux, France]</PH>.
                    </li>
                    <li>
                        Les frais de retour sont <PH>[à la charge du client / offerts]</PH>.
                    </li>
                </ol>

                <h2>Remboursement</h2>
                <p>
                    Après réception et contrôle de l'article, le remboursement est
                    effectué sous <strong>14 jours</strong> sur le moyen de paiement
                    d'origine (via Stripe).
                </p>

                <h2>Article défectueux</h2>
                <p>
                    En cas de défaut, le retour et le remboursement (ou l'échange) sont
                    intégralement pris en charge au titre de la garantie légale de
                    conformité.
                </p>

                <p className="static-page__updated">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}.
                </p>
            </StaticPage>
        </div>
    );
}