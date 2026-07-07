import {lazy, Suspense, useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {getProduct} from "../services/productService";
import "../productcustomization.css";

// Loaded on demand: a product only ever needs one of the two engines
// (Konva 2D or Three.js 3D), so bundling both upfront doubles the chunk for nothing.
const ProductCustomizer = lazy(() => import("../features/customization/components/ProductCustomizer"));
const Product3DCustomizer = lazy(() => import("../features/customization/components/Product3DCustomizer"));

// Option picker
function OptionPickerGroup({label, options, activeOptionId, onSelect}) {
    const [expanded, setExpanded] = useState(false);
    const activeOption = options.find((o) => o.id === activeOptionId);
    const isSelected = Boolean(activeOption);

    if (isSelected && !expanded) {
        return (
            <div className="pc-option-picker-group">
                <span className="pc-option-picker-label">{label}</span>
                <span className="pc-option-chosen">
                    {activeOption.code || activeOption.label}
                </span>
                <button
                    type="button"
                    className="pc-option-change-btn"
                    onClick={() => setExpanded(true)}
                >
                    Modifier
                </button>
            </div>
        );
    }

    return (
        <div className="pc-option-picker-group">
            <span className="pc-option-picker-label">{label}</span>
            <div className="pc-option-picker-btns">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        className={`pc-option-btn ${activeOptionId === opt.id ? "is-active" : ""}`}
                        disabled={!opt.in_stock}
                        onClick={() => {
                            onSelect(opt);
                            setExpanded(false);
                        }}
                        title={!opt.in_stock ? "Rupture de stock" : undefined}
                    >
                        {opt.code || opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Finds the product option matching the selection passed via router state (by id first, then by type+code, then by type+label)
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

// Product customizer page : loads the product and renders the 2D/3D customizer
export default function ProductCustomizePage() {
    const {slug} = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [localSelectedOption, setLocalSelectedOption] = useState(null);

    const rawState = location.state || null;

    useEffect(() => {
        let mounted = true;

        // Loads the product + redirection away if it isn't customizable
        async function load() {
            try {
                const p = await getProduct(slug);

                if (!mounted) return;

                if (!p?.is_customizable) {
                    navigate(`/products/${slug}`, {replace: true});
                    return;
                }

                setProduct(p);
                setLocalSelectedOption(null);
            } catch (e) {
                console.error(e);
                navigate("/products", {replace: true});
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

    const sizeOptions = useMemo(() => allOptions.filter((o) => o.type === "size"), [allOptions]);
    const formatOptions = useMemo(() => allOptions.filter((o) => o.type === "format"), [allOptions]);
    const capacityOptions = useMemo(() => allOptions.filter((o) => o.type === "capacity"), [allOptions]);

    const hasRequiredOptions = useMemo(() => {
        return allOptions.some((opt) =>
            ["size", "format", "capacity"].includes(opt.type)
        );
    }, [allOptions]);

    // Local selection takes priority over the one passed via route
    const activeSelectedOption = localSelectedOption ?? selectedOption;
    const effectiveSelectedOptionId = activeSelectedOption?.id ?? null;
    const isMissingRequiredOption = hasRequiredOptions && !effectiveSelectedOptionId;

    if (loading) return <p className="pc-loading">Chargement...</p>;
    if (!product) return <p className="pc-loading">Produit introuvable.</p>;

    const activeOptionMeta = activeSelectedOption
        ? {
            id: activeSelectedOption.id,
            type: activeSelectedOption.type || null,
            code: activeSelectedOption.code || null,
            label: activeSelectedOption.label || null,
        }
        : null;

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

                        {activeSelectedOption && (
                            <span className="pc-option">
                                {activeSelectedOption.label || activeSelectedOption.code}
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

            {hasRequiredOptions && (
                <div className="pc-option-picker">
                    {sizeOptions.length > 0 && (
                        <OptionPickerGroup
                            label="Taille"
                            options={sizeOptions}
                            activeOptionId={activeSelectedOption?.id}
                            onSelect={setLocalSelectedOption}
                        />
                    )}

                    {formatOptions.length > 0 && (
                        <OptionPickerGroup
                            label="Format"
                            options={formatOptions}
                            activeOptionId={activeSelectedOption?.id}
                            onSelect={setLocalSelectedOption}
                        />
                    )}

                    {capacityOptions.length > 0 && (
                        <OptionPickerGroup
                            label="Capacité"
                            options={capacityOptions}
                            activeOptionId={activeSelectedOption?.id}
                            onSelect={setLocalSelectedOption}
                        />
                    )}

                    {isMissingRequiredOption && (
                        <p className="pc-option-picker-hint">
                            Sélectionne une option ci-dessus pour activer le configurateur.
                        </p>
                    )}
                </div>
            )}

            <Suspense fallback={<p className="pc-loading">Chargement du configurateur...</p>}>
                {product.customization?.mode === "3d" ? (
                    <Product3DCustomizer
                        product={product}
                        selectedOptionId={effectiveSelectedOptionId}
                        disabled={isMissingRequiredOption}
                        selectedOptionMeta={activeOptionMeta}
                    />
                ) : (
                    <ProductCustomizer
                        product={product}
                        selectedOptionId={effectiveSelectedOptionId}
                        disabled={isMissingRequiredOption}
                        selectedOptionMeta={activeOptionMeta}
                    />
                )}
            </Suspense>
        </div>
    );
}