import {useEffect, useMemo, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {getProduct} from "../services/productService";
import SizeGuideDrawer from "../components/product/SizeGuideDrawer.jsx";
import {useCart} from "../context/CartContext.jsx";

// Product page
export default function ProductDetail() {
    const {slug} = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const {addItem, openCart} = useCart();

    const [selectedSizeOpt, setSelectedSizeOpt] = useState(null);
    const [selectedFormatOpt, setSelectedFormatOpt] = useState(null);
    const [selectedCapacityOpt, setSelectedCapacityOpt] = useState(null);
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        setNotFound(false);

        getProduct(slug).then((p) => {
            if (!mounted) return;
            setProduct(p);
            setSelectedSizeOpt(null);
            setSelectedFormatOpt(null);
            setSelectedCapacityOpt(null);
        }).catch((e) => {
            if (!mounted) return;
            if (e?.response?.status === 404) {
                setNotFound(true);
            } else {
                throw e;
            }
        });

        return () => {
            mounted = false;
        };
    }, [slug]);

    const images = useMemo(() => {
        const imgs = Array.isArray(product?.images) ? product.images : [];

        if (imgs.length === 0) {
            const fallback = [];
            if (product?.main_image) {
                fallback.push({id: "main", url: product.main_image, is_main: true});
            }
            if (product?.hover_image) {
                fallback.push({id: "hover", url: product.hover_image, is_main: false});
            }
            return fallback;
        }

        const main = imgs.find((i) => i.is_main);
        const rest = imgs.filter((i) => !i.is_main);
        return main ? [main, ...rest] : imgs;
    }, [product]);

    const allOptions = useMemo(
        () => (Array.isArray(product?.options) ? product.options : []),
        [product]
    );

    const sizeOptions = useMemo(
        () => allOptions.filter((o) => o.type === "size"),
        [allOptions]
    );

    const formatOptions = useMemo(
        () => allOptions.filter((o) => o.type === "format"),
        [allOptions]
    );

    const capacityOptions = useMemo(
        () => allOptions.filter((o) => o.type === "capacity"),
        [allOptions]
    );

    const canAddToCart = useMemo(() => {
        if (sizeOptions.length > 0 && !selectedSizeOpt) return false;
        if (formatOptions.length > 0 && !selectedFormatOpt) return false;
        if (capacityOptions.length > 0 && !selectedCapacityOpt) return false;
        return true;
    }, [
        sizeOptions.length,
        formatOptions.length,
        capacityOptions.length,
        selectedSizeOpt,
        selectedFormatOpt,
        selectedCapacityOpt,
    ]);

    const variantTitle = useMemo(() => {
        if (product?.variant_name) return product.variant_name;
        if (product?.variant_type === "flavor") return "Goûts";
        if (formatOptions.length > 0) return "Goûts";
        return "Couleur";
    }, [product?.variant_name, product?.variant_type, formatOptions.length]);

    if (notFound) {
        return (
            <div className="container pay-result">
                <h1>Produit introuvable</h1>
                <p className="ck-muted">Ce produit n'existe pas ou n'est plus disponible.</p>
                <Link className="ck-link" to="/products">Voir tous les produits</Link>
            </div>
        );
    }

    if (!product) return <p>Chargement...</p>;

    const price = Number(product.price_ttc || 0).toFixed(2);

    const selectedPrimaryOption =
        selectedSizeOpt ?? selectedFormatOpt ?? selectedCapacityOpt ?? null;

    const isCustomizable = Boolean(product?.is_customizable);

    // Login redirection
    function handleCustomize() {
        const redirectUrl = `/products/${product.slug}/customize`;

        if (!localStorage.getItem("token")) {
            navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }

        navigate(redirectUrl, {
            state: {
                selectedOptionId: selectedPrimaryOption?.id ?? null,
                selectedOptionType: selectedPrimaryOption?.type ?? null,
                selectedOptionCode: selectedPrimaryOption?.code ?? null,
                selectedOptionLabel: selectedPrimaryOption?.label ?? null,
            },
        });
    }

    return (
        <div className="pd">
            <section className="pd-gallery" aria-label="Galerie produit">
                {images.length > 0 ? (
                    images.map((img, index) => (
                        <button
                            key={img.id ?? `${img.url}-${index}`}
                            className="pd-media"
                            type="button"
                            onClick={() => {
                            }}
                            aria-label={`Voir image ${index + 1}`}
                        >
                            <img
                                src={img.url}
                                alt={`${product.name} ${index + 1}`}
                                loading="lazy"
                            />
                        </button>
                    ))
                ) : (
                    <div className="pd-media">
                        <img
                            src="/placeholder.png"
                            alt={product.name || "Image non disponible"}
                        />
                    </div>
                )}
            </section>

            <aside className="pd-panel">
                <div className="pd-header">
                    {product?.supplier?.name && (
                        <p className="pd-brand">GAUTHIER FITNESS</p>
                    )}
                    <h1 className="pd-title">{product.name}</h1>
                    <div className="pd-price-row">
                        <p className="pd-price">{price}€</p>
                        <p className="pd-tax">
                            Taxes incluses. Frais d'expédition calculés à l'étape de paiement.
                        </p>
                    </div>
                    <p className="pd-desc">{product.description}</p>
                </div>

                {product?.variants?.length > 0 && (
                    <div className="pd-block">
                        <div className="pd-block-head">
                            <h4>{variantTitle}</h4>
                        </div>

                        <div className="pd-swatches">
                            {product.variants.map((v) => {
                                const label =
                                    v.variant_value_label ||
                                    v.flavor_label ||
                                    v.color_label ||
                                    v.slug;

                                return (
                                    <button
                                        key={v.slug}
                                        type="button"
                                        className={`pd-swatch ${v.slug === product.slug ? "is-active" : ""}`}
                                        onClick={() => navigate(`/products/${v.slug}`)}
                                        title={label}
                                        aria-label={label}
                                    >
                                        <img
                                            src={v.thumb_url || product.main_image}
                                            alt={label}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {sizeOptions.length > 0 && (
                    <div className="pd-block">
                        <div className="pd-block-head">
                            <h4>Taille</h4>
                            <button
                                type="button"
                                className="pd-link"
                                onClick={() => setSizeGuideOpen(true)}
                            >
                                Guide des tailles
                            </button>
                        </div>

                        <div className="pd-sizes">
                            {sizeOptions.map((opt) => {
                                const isActive = selectedSizeOpt?.id === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`pd-size ${isActive ? "is-active" : ""}`}
                                        disabled={!opt.in_stock}
                                        onClick={() => setSelectedSizeOpt(opt)}
                                        title={!opt.in_stock ? "Rupture de stock" : undefined}
                                    >
                                        {opt.code}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {formatOptions.length > 0 && (
                    <div className="pd-block">
                        <div className="pd-block-head">
                            <h4>Format</h4>
                        </div>

                        <div className="pd-sizes">
                            {formatOptions.map((opt) => {
                                const isActive = selectedFormatOpt?.id === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`pd-size ${isActive ? "is-active" : ""}`}
                                        disabled={!opt.in_stock}
                                        onClick={() => setSelectedFormatOpt(opt)}
                                    >
                                        {opt.label || opt.code}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {capacityOptions.length > 0 && (
                    <div className="pd-block">
                        <div className="pd-block-head">
                            <h4>Capacité</h4>
                        </div>

                        <div className="pd-sizes">
                            {capacityOptions.map((opt) => {
                                const isActive = selectedCapacityOpt?.id === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`pd-size ${isActive ? "is-active" : ""}`}
                                        disabled={!opt.in_stock}
                                        onClick={() => setSelectedCapacityOpt(opt)}
                                    >
                                        {opt.label || opt.code}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="pd-cta">
                    <button
                        className="pd-add"
                        disabled={!canAddToCart}
                        onClick={async () => {
                            try {
                                await addItem({
                                    productId: product.id,
                                    optionId: selectedPrimaryOption?.id ?? null,
                                    quantity: 1,
                                });
                                openCart();
                            } catch (e) {
                                console.error("Erreur ajout panier :", e);
                            }
                        }}
                    >
                        Ajouter au panier
                    </button>
                </div>

                {isCustomizable && (
                    <div className="pd-cta" style={{marginTop: 12}}>
                        <button
                            type="button"
                            className="pd-add"
                            disabled={!canAddToCart}
                            onClick={handleCustomize}
                        >
                            Personnaliser ce produit
                        </button>
                    </div>
                )}

                <ul className="pd-bullets">
                    <li>Article disponible - Délai de livraison : 4–7 jours ouvrés</li>
                </ul>
            </aside>

            <SizeGuideDrawer
                open={sizeGuideOpen}
                onClose={() => setSizeGuideOpen(false)}
            />
        </div>
    );
}