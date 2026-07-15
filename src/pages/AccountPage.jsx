import {Link} from "react-router-dom";
import {useAuth} from "../store/auth";
import {useEffect, useState} from "react";
import {FiPackage} from "react-icons/fi";
import api from "../api/axios";
import {formatPriceEUR, formatDateFR, statusLabel} from "../utils/orderUtils";

// Account overview
export default function AccountPage() {
    const {user, logout} = useAuth();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await api.get("/orders");
                if (!mounted) return;
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch {
                if (!mounted) return;
                setOrders([]);
            } finally {
                setLoadingOrders(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const latest = orders.slice(0, 3);
    const addressCount = Boolean(user?.address || user?.zip || user?.city) ? 1 : 0;

    return (
        <div className="pay-result">
            <div className="row-between">
                <h1>Compte</h1>
                <button className="ck-link" type="button" onClick={logout}>
                    Déconnexion
                </button>
            </div>

            <div className="pay-result-box" style={{display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24}}>
                <div>
                    <div className="row-between">
                        <h2 style={{fontSize: 18, margin: 0}}>Historique des commandes</h2>
                        <Link className="ck-link" to="/account/orders">
                            Voir tout
                        </Link>
                    </div>

                    {loadingOrders ? (
                        <p className="ck-muted mt-sm">Chargement…</p>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <FiPackage className="empty-state-icon"/>
                            <p className="ck-muted">
                                Vous n’avez encore passé aucune commande.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-md" style={{display: "grid", gap: 10}}>
                            {latest.map((o) => (
                                <Link
                                    key={o.id}
                                    to={`/account/orders/${o.id}`}
                                    style={{
                                        textDecoration: "none",
                                        border: "1px solid #eee",
                                        borderRadius: 12,
                                        padding: 12,
                                        color: "#111",
                                        display: "grid",
                                        gap: 6,
                                    }}
                                >
                                    <div className="row-between">
                                        <div style={{fontWeight: 650}}>Commande #{o.id}</div>
                                        <div style={{fontWeight: 650}}>{formatPriceEUR(o.total_ttc)}</div>
                                    </div>
                                    <div className="ck-muted row-between">
                                        <span>{formatDateFR(o.created_at)}</span>
                                        <span>{statusLabel(o.order_status)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{fontSize: 18, margin: 0}}>Détails du compte</h2>
                    <div className="ck-muted mt-sm">
                        {user?.country || "France"}
                    </div>

                    <div className="mt-sm">
                        <Link className="ck-link" to="/account/addresses">
                            Voir les adresses ({addressCount})
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
