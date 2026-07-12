import {Link} from "react-router-dom";
import StaticPage from "../../components/layout/StaticPage.jsx";
import Footer from "../../components/layout/Footer.jsx";

const PH = ({children}) => (
    <span className="placeholder-field">{children}</span>
);

// Static legal notice page
export default function LegalMentions() {
    return (
        <div>
            <StaticPage
                title="Mentions légales"
                subtitle="Informations légales relatives au site GauthierFitness."
            >
                <div className="static-notice">
                    <strong>GAUTHIER FITNESS</strong> - Ce site est réalisé dans
                    le cadre d'un titre RNCP niveau 7 (développement logiciel).
                </div>

                <h2>1. Éditeur du site</h2>
                <p>
                    Le site <strong>gauthierfitness.fr</strong> est édité par :<br/>
                    Auteur : <PH>Charles GAUTHIER</PH>
                    <br/>
                    Adresse : <PH>34 rue du Vélodrome, 33200, Bordeaux</PH>
                    <br/>
                    E-mail : charles.gauthier99@gmail.com
                    <br/>
                    Téléphone : <PH>06.52.13.72.74</PH>
                </p>

                <h2>2. Directeur de la publication</h2>
                <p>
                    Le directeur de la publication est <PH>Charles GAUTHIER</PH>.
                </p>

                <h2>3. Hébergement</h2>
                <p>
                    Le site est hébergé par <strong>OVH SAS</strong>, société au
                    capital de 10 069 020 €, immatriculée au RCS de Lille Métropole
                    sous le numéro 537 407 926.<br/>
                    Siège social : 2 rue Kellermann, BP 80157, 59100 Roubaix, France.
                    <br/>
                    Site : <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer">www.ovhcloud.com</a>
                </p>

                <h2>4. Propriété intellectuelle</h2>
                <p>
                    L'ensemble des éléments du site (textes, visuels, logo, modèles
                    3D, code) est protégé par le droit de la propriété intellectuelle.
                    Toute reproduction ou représentation, totale ou partielle, sans
                    autorisation préalable est interdite.
                </p>

                <h2>5. Données personnelles</h2>
                <p>
                    Le traitement de tes données est décrit dans notre{" "}
                    <Link to="/privacy">politique de confidentialité</Link>.
                    Conformément au RGPD, tu disposes d'un droit d'accès, de
                    rectification et de suppression de tes données.
                </p>

                <h2>6. Cookies</h2>
                <p>
                    Le site utilise des cookies strictement nécessaires à son
                    fonctionnement (session, panier, authentification). Aucune donnée
                    n'est revendue à des tiers.
                </p>

                <p className="static-page__updated">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}.
                </p>
            </StaticPage>
            <Footer/>
        </div>
    );
}