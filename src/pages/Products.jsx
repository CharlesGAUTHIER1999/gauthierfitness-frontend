import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [params] = useSearchParams();

    useEffect(() => {
        setLoading(true);

        const filters = Object.fromEntries(params);

        // ✅ Page "Tous les produits" (souvent /products?gender=xxx)
        // Si le front ne gère pas la pagination, on récupère plus d'items.
        const hasPerPage = Object.prototype.hasOwnProperty.call(filters, "per_page");
        const isAllForGender =
            !!filters.gender && !filters.category && !filters.tag;

        if (!hasPerPage && isAllForGender) {
            filters.per_page = 40;
        }

        getProducts(filters)
            .then(setProducts)
            .finally(() => setLoading(false));
    }, [params]);

    if (loading) return <p>Chargement…</p>;

    return (
        <div className="container">
            <h1>Nos produits</h1>

            <div className="product-grid">
                {products.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                ))}
            </div>
        </div>
    );
}
