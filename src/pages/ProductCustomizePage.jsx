import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import ProductCustomizer from "../features/customization/components/ProductCustomizer";
import "../productcustomization.css";

function findEquivalentOption(product, rawState) {
    if (!product || !rawState) return null;

    const options = Array.isArray(product.options) ? product.options : [];
    if (options.length === 0) return null;

    const directId = rawState?.selectedOptionId ?? null;
    if (directId) {
        const directMatch = options.find(
            (opt) => Number(opt.id) === Number(directId)
        );
        if (directMatch) return directMatch;
    }

    const selectedOptionType = rawState?.selectedOptionType ?? null;
    const selectedOptionCode = rawState?.selectedOptionCode ?? null;
    const selectedOptionLabel = rawState?.selectedOptionLabel ?? null;

    if (selectedOptionType && selectedOptionCode) {
        const byTypeAndCode = options.find(
            (opt) =>
                opt.type === selectedOptionType &&
                String(opt.code || "").toLowerCase() ===
                String(selectedOptionCode || "").toLowerCase()
        );

        if (byTypeAndCode) return byTypeAndCode;
    }

    if (selectedOptionType && selectedOptionLabel) {
        const byTypeAndLabel = options.find(
            (opt) =>
                opt.type === selectedOptionType &&
                String(opt.label || "").toLowerCase() ===
                String(selectedOptionLabel || "").toLowerCase()
        );

        if (byTypeAndLabel) return byTypeAndLabel;
    }

    return null;
}

export default function ProductCustomizePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const rawState = location.state || null;

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
        return findEquivalentOption(product, rawState);
    }, [product, rawState]);

    const allOptions = useMemo(
        () => (Array.isArray(product?.options) ? product.options : []),
        [product]
    );

    const hasRequiredOptions = useMemo(() => {
        return allOptions.some((opt) =>
            ["size", "format", "capacity"].includes(opt.type)
        );
    }, [allOptions]);

    const effectiveSelectedOptionId = selectedOption?.id ?? null;
    const isMissingRequiredOption = hasRequiredOptions && !effectiveSelectedOptionId;

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

            {isMissingRequiredOption && (
                <div className="pc-warning">
                    Aucune option valide n’a été transmise pour cette variante. Retourne
                    à la fiche produit et sélectionne d’abord la taille ou l’option voulue.
                </div>
            )}

            <ProductCustomizer
                product={product}
                selectedOptionId={effectiveSelectedOptionId}
                disabled={isMissingRequiredOption}
                selectedOptionMeta={
                    selectedOption
                        ? {
                            id: selectedOption.id,
                            type: selectedOption.type || null,
                            code: selectedOption.code || null,
                            label: selectedOption.label || null,
                        }
                        : null
                }
            />
        </div>
    );
}