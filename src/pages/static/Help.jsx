import {Link} from "react-router-dom";
import StaticPage from "../../components/layout/StaticPage.jsx";

const FAQ = [{
    category: "Commandes", items: [{
        q: "Dois-je créer un compte pour commander ?", a: (<>
            Non, la commande en tant qu'invité est possible. Créer un compte
            te permet simplement de retrouver l'historique de tes commandes
            dans <Link to="/account/orders">Mes commandes</Link>.
        </>),
    }, {
        q: "Comment suivre l'état de ma commande ?", a: (<>
            Un e-mail de confirmation t'est envoyé dès que le paiement est
            validé. Si tu as un compte, le détail reste consultable à tout
            moment dans <Link to="/account/orders">Mes commandes</Link>.
        </>),
    }, {
        q: "Puis-je modifier ou annuler ma commande après paiement ?", a: (<>
            Contacte-nous au plus vite via la page{" "}
            <Link to="/contact">Contact</Link>. Si la commande est déjà en
            préparation, la modification n'est pas toujours possible.
        </>),
    }, {
        q: "Je n'ai pas reçu mon e-mail de confirmation, que faire ?",
        a: "Vérifie d'abord tes courriers indésirables (spam). Si tu ne le trouves toujours pas, contacte-nous en précisant ton adresse e-mail et, si possible, le numéro de commande.",
    },],
}, {
    category: "Livraison", items: [{
        q: "Quels sont les modes de livraison disponibles ?", a: (<>
            Deux modes au choix au moment du paiement : Standard (3 à 5 jours
            ouvrés, gratuite dès 70 € d'achat, 4,90 € sinon) et Express (24 à
            48h, 9,90 € quel que soit le montant). Détails sur la page{" "}
            <Link to="/shipping">Livraison &amp; frais de port</Link>.
        </>),
    }, {
        q: "Comment suivre mon colis ?",
        a: "Le statut de ta commande évolue dans ton espace client une fois expédiée. Pour toute question sur l'acheminement, contacte-nous avec ton numéro de commande.",
    }, {
        q: "Livrez-vous en dehors de la France ?",
        a: "Non, nous livrons uniquement en France métropolitaine pour le moment.",
    }, {
        q: "Ma commande n'est pas arrivée dans les délais annoncés, que faire ?", a: (<>
            Contacte-nous via la page <Link to="/contact">Contact</Link> en
            précisant ton numéro de commande, nous regardons ça avec toi.
        </>),
    },],
}, {
    category: "Paiement", items: [{
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Le paiement s'effectue par carte bancaire, via notre prestataire sécurisé Stripe.",
    }, {
        q: "Le paiement est-il sécurisé ?",
        a: "Oui. Le paiement est chiffré de bout en bout et tes données bancaires ne transitent jamais par nos serveurs.",
    }, {
        q: "Mon paiement a été refusé, pourquoi ?",
        a: "Vérifie les informations de ta carte (numéro, date, CVC) et son plafond disponible. Si le problème persiste, contacte ta banque ou réessaie avec une autre carte.",
    }, {
        q: "Ai-je une preuve de paiement ?",
        a: "Oui : tu reçois un e-mail de confirmation de commande, ainsi qu'un reçu de paiement automatique envoyé par Stripe.",
    },],
}, {
    category: "Personnalisation", items: [{
        q: "Comment personnaliser un produit ?",
        a: 'Sur la fiche des produits éligibles (Femmes/Hommes), utilise le bouton « Personnaliser ce produit » pour ouvrir le configurateur 3D et choisir couleurs, motifs, logo et texte.',
    }, {
        q: "Comment fonctionne la génération de design par IA ?",
        a: "Depuis le configurateur, décris le visuel que tu imagines en quelques mots : un design est généré et ajouté à ta création. Cette fonctionnalité nécessite d'être connecté à un compte.",
    }, {
        q: "Puis-je utiliser mon propre logo ou une image ?",
        a: "Oui, tu peux importer un logo ou une image (PNG, JPG ou WebP) directement depuis le configurateur.",
    }, {
        q: "Puis-je reprendre ma personnalisation après l'avoir ajoutée au panier ?",
        a: "Oui, tant que tu n'as pas payé. Si tu reviens en arrière depuis le paiement, ta création est automatiquement réaffichée dans le configurateur.",
    },],
}, {
    category: "Retours & remboursements", items: [{
        q: "Quelle est votre politique de retour ?", a: (<>
            Pour les produits standards, tu disposes de 14 jours après
            réception pour te rétracter. Le détail complet (conditions,
            procédure, délais de remboursement) est sur la page{" "}
            <Link to="/refunds">Retours &amp; remboursements</Link>.
        </>),
    }, {
        q: "Un produit personnalisé peut-il être retourné ?", a: (<>
            Non, sauf défaut de fabrication ou de conception : les produits
            conçus via le configurateur ne bénéficient pas du droit de
            rétractation (article L221-28 du Code de la consommation). Voir{" "}
            <Link to="/refunds">Retours &amp; remboursements</Link>.
        </>),
    }, {
        q: "Comment demander un retour ou un échange ?", a: (<>
            Passe par la page <Link to="/contact">Contact</Link> avec ton
            numéro de commande. Un portail de retour en libre-service est en
            préparation.
        </>),
    },],
}, {
    category: "Mon compte", items: [{
        q: "Comment créer un compte ou me connecter ?", a: (<>
            Depuis l'icône compte en haut du site : <Link to="/register">créer un compte</Link>{" "}
            ou <Link to="/login">se connecter</Link>.
        </>),
    }, {
        q: "J'ai oublié mon mot de passe, comment le réinitialiser ?", a: (<>
            Utilise le lien « Mot de passe oublié ? » sur la page de{" "}
            <Link to="/login">connexion</Link>, ou accède directement à la{" "}
            <Link to="/forgot-password">réinitialisation</Link>.
        </>),
    }, {
        q: "Mes informations personnelles sont-elles sécurisées ?", a: (<>
            Oui, le traitement de tes données est détaillé dans notre{" "}
            <Link to="/privacy">politique de confidentialité</Link>.
        </>),
    }, {
        q: "Comment supprimer mon compte ?", a: (<>
            Contacte-nous via la page <Link to="/contact">Contact</Link>, nous
            traitons ta demande de suppression manuellement.
        </>),
    },],
},];

// Help center
export default function Help() {
    return (<div>
        <StaticPage
            title="Centre d'aide"
            subtitle="Les réponses aux questions les plus fréquentes. Tu ne trouves pas la tienne ? Écris-nous via la page Contact."
        >
            {FAQ.map((section) => (<div key={section.category} className="faq-section">
                <h2>{section.category}</h2>
                {section.items.map((item) => (<details key={item.q} className="faq-item">
                    <summary className="faq-item__question">{item.q}</summary>
                    <div className="faq-item__answer">{item.a}</div>
                </details>))}
            </div>))}

            <p style={{marginTop: 40}}>
                Tu ne trouves pas de réponse à ta question ?{" "}
                <Link to="/contact">Contacte-nous</Link>.
            </p>
        </StaticPage>
    </div>);
}
