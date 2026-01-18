import { useCart } from "../context/CartContext";

export default function CartPage() {
    const { items, updateItem, removeItem } = useCart();

    const total = items.reduce(
        (sum, i) => sum + i.product.price_ttc * i.quantity,
        0
    );

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Votre panier</h1>

            {items.length === 0 && <p>Votre panier est vide.</p>}

            {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 mb-4 border-b pb-2">

                    <img
                        src={item.product.main_image ?? "/no-image.png"}
                        className="w-20 h-20 object-cover"
                        alt={"image produit"}
                    />

                    <div className="flex-1">
                        <h2 className="font-semibold">{item.product.name}</h2>
                        <p>{item.product.price_ttc} €</p>

                        <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateItem(item.id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                        </div>
                    </div>

                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600"
                    >
                        Supprimer
                    </button>
                </div>
            ))}

            <h2 className="text-xl font-bold mt-4">Total : {total.toFixed(2)} €</h2>
        </div>
    );
}