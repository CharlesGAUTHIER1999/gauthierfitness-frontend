import {useEffect} from "react";
import {Link} from "react-router-dom";
import Footer from "../../components/layout/Footer.jsx";

// Static "About us" page
export default function About() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "À propos de nous";
    }, []);

    return (
        <div>
            <div className="about-page">
                <section className="about-row">
                    <div className="about-row__text">
                        <h1>À propos de nous</h1>
                        <p>
                            <strong>GauthierFitness</strong> est né d'une idée simple :
                            ton équipement de sport devrait te ressembler. Trop de
                            marques imposent les mêmes coupes, les mêmes couleurs, les
                            mêmes logos. Nous avons voulu remettre le choix entre tes
                            mains — littéralement.
                        </p>
                        <p>
                            Du textile (t-shirts, sweats, vestes, leggings) aux
                            accessoires et à la nutrition, nous sélectionnons des
                            produits pensés pour la performance et le quotidien. Et une
                            partie de notre catalogue est{" "}
                            <strong>entièrement personnalisable</strong> via notre
                            configurateur 3D.
                        </p>
                    </div>
                    <div className="about-row__media">
                        <img
                            src="/about/hero.png"
                            alt="Athlète à l'entraînement en salle de musculation"
                        />
                    </div>
                </section>

                <section className="about-row">
                    <div className="about-row__media about-row__media--contain">
                        <img
                            src="/about/tshirt.png"
                            alt="T-shirt GauthierFitness personnalisé — Built for Life"
                        />
                    </div>
                    <div className="about-row__text">
                        <h2>Nos valeurs</h2>

                        <div className="about-value-item">
                            <h3>Personnalisation 3D</h3>
                            <p>
                                Un configurateur en temps réel pour créer un produit
                                unique, visualisé sous toutes les coutures avant de
                                commander.
                            </p>
                        </div>
                        <div className="about-value-item">
                            <h3>Qualité sélectionnée</h3>
                            <p>
                                Des matières et des coupes choisies pour durer et
                                accompagner ton effort, séance après séance.
                            </p>
                        </div>
                        <div className="about-value-item">
                            <h3>Made for athletes</h3>
                            <p>
                                Pensé par des passionnés de sport, pour des passionnés
                                de sport — du débutant au compétiteur.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="about-mission">
                    <h2>Notre mission</h2>
                    <p>
                        Rendre la personnalisation accessible à tous, sans expertise
                        technique ni quantité minimale. Que tu commandes une pièce
                        unique ou que tu équipes ton club, tu mérites un produit qui
                        porte ta marque.
                    </p>
                    <p>
                        Une question, un projet d'équipe ? Écris-nous via la{" "}
                        <Link to="/contact">page contact</Link> - on adore échanger.
                    </p>
                </section>
            </div>
            <Footer/>
        </div>
    );
}