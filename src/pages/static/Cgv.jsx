import { Link } from "react-router-dom";
import StaticPage from "../../components/StaticPage.jsx";
import Footer from "../../components/Footer.jsx";

const PH = ({ children }) => (
    <span className="placeholder-field">{children}</span>
);

export default function Cgv() {
    return (
        <div>
            <StaticPage
                title="Conditions générales de vente"
                subtitle="Les règles applicables à toute commande sur gauthierfitness.fr."
            >
                <h2>Article 1 - Objet</h2>
                <p>
                    Les présentes conditions régissent les ventes conclues sur le site{" "}
                    gauthierfitness.fr entre <PH>[Raison sociale]</PH> (« le Vendeur »)
                    et toute personne effectuant un achat (« le Client »).
                </p>

                <h2>Article 2 - Produits</h2>
                <p>
                    Les produits proposés sont décrits avec la plus grande exactitude
                    possible. Certains articles sont <strong>personnalisables</strong>{" "}
                    via notre configurateur 3D (couleurs, motifs, logos). Les visuels
                    de personnalisation sont fournis à titre indicatif.
                </p>

                <h2>Article 3 - Prix</h2>
                <p>
                    Les prix sont indiqués en euros, toutes taxes comprises (TTC). Les
                    frais de livraison sont précisés avant la validation de la
                    commande. Le Vendeur se réserve le droit de modifier ses prix à
                    tout moment, le prix appliqué étant celui en vigueur au moment de
                    la commande.
                </p>

                <h2>Article 4 - Commande</h2>
                <p>
                    La commande est validée après acceptation des présentes CGV et
                    confirmation du paiement. Un e-mail de confirmation récapitule la
                    commande.
                </p>

                <h2>Article 5 - Paiement</h2>
                <p>
                    Le paiement s'effectue en ligne par carte bancaire via notre
                    prestataire sécurisé <strong>Stripe</strong>. Les données
                    bancaires ne transitent jamais par nos serveurs.
                </p>

                <h2>Article 6 - Livraison</h2>
                <p>
                    Les modalités, délais et frais sont détaillés sur la page{" "}
                    <Link to="/shipping">Livraison &amp; frais de port</Link>.
                </p>

                <h2>Article 7 - Droit de rétractation</h2>
                <p>
                    Conformément à l'article L221-18 du Code de la consommation, le
                    Client dispose d'un délai de <strong>14 jours</strong> pour
                    exercer son droit de rétractation, sans avoir à se justifier.
                </p>
                <p>
                    <strong>Exception importante :</strong> conformément à l'article
                    L221-28 du même code, ce droit{" "}
                    <strong>ne s'applique pas aux produits personnalisés</strong>{" "}
                    (articles confectionnés selon les spécifications du Client via le
                    configurateur). Ces produits ne sont ni repris ni échangés, sauf
                    défaut de conformité.
                </p>

                <h2>Article 8 - Garanties légales</h2>
                <p>
                    Tous les produits bénéficient de la garantie légale de conformité
                    (art. L217-3 et suivants du Code de la consommation) et de la
                    garantie des vices cachés (art. 1641 du Code civil).
                </p>

                <h2>Article 9 - Retours &amp; remboursements</h2>
                <p>
                    Les modalités sont décrites sur la page{" "}
                    <Link to="/refunds">Retours &amp; remboursements</Link>.
                </p>

                <h2>Article 10 - Données personnelles</h2>
                <p>
                    Le traitement des données est détaillé dans notre{" "}
                    <Link to="/privacy">politique de confidentialité</Link>.
                </p>

                <h2>Article 11 - Litiges &amp; médiation</h2>
                <p>
                    Les présentes CGV sont soumises au droit français. En cas de
                    litige, le Client peut recourir gratuitement à un médiateur de la
                    consommation (<PH>[Nom &amp; coordonnées du médiateur]</PH>) ou à
                    la plateforme européenne de règlement en ligne des litiges :{" "}
                    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
                        ec.europa.eu/consumers/odr
                    </a>
                    .
                </p>

                <hr className="static-divider" />

                <h2>Conditions d'utilisation du configurateur 3D</h2>
                <p>
                    Les présentes conditions s'ajoutent aux CGV et régissent
                    spécifiquement l'utilisation du configurateur 3D de
                    personnalisation proposé sur gauthierfitness.fr.
                </p>

                <h3>1. Objet</h3>
                <p>
                    Le configurateur 3D est un outil permettant de concevoir des
                    produits personnalisés (t-shirts, sweats, vestes, leggings…) en
                    choisissant couleurs, motifs, logos et inscriptions, puis de les
                    commander à la fabrication.
                </p>

                <h3>2. Accès et compte</h3>
                <p>
                    L'utilisation du configurateur est gratuite. La conception est
                    libre, mais l'enregistrement d'une création nécessite un compte
                    (adresse e-mail valide). Tu dois être âgé d'au moins{" "}
                    <strong>16 ans</strong> ; si tu es mineur, l'autorisation de ton
                    représentant légal est requise.
                </p>

                <h3>3. Droit d'utilisation du logiciel</h3>
                <p>
                    GauthierFitness t'accorde un droit{" "}
                    <strong>non exclusif et non transférable</strong> d'utiliser le
                    configurateur pour créer tes propres designs, dans le cadre des
                    présentes conditions. Toute autre exploitation est interdite :
                    reproduction, distribution, décompilation, rétro-ingénierie ou
                    réutilisation, totale ou partielle, du configurateur ou de son code.
                </p>

                <h3>4. Responsabilité des contenus et droits de tiers</h3>
                <p>
                    Tu es <strong>seul responsable</strong> des éléments que tu intègres
                    à tes créations (logos, visuels, textes, noms). Tu garantis qu'ils
                    ne portent atteinte à aucun droit de tiers ni disposition légale :
                    droit d'auteur, marques, dessins et modèles, droit à l'image, droit
                    de la personnalité, concurrence. En cas de manquement, tu garantis
                    GauthierFitness contre toute réclamation et en assumes les frais (y
                    compris de défense). GauthierFitness n'est pas tenu de contrôler les
                    créations mais peut refuser de fabriquer un produit au design
                    manifestement illicite.
                </p>

                <h3>5. Fabrication sur mesure, pas de rétractation</h3>
                <p>
                    Les produits conçus via le configurateur sont fabriqués sur mesure
                    selon tes spécifications. Conformément à l'article L221-28 du Code
                    de la consommation, ils ne bénéficient{" "}
                    <strong>pas du droit de rétractation</strong>, y compris pour les
                    consommateurs (voir Article 7 ci-dessus).
                </p>

                <h3>6. Rendu et variations</h3>
                <p>
                    GauthierFitness s'efforce de respecter les couleurs et
                    spécifications choisies. De légères variations entre la
                    prévisualisation 3D et le produit fini (couleur, matière, rendu
                    d'impression) sont toutefois possibles et inhérentes à l'impression
                    textile ; elles ne constituent pas un défaut.
                </p>

                <h3>7. Disponibilité du service</h3>
                <p>
                    GauthierFitness ne garantit pas une disponibilité permanente du
                    configurateur (maintenance, aléas réseau). Une disponibilité de
                    100 % n'est techniquement pas réalisable.
                </p>

                <h3>8. Données personnelles</h3>
                <p>
                    Les données liées à ton compte et à tes créations sont traitées
                    conformément à notre{" "}
                    <Link to="/privacy">politique de confidentialité</Link>.
                </p>

                <h3>9. Droit applicable</h3>
                <p>
                    Les présentes conditions d'utilisation sont soumises au droit
                    français. Si une clause est jugée invalide, les autres demeurent
                    applicables.
                </p>

                <p className="static-page__updated">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}.
                </p>
            </StaticPage>
            <Footer/>
        </div>
    );
}