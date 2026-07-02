import {Link} from "react-router-dom";
import StaticPage from "../../components/StaticPage.jsx";
import Footer from "../../components/Footer.jsx";

const PH = ({children}) => (
    <span className="placeholder-field">{children}</span>
);

// Static shipping & delivery fees page
export default function Shipping() {
    return (
        <div>
            <StaticPage
                title="Livraison & frais de port"
                subtitle="Délais, modes d'expédition et frais de livraison."
            >
                <h2>Zones de livraison</h2>
                <p>
                    Nous livrons en <PH>[France métropolitaine / UE / …]</PH>. Pour
                    toute autre destination, contacte-nous au préalable.
                </p>

                <h2>Délais</h2>
                <ul>
                    <li>
                        <strong>Produits standards</strong> : expédition sous{" "}
                        <PH>[24-48h]</PH>, livraison en <PH>[2 à 4 jours ouvrés]</PH>.
                    </li>
                    <li>
                        <strong>Produits personnalisés</strong> : fabrication sous{" "}
                        <PH>[3 à 5 jours ouvrés]</PH> avant expédition (chaque pièce
                        est confectionnée à la commande).
                    </li>
                </ul>

                <h2>Modes &amp; frais de livraison</h2>
                <ul>
                    <li>
                        Livraison standard (<PH>[DHL]</PH>) :{" "}
                        <PH>[4,90 €]</PH>
                    </li>
                    <li>
                        Livraison express (<PH>[CHRONOPOST]</PH>) :{" "}
                        <PH>[9,90 €]</PH>
                    </li>
                    <li>
                        <strong>Offerte</strong> dès <PH>[70 €]</PH> d'achat.
                    </li>
                </ul>
                <p>
                    Le montant exact des frais est calculé et affiché avant la
                    validation du paiement.
                </p>

                <h2>Suivi de commande</h2>
                <p>
                    Un e-mail de confirmation puis un numéro de suivi te sont envoyés
                    dès l'expédition. Tu peux aussi suivre tes commandes depuis ton{" "}
                    <Link to="/account/orders">espace client</Link>.
                </p>

                <h2>Retard ou colis endommagé</h2>
                <p>
                    En cas de problème à la réception, contacte-nous via la{" "}
                    <Link to="/contact">page contact</Link> - on s'en occupe
                    rapidement.
                </p>

                <p className="static-page__updated">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}.
                </p>
            </StaticPage>
            <Footer/>
        </div>
    );
}