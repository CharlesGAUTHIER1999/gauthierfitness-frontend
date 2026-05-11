import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOrders } from "../../api/adminApi";

const STATUS_LABELS = {
    new:        { label: "Nouvelle",    css: "adm-badge-blue" },
    processing: { label: "En cours",   css: "adm-badge-orange" },
    shipped:    { label: "Expédiée",   css: "adm-badge-purple" },
    delivered:  { label: "Livrée",     css: "adm-badge-green" },
    canceled:   { label: "Annulée",    css: "adm-badge-red" },
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

export default function AdminOrdersPage() {
    const [data, setData]         = useState(null);
    const [search, setSearch]     = useState("");
    const [status, setStatus]     = useState("");
    const [page, setPage]         = useState(1);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        getAdminOrders({ search: search || undefined, status: status || undefined, page })
            .then(setData)
            .catch(() => setError("Impossible de charger les commandes."))
            .finally(() => setLoading(false));
    }, [search, status, page]);

    useEffect(() => { load(); }, [load]);

    const orders = data?.data || [];

    return (
        <div className="adm-page">
            <div className="adm-page-head">
                <h1 className="adm-page-title">Commandes</h1>
            </div>

            <div className="adm-toolbar">
                <input
                    className="adm-input"
                    type="search"
                    placeholder="Email ou nom du client…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />

                <select
                    className="adm-input adm-input-select"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                >
                    <option value="">Tous les statuts</option>
                    {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                    ))}
                </select>
            </div>

            {error && <p className="adm-error">{error}</p>}

            {loading ? (
                <p className="adm-loading">Chargement...</p>
            ) : (
                <div className="adm-table-wrapper">
                    <table className="adm-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Client</th>
                            <th>Total TTC</th>
                            <th>Paiement</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="adm-empty">
                                    Aucune commande trouvée.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const st = STATUS_LABELS[order.order_status] || { label: order.order_status, css: "adm-badge-grey" };
                                return (
                                    <tr key={order.id}>
                                        <td className="adm-order-id">#{order.id}</td>
                                        <td>
                                                <span className="adm-product-name">
                                                    {order.user?.firstname} {order.user?.lastname}
                                                </span>
                                            <span className="adm-product-slug">{order.user?.email}</span>
                                        </td>
                                        <td>{Number(order.total_ttc).toFixed(2)} €</td>
                                        <td>
                                                <span className={`adm-badge ${order.payment_status === "paid" ? "adm-badge-green" : "adm-badge-grey"}`}>
                                                    {order.payment_status === "paid" ? "Payée" : order.payment_status}
                                                </span>
                                        </td>
                                        <td>
                                            <span className={`adm-badge ${st.css}`}>{st.label}</span>
                                        </td>
                                        <td className="adm-date">
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleDateString("fr-FR")
                                                : "—"}
                                        </td>
                                        <td>
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="adm-action-btn"
                                            >
                                                Détail
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {data && data.last_page > 1 && (
                <div className="adm-pagination">
                    <button
                        type="button"
                        className="adm-page-btn"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        ← Précédent
                    </button>
                    <span className="adm-page-info">
                        Page {data.current_page} / {data.last_page}
                    </span>
                    <button
                        type="button"
                        className="adm-page-btn"
                        disabled={page >= data.last_page}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Suivant →
                    </button>
                </div>
            )}
        </div>
    );
}
