import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminOrder, updateAdminOrderStatus } from "../../api/adminApi";

const STATUS_OPTIONS = [
    { value: "new",        label: "Nouvelle" },
    { value: "processing", label: "En cours" },
    { value: "shipped",    label: "Expédiée" },
    { value: "delivered",  label: "Livrée" },
    { value: "canceled",   label: "Annulée" },
];

const STATUS_CSS = {
    new:        "adm-badge-blue",
    processing: "adm-badge-orange",
    shipped:    "adm-badge-purple",
    delivered:  "adm-badge-green",
    canceled:   "adm-badge-red",
};

export default function AdminOrderDetailPage() {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [order, setOrder]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState(null);
    const [success, setSuccess] = useState("");
    const [newStatus, setNewStatus] = useState("");

    useEffect(() => {
        getAdminOrder(id)
            .then((res) => {
                const o = res.data ?? res;
                setOrder(o);
                setNewStatus(o.order_status);
            })
            .catch(() => setError("Commande introuvable."))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleStatusUpdate() {
        if (!newStatus || newStatus === order.order_status) return;
        setSaving(true);
        setError(null);
        setSuccess("");
        try {
            const res = await updateAdminOrderStatus(id, newStatus);
            setOrder(res.order ?? res.data ?? order);
            setSuccess("Statut mis à jour. L'email client a été envoyé si applicable.");
        } catch (e) {
            setError(e?.response?.data?.message || "Erreur lors de la mise à jour.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="adm-loading">Chargement...</p>;
    if (!order)  return <p className="adm-error">{error || "Commande introuvable."}</p>;

    const statusCss = STATUS_CSS[order.order_status] || "adm-badge-grey";
    const statusLabel = STATUS_OPTIONS.find((s) => s.value === order.order_status)?.label || order.order_status;

    return (
        <div className="adm-page">
            <div className="adm-page-head">
                <button type="button" className="adm-back-btn" onClick={() => navigate("/admin/orders")}>
                    ← Commandes
                </button>
                <h1 className="adm-page-title">Commande #{order.id}</h1>
            </div>

            {error   && <p className="adm-error">{error}</p>}
            {success && <p className="adm-success">{success}</p>}

            <div className="adm-detail-grid">
                {/* Infos client */}
                <div className="adm-detail-card">
                    <h2 className="adm-detail-title">Client</h2>
                    <p><strong>{order.user?.firstname} {order.user?.lastname}</strong></p>
                    <p>{order.user?.email}</p>
                    {order.user?.phone && <p>{order.user.phone}</p>}
                </div>

                {/* Résumé financier */}
                <div className="adm-detail-card">
                    <h2 className="adm-detail-title">Résumé</h2>
                    <p>Total TTC : <strong>{Number(order.total_ttc).toFixed(2)} €</strong></p>
                    <p>Total HT : {Number(order.total_ht).toFixed(2)} €</p>
                    <p>
                        Paiement :{" "}
                        <span className={`adm-badge ${order.payment_status === "paid" ? "adm-badge-green" : "adm-badge-grey"}`}>
                            {order.payment_status === "paid" ? "Payée" : order.payment_status}
                        </span>
                    </p>
                    <p>
                        Statut :{" "}
                        <span className={`adm-badge ${statusCss}`}>{statusLabel}</span>
                    </p>
                    <p className="adm-date">
                        Créée le {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </p>
                </div>

                {/* Changement de statut */}
                <div className="adm-detail-card">
                    <h2 className="adm-detail-title">Changer le statut</h2>
                    <select
                        className="adm-input"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="adm-primary-btn"
                        style={{ marginTop: 12 }}
                        onClick={handleStatusUpdate}
                        disabled={saving || newStatus === order.order_status}
                    >
                        {saving ? "Enregistrement..." : "Mettre à jour"}
                    </button>
                </div>
            </div>

            {/* Articles */}
            <div className="adm-detail-card" style={{ marginTop: 24 }}>
                <h2 className="adm-detail-title">Articles commandés</h2>
                <div className="adm-table-wrapper">
                    <table className="adm-table">
                        <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Qté</th>
                            <th>Prix unitaire TTC</th>
                            <th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(order.items || []).map((item) => (
                            <tr key={item.id}>
                                <td>
                                        <span className="adm-product-name">
                                            {item.product?.name ?? `Produit #${item.product_id}`}
                                        </span>
                                    {item.custom_product_session_id && (
                                        <span className="adm-badge adm-badge-blue" style={{ marginLeft: 8 }}>
                                                Customisé
                                            </span>
                                    )}
                                </td>
                                <td>{item.quantity}</td>
                                <td>{Number(item.price_ttc).toFixed(2)} €</td>
                                <td>{(item.quantity * item.price_ttc).toFixed(2)} €</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
