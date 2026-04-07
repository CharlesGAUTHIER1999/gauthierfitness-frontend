import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import ProductCustomizer from "../features/customization/components/ProductCustomizer";
import "../productcustomization.css";

export default function ProductCustomizePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const selectedOptionId = location.state?.selectedOptionId ?? null;

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const p = await getProduct(slug);

                if (!mounted) return;

                if (!p?.is_customizable) {
                    navigate(`/products/${slug}`, { replace: true });
                    return;
                }

                setProduct(p);
            } catch (e) {
                console.error(e);
                navigate("/products", { replace: true });
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [slug, navigate]);

    const selectedOption = useMemo(() => {
        if (!product || !selectedOptionId) return null;
        const options = Array.isArray(product.options) ? product.options : [];
        return options.find((opt) => Number(opt.id) === Number(selectedOptionId)) ?? null;
    }, [product, selectedOptionId]);

    if (loading) return <p className="pc-loading">Chargement...</p>;
    if (!product) return <p className="pc-loading">Produit introuvable.</p>;

    return (
        <div className="pc-page">
            <div className="pc-topbar">
                <div>
                    <p className="pc-kicker">Configurateur produit</p>
                    <h1 className="pc-title">{product.name}</h1>
                    <div className="pc-meta">
                        <span className="pc-price">
                          {Number(product.price_ttc || 0).toFixed(2)} €
                        </span>
                        {selectedOption && (
                            <span className="pc-option">
                                Taille / option : {selectedOption.label || selectedOption.code}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    className="pc-back-btn"
                    onClick={() => navigate(`/products/${product.slug}`)}
                >
                    Retour à la fiche produit
                </button>
            </div>

            {!selectedOptionId && (
                <div className="pc-warning">
                    Aucune option n’a été transmise depuis la fiche produit. Pour un rendu
                    cohérent, retourne à la fiche produit et sélectionne d’abord la taille
                    ou l’option voulue.
                </div>
            )}

            <ProductCustomizer
                product={product}
                selectedOptionId={selectedOptionId}
                disabled={false}
            />
        </div>
    );
}