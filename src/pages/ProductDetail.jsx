import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/productService";

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        getProduct(id).then(setProduct);
    }, [id]);

    if (!product) return <p>Chargement…</p>;

    return (
        <div className="product-detail">
            <img
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
            />

            <div className="product-info">
                <h1>{product.name}</h1>
                <p className="price">{product.price_ttc} €</p>
                <p>{product.description}</p>

                {product.attributes?.sizes && (
                    <div>
                        <h4>Tailles</h4>
                        {product.attributes.sizes.map(s => (
                            <button key={s}>{s}</button>
                        ))}
                    </div>
                )}

                {product.attributes?.formats && (
                    <div>
                        <h4>Formats</h4>
                        {product.attributes.formats.map(f => (
                            <button key={f}>{f}</button>
                        ))}
                    </div>
                )}

                <button className="btn-primary">Ajouter au panier</button>
            </div>
        </div>
    );
}