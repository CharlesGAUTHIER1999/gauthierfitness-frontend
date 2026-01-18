import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [params] = useSearchParams();

    useEffect(() => {
        const filters = Object.fromEntries(params);

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
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}