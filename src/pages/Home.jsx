import { useEffect, useState } from "react";
import { getProducts } from "../services/productService.js";
import ProductCard from "../components/ProductCard.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
    const [womenNew, setWomenNew] = useState([]);
    const [menNew, setMenNew] = useState([]);
    const [womenBest, setWomenBest] = useState([]);
    const [menBest, setMenBest] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        Promise.all([
            getProducts({ gender: "femmes", tag: "new", per_page: 4 }),
            getProducts({ gender: "hommes", tag: "new", per_page: 4 }),
            getProducts({ gender: "femmes", tag: "bestseller", per_page: 4 }),
            getProducts({ gender: "hommes", tag: "bestseller", per_page: 4 }),
        ])
            .then(([wNew, mNew, wBest, mBest]) => {
                setWomenNew(wNew?.slice?.(0, 4) ?? []);
                setMenNew(mNew?.slice?.(0, 4) ?? []);
                setWomenBest(wBest?.slice?.(0, 4) ?? []);
                setMenBest(mBest?.slice?.(0, 4) ?? []);
            })
            .catch(() => setError("Impossible de charger les produits"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Chargement…</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <div className="container">
                {/* SHOP THE LOOK - FEMMES */}
                <section className="shop-look">
                    <p className="eyebrow">SHOP THE LOOK</p>
                    <h2>Nouveautés pour femmes</h2>

                    <div className="product-grid">
                        {womenNew.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>

                {/* SHOP THE LOOK - HOMMES */}
                <section className="shop-look">
                    <p className="eyebrow">SHOP THE LOOK</p>
                    <h2>Nouveautés pour hommes</h2>

                    <div className="product-grid">
                        {menNew.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>

                {/* RECOMMANDATIONS FEMMES */}
                <section className="recommendations">
                    <h2>Nos produits les plus vendus – Femmes</h2>

                    <div className="product-grid">
                        {womenBest.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>

                {/* RECOMMANDATIONS HOMMES */}
                <section className="recommendations">
                    <h2>Nos produits les plus vendus – Hommes</h2>

                    <div className="product-grid">
                        {menBest.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            </div>

            {/* PROMISES + FOOTER */}
            <section className="promises">
                <p className="promises-brand">GAUTHIER GYMWEAR</p>
                <h2 className="promises-title">Nos promesses</h2>

                <div className="promises-grid">
                    <div className="promise-item">
                        <div className="promise-icon">💪</div>
                        <h3>La performance</h3>
                        <p>
                            Des produits conçus pour t'accompagner dans chaque entraînement et
                            te pousser à te dépasser.
                        </p>
                    </div>

                    <div className="promise-item">
                        <div className="promise-icon">🔁</div>
                        <h3>La polyvalence</h3>
                        <p>
                            Des vêtements pensés pour le sport, mais aussi pour ton quotidien.
                        </p>
                    </div>

                    <div className="promise-item">
                        <div className="promise-icon">🔥</div>
                        <h3>La motivation</h3>
                        <p>
                            Un style et une qualité qui donnent envie de rester constant et
                            engagé.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}