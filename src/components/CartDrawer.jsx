import { useEffect, useRef, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
    const navigate = useNavigate();
    const { isOpen, closeCart, items, subtotal, inc, dec, remove } = useCart();

    const drawerRef = useRef(null);
    const closeBtnRef = useRef(null);
    const lastActiveRef = useRef(null);

    const FREE_SHIPPING_THRESHOLD = 70;

    const freeShip = useMemo(() => {
        const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
        const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
        const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;
        return { remaining, progress, isFree };
    }, [subtotal]);

    useEffect(() => {
        if (isOpen) {
            lastActiveRef.current = document.activeElement;
            requestAnimationFrame(() => closeBtnRef.current?.focus());
        } else {
            const drawer = drawerRef.current;
            if (drawer && drawer.contains(document.activeElement)) {
                document.activeElement.blur();
            }
            lastActiveRef.current?.focus?.();
        }
    }, [isOpen]);

    return (
        <>
            <div
                className={`cart-overlay ${isOpen ? "is-open" : ""}`}
                onClick={closeCart}
            />

            <aside
                ref={drawerRef}
                className={`cart-drawer ${isOpen ? "is-open" : ""}`}
                aria-hidden={!isOpen}
                {...(!isOpen ? { inert: true } : {})}
            >
                <div className="cart-drawer-header">
                    <h3>Votre panier</h3>
                    <button
                        ref={closeBtnRef}
                        className="cart-close"
                        onClick={closeCart}
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                <div className="cart-free-ship">
                    <div className="cart-free-ship-row">
                        <span className="cart-free-ship-icon" aria-hidden="true">
                            {freeShip.isFree ? "✓" : "🚚"}
                        </span>

                        {freeShip.isFree ? (
                            <p className="cart-free-ship-text">
                                Vous avez obtenu la livraison gratuite !
                            </p>
                        ) : (
                            <p className="cart-free-ship-text">
                                Plus que <strong>{freeShip.remaining.toFixed(2)} €</strong> pour
                                la livraison gratuite
                            </p>
                        )}
                    </div>

                    <div
                        className="cart-free-ship-bar"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={FREE_SHIPPING_THRESHOLD}
                        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
                    >
                        <div
                            className="cart-free-ship-bar-fill"
                            style={{ width: `${freeShip.progress}%` }}
                        />
                    </div>
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

                                        <div className="cart-item-meta">
                                            <div className="cart-item-meta-line">
                                                Délai de livraison : 4–7 jours ouvrés
                                            </div>

                                            {it.variantTitle && it.variantValue && (
                                                <div className="cart-item-meta-line">
                                                    {it.variantTitle} : {it.variantValue}
                                                </div>
                                            )}

                                            {it.optionLabel && (
                                                <div className="cart-item-meta-line">
                                                    Option : {it.optionLabel}
                                                </div>
                                            )}
                                        </div>

                                        <div className="cart-item-actions">
                                            <div className="qty">
                                                <button
                                                    type="button"
                                                    onClick={() => dec(it)}   // ✅ FIX
                                                    aria-label="Réduire"
                                                >
                                                    –
                                                </button>
                                                <span>{it.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => inc(it)}   // ✅ FIX
                                                    aria-label="Augmenter"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                className="cart-remove"
                                                onClick={() => remove(it)}   // ✅ FIX
                                                aria-label={`Supprimer ${it.name}`}
                                                title="Supprimer"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path
                                                        d="M9 3h6m-9 4h12m-1 0-1 14H8L7 7"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                    />
                                                    <path
                                                        d="M10 11v7M14 11v7"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
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
                            navigate("/checkout");
                        }}
                    >
                        Procéder au paiement
                    </button>
                </div>
            </aside>
        </>
    );
}
