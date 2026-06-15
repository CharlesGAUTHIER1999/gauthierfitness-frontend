import { Link } from "react-router-dom";
import StaticPage from "../../components/StaticPage.jsx";
import Footer from "../../components/Footer.jsx";

const PH = ({ children }) => (
    <span className="placeholder-field">{children}</span>
);

export default function Privacy() {
    return (
        <div>
            <StaticPage
                title="Politique de confidentialité"
                subtitle="Comment nous traitons et protégeons tes données personnelles (RGPD)."
            >
                <div className="static-notice">
                    <strong>GAUTHIER FITNESS</strong> - Document type conforme au
                    RGPD, à adapter à l'identité réelle de l'éditeur avant exploitation.
                </div>

                <h2>1. Responsable du traitement</h2>
                <p>
                    Le responsable du traitement des données est{" "}
                    <PH>[GAUTHIER FITNESS]</PH>, joignable à l'adresse{" "}
                    charles.gauthier99@gmail.com.
                </p>

                <h2>2. Données collectées</h2>
                <ul>
                    <li>
                        <strong>Identité &amp; contact</strong> : nom, prénom, e-mail,
                        téléphone, adresses de livraison et de facturation.
                    </li>
                    <li>
                        <strong>Commandes</strong> : produits, personnalisations,
                        historique d'achats.
                    </li>
                    <li>
                        <strong>Paiement</strong> : traité directement par notre
                        prestataire <strong>Stripe</strong> — nous ne stockons jamais
                        tes numéros de carte.
                    </li>
                    <li>
                        <strong>Données techniques</strong> : données de connexion et
                        de session nécessaires au fonctionnement du site.
                    </li>
                </ul>

                <h2>3. Finalités &amp; bases légales</h2>
                <ul>
                    <li>Gestion des commandes et du compte client (exécution du contrat).</li>
                    <li>Service client et réponse aux demandes (intérêt légitime).</li>
                    <li>Respect des obligations comptables et légales (obligation légale).</li>
                    <li>
                        Envoi d'informations commerciales, le cas échéant, avec ton
                        consentement (consentement).
                    </li>
                </ul>

                <h2>4. Destinataires</h2>
                <p>
                    Tes données sont destinées à GauthierFitness et à ses
                    sous-traitants techniques strictement nécessaires : prestataire de
                    paiement (Stripe), hébergeur (OVH), service d'e-mailing (Mailjet),
                    transporteurs. Aucune donnée n'est vendue à des tiers.
                </p>

                <h2>5. Durée de conservation</h2>
                <p>
                    Données de compte : pendant la durée de la relation, puis archivage
                    légal. Données de commande/facturation : 10 ans (obligation
                    comptable). Prospects : 3 ans après le dernier contact.
                </p>

                <h2>6. Tes droits</h2>
                <p>
                    Conformément au RGPD, tu disposes des droits d'accès, de
                    rectification, d'effacement, de limitation, d'opposition et de
                    portabilité. Pour les exercer, écris à{" "}
                    charles.gauthier99@gmail.com. Tu peux aussi introduire une
                    réclamation auprès de la <strong>CNIL</strong> (
                    <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>
                    ).
                </p>

                <h2>7. Cookies</h2>
                <p>
                    Seuls des cookies strictement nécessaires (session,
                    authentification, panier) sont utilisés. Aucun traçage publicitaire
                    tiers.
                </p>

                <p>
                    Voir aussi nos <Link to="/legal">mentions légales</Link>.
                </p>

                <p className="static-page__updated">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}.
                </p>
            </StaticPage>
            <Footer/>
        </div>
    );
}