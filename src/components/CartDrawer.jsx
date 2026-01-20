import { useCart } from "../context/CartContext";
//import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
    //const navigate = useNavigate();
    const { isOpen, closeCart, items, subtotal, inc, dec, remove } = useCart();

    return (
        <>
            <div className={`cart-overlay ${isOpen ? "is-open" : ""}`} onClick={closeCart} />

            <aside className={`cart-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
                <div className="cart-drawer-header">
                    <h3>Votre panier</h3>
                    <button className="cart-close" onClick={closeCart} aria-label="Fermer">✕</button>
                </div>

                <div className="cart-drawer-body">
                    {items.length === 0 ? (
                        <p className="cart-empty">Ton panier est vide.</p>
                    ) : (
                        <ul className="cart-list">
                            {items.map((it) => (
                                <li key={it.key} className="cart-item">
                                    <img className="cart-item-img" src={it.image} alt={it.name} />

                                    <div className="cart-item-main">
                                        <div className="cart-item-top">
                                            <div className="cart-item-title">{it.name}</div>
                                            <div className="cart-item-price">
                                                {(Number(it.price) * Number(it.quantity)).toFixed(2)} €
                                            </div>
                                        </div>

                                        {/* ✅ META (Teveo-like) */}
                                        <div className="cart-item-meta">
                                            <div className="cart-item-meta-line">
                                                Délai de livraison : 4–7 jours ouvrés
                                            </div>

                                            {/* Si un jour tu stockes variant_label, ça s'affichera */}
                                            {it.variantTitle && it.variantValue && (
                                                <div className="cart-item-meta-line">
                                                    {it.variantTitle} : {it.variantValue}
                                                </div>
                                            )}

                                            {/* ✅ Taille / Format / Capacité */}
                                            {it.optionLabel && (
                                                <div className="cart-item-meta-line">
                                                    {(it.optionType === "format" && "Format") ||
                                                        (it.optionType === "capacity" && "Capacité") ||
                                                        (it.optionType === "size" && "Taille") ||
                                                        "Option"}{" "}
                                                    : {it.optionLabel}
                                                </div>
                                            )}

                                        </div>

                                        <div className="cart-item-actions">
                                            <div className="qty">
                                                <button type="button" onClick={() => dec(it.productId, it.optionId)} aria-label="Réduire">–</button>
                                                <span>{it.quantity}</span>
                                                <button type="button" onClick={() => inc(it.productId, it.optionId)} aria-label="Augmenter">+</button>
                                            </div>

                                            <button className="cart-remove" onClick={() => remove(it.productId, it.optionId)}>
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="cart-drawer-footer">
                    <div className="cart-subtotal">
                        <span>Sous-total</span>
                        <strong>{Number(subtotal).toFixed(2)} €</strong>
                    </div>

                    <div className="cart-note">
                        Taxes incluses. Frais d'expédition calculés à l'étape de paiement.
                    </div>

                    <button
                        className="cart-cta"
                        disabled={items.length === 0}
                        onClick={() => {
                            closeCart();
                            //navigate("/cart");
                        }}
                    >
                        PROCÉDER AU PAIEMENT
                    </button>
                </div>
            </aside>
        </>
    );
}
