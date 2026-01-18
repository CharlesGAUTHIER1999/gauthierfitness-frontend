import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import SizeGuideDrawer from "../components/SizeGuideDrawer.jsx";

export default function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    // stockage des options
    const [selectedSizeOpt, setSelectedSizeOpt] = useState(null);
    const [selectedFormatOpt, setSelectedFormatOpt] = useState(null);
    const [selectedCapacityOpt, setSelectedCapacityOpt] = useState(null);
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        getProduct(slug).then((p) => {
            if (!mounted) return;
            setProduct(p);
            setSelectedSizeOpt(null);
            setSelectedFormatOpt(null);
            setSelectedCapacityOpt(null);
        });

        return () => {
            mounted = false;
        };
    }, [slug]);

    const images = useMemo(() => {
        const imgs = Array.isArray(product?.images) ? product.images : [];

        // fallback si API renvoie main_image/hover_image mais pas images[]
        if (imgs.length === 0) {
            const fallback = [];
            if (product?.main_image)
                fallback.push({ id: "main", url: product.main_image, is_main: true });
            if (product?.hover_image)
                fallback.push({ id: "hover", url: product.hover_image, is_main: false });
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

    // ✅ Nom du bloc variantes : "Goûts" pour nutrition / "Couleur" sinon
    const variantTitle = useMemo(() => {
        // Si ton API renvoie déjà variant_name / variant_type, on l'utilise
        if (product?.variant_name) return product.variant_name;
        if (product?.variant_type === "flavor") return "Goûts";

        // Fallback robuste: en nutrition tu as toujours un format (500g/900g/etc.)
        if (formatOptions.length > 0) return "Goûts";

        return "Couleur";
    }, [product?.variant_name, product?.variant_type, formatOptions.length]);

    if (!product) return <p>Chargement...</p>;
    const price = Number(product.price_ttc || 0).toFixed(2);

    return (
        <div className="pd">
            {/* GALERIE */}
            <section className="pd-gallery" aria-label="Galerie produit">
                {images.length > 0 ? (
                    images.map((img, index) => (
                        <button
                            key={img.id ?? `${img.url}-${index}`}
                            className="pd-media"
                            type="button"
                            onClick={() => {}}
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

            {/* PANNEAU DROIT */}
            <aside className="pd-panel">
                <div className="pd-header">
                    {product?.supplier?.name && (
                        <p className="pd-brand">GAUTHIER FITNESS</p>
                    )}
                    <h1 className="pd-title">{product.name}</h1>
                    <div className="pd-price-row">
                        <p className="pd-price">{price}€</p>
                        <p className="pd-tax">Taxes incluses. Frais d'expédition calculés à l'étape de paiement.</p>
                    </div>
                    <p className="pd-desc">{product.description}</p>
                </div>

                {/* ✅ Variantes (Couleurs / Goûts) */}
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
                                        className={`pd-swatch ${
                                            v.slug === product.slug ? "is-active" : ""
                                        }`}
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

                {/* Tailles */}
                {sizeOptions.length > 0 && (
                    <div className="pd-block">
                        <div className="pd-block-head">
                            <h4>Taille</h4>
                            <button type="button" className="pd-link" onClick={() => setSizeGuideOpen(true)}>
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

                {/* Formats (nutrition) */}
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

                {/* Capacity */}
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
                    <button className="pd-add" disabled={!canAddToCart} onClick={() => {}}>
                        Ajouter au panier
                    </button>
                </div>

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
