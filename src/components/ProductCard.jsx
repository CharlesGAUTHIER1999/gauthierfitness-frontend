import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
    return (
        <div className="product-card">
            <Link to={`/products/${product.id}`}>
                <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                />
            </Link>

            <div className="product-card-info">
                <h3>{product.name}</h3>
                <p className="price">{product.price_ttc} €</p>
            </div>
        </div>
    );
}
