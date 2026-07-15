import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {FiPackage} from "react-icons/fi";
import api from "../api/axios";
import {formatPriceEUR, formatDateFR, statusLabel} from "../utils/orderUtils";

// Lists all orders for the current user
export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await api.get("/orders");
                if (!mounted) return;
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                if (!mounted) return;
                setErr(e?.response?.data?.message || "Impossible de charger vos commandes.");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="pay-result">
            <div className="row-between">
                <h1>Mes commandes</h1>
                <Link className="ck-link" to="/account">Retour compte</Link>
            </div>

            <div className="pay-result-box">
                {loading ? (
                    <p className="ck-muted">Chargement…</p>
                ) : err ? (
                    <div className="ck-error">{err}</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <FiPackage className="empty-state-icon"/>
                        <p className="ck-muted">Vous n’avez encore passé aucune commande.</p>
                    </div>
                ) : (
                    <div style={{overflowX: "auto"}}>
                        <table className="ck-table">
                            <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Date</th>
                                <th>Statut</th>
                                <th className="is-right">Total</th>
                                <th className="is-right"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((o) => (
                                <tr key={o.id}>
                                    <td style={{fontWeight: 650}}>#{o.id}</td>
                                    <td>{formatDateFR(o.created_at)}</td>
                                    <td>{statusLabel(o.order_status)}</td>
                                    <td className="is-right" style={{fontWeight: 650}}>
                                        {formatPriceEUR(o.total_ttc)}
                                    </td>
                                    <td className="is-right">
                                        <Link className="ck-link" to={`/account/orders/${o.id}`}>
                                            Détails
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
