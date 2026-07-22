import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {getAdminStats} from "../../api/adminApi";

// Inline SVG icons
const Icon = {
    revenue: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>), orders: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>), products: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
    </svg>), stock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>), arrow: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
    </svg>),
};

const STATUS_CONFIG = {
    new: {label: "Nouvelles", color: "#3b82f6", bg: "#dbeafe"},
    processing: {label: "En cours", color: "#f59e0b", bg: "#fef3c7"},
    shipped: {label: "Expédiées", color: "#8b5cf6", bg: "#ede9fe"},
    delivered: {label: "Livrées", color: "#10b981", bg: "#d1fae5"},
    canceled: {label: "Annulées", color: "#ef4444", bg: "#fee2e2"},
};

// Components
// Displays a single KPI metric with icon, value and optional subtext
function MetricCard({icon, label, value, sub, accent, alert}) {
    const MetricIcon = icon;
    return (<div
        className={`adm-metric-card ${accent ? "adm-metric-card--accent" : ""} ${alert ? "adm-metric-card--alert" : ""}`}>
        <div className="adm-metric-icon">
            <MetricIcon/>
        </div>
        <div className="adm-metric-body">
            <p className="adm-metric-label">{label}</p>
            <p className="adm-metric-value">{value}</p>
            {sub && <p className="adm-metric-sub">{sub}</p>}
        </div>
    </div>);
}

// Renders a labeled progress bar showing an order status's share of the total
function StatusBar({status, count, total}) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status, color: "#94a3b8", bg: "#f1f5f9",
    };

    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    return (<div className="adm-status-row">
        <div className="adm-status-row-head">
            <span className="adm-status-dot" style={{background: cfg.color}}/>
            <span className="adm-status-name">{cfg.label}</span>
            <span className="adm-status-count">{count}</span>
            <span className="adm-status-pct">{pct}%</span>
        </div>

        <div className="adm-status-bar-track">
            <div
                className="adm-status-bar-fill"
                style={{width: `${pct}%`, background: cfg.color}}
            />
        </div>
    </div>);
}

// Navigation card linking to a common admin action
function QuickLink({to, label, desc}) {
    return (<Link to={to} className="adm-quick-link">
        <div className="adm-quick-link-text">
            <span className="adm-quick-link-label">{label}</span>
            <span className="adm-quick-link-desc">{desc}</span>
        </div>

        <span className="adm-quick-link-arrow">
                <Icon.arrow/>
            </span>
    </Link>);
}

// Admin home page : fetches and displays key store stats (orders, products, stock)
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAdminStats()
            .then(setStats)
            .catch(() => setError("Impossible de charger les statistiques."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="adm-loading">Chargement...</p>;
    if (error) return <p className="adm-error">{error}</p>;

    const byStatus = stats.orders.by_status ?? {};
    const totalOrders = stats.orders.total ?? 0;
    const alerts = (stats.stock.out_of_stock ?? 0) + (stats.stock.low_stock ?? 0);

    return (<div className="adm-page adm-dashboard">
        {/* ── Header ── */}
        <div className="adm-dash-header">
            <div>
                <p className="adm-dash-kicker">Vue d'ensemble</p>
                <h1 className="adm-page-title">Tableau de bord</h1>
            </div>

            <span className="adm-dash-date">
                    {new Date().toLocaleDateString("fr-FR", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                </span>
        </div>

        {/* ── 4 key metrics ── */}
        <div className="adm-metrics-grid">
            <MetricCard
                icon={Icon.revenue}
                label="Chiffre d'affaires TTC"
                value={`${Number(stats.orders.revenue).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                })} €`}
                sub={`Ce mois : ${Number(stats.orders.revenue_month).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                })} €`}
                accent
            />

            <MetricCard
                icon={Icon.orders}
                label="Commandes"
                value={totalOrders}
                sub={`Cette semaine : ${stats.orders.this_week ?? 0}`}
            />

            <MetricCard
                icon={Icon.products}
                label="Produits actifs"
                value={stats.products.active}
                sub={`${stats.products.customizable} customisables`}
            />

            <MetricCard
                icon={Icon.stock}
                label="Alertes stock"
                value={alerts}
                sub={`${stats.stock.out_of_stock} rupture${stats.stock.out_of_stock !== 1 ? "s" : ""} · ${stats.stock.low_stock} faible${stats.stock.low_stock !== 1 ? "s" : ""}`}
                alert={alerts > 0}
            />
        </div>

        {/* ── Central grid ── */}
        <div className="adm-dash-grid">
            {/* Left column */}
            <div className="adm-dash-card">
                <div className="adm-dash-card-head">
                    <h2 className="adm-dash-card-title">Commandes par statut</h2>

                    <Link to="/admin/orders" className="adm-dash-card-link">
                        Voir tout →
                    </Link>
                </div>

                <div className="adm-status-list">
                    {Object.keys(STATUS_CONFIG).map((key) => (<StatusBar
                        key={key}
                        status={key}
                        count={byStatus[key] ?? 0}
                        total={totalOrders}
                    />))}
                </div>

                {totalOrders === 0 && (<p className="adm-empty-inline">Aucune commande pour le moment.</p>)}
            </div>

            {/* Right column */}
            <div className="adm-dash-card">
                <div className="adm-dash-card-head">
                    <h2 className="adm-dash-card-title">Accès rapides</h2>
                </div>

                <div className="adm-quick-links">
                    <QuickLink
                        to="/admin/products/new"
                        label="Créer un produit"
                        desc="Ajouter un nouveau produit au catalogue"
                    />

                    <QuickLink
                        to="/admin/products"
                        label="Gérer les produits"
                        desc={`${stats.products.total} produit${stats.products.total !== 1 ? "s" : ""} au total`}
                    />

                    <QuickLink
                        to="/admin/orders"
                        label="Voir les commandes"
                        desc={`${byStatus["new"] ?? 0} nouvelle${(byStatus["new"] ?? 0) !== 1 ? "s" : ""} en attente`}
                    />

                    <QuickLink
                        to="/admin/stock"
                        label="Gérer les stocks"
                        desc={alerts > 0 ? `${alerts} produit${alerts !== 1 ? "s" : ""} nécessite${alerts === 1 ? "" : "nt"} attention` : "Tous les stocks sont OK"}
                    />
                </div>
            </div>
        </div>

        {/* ── Bottom strip ── */}
        <div className="adm-dash-footer-grid">
            <div className="adm-dash-mini-card">
                <p className="adm-dash-mini-value">{stats.products.total}</p>
                <p className="adm-dash-mini-label">Produits total</p>
            </div>

            <div className="adm-dash-mini-card">
                <p className="adm-dash-mini-value">{stats.products.active}</p>
                <p className="adm-dash-mini-label">Actifs</p>
            </div>

            <div className="adm-dash-mini-card">
                <p className="adm-dash-mini-value">{stats.products.customizable}</p>
                <p className="adm-dash-mini-label">Customisables</p>
            </div>

            <div className={`adm-dash-mini-card ${stats.stock.out_of_stock > 0 ? "is-danger" : ""}`}>
                <p className="adm-dash-mini-value">{stats.stock.out_of_stock}</p>
                <p className="adm-dash-mini-label">En rupture</p>
            </div>

            <div className={`adm-dash-mini-card ${stats.stock.low_stock > 0 ? "is-warn" : ""}`}>
                <p className="adm-dash-mini-value">{stats.stock.low_stock}</p>
                <p className="adm-dash-mini-label">Stock faible</p>
            </div>

            <div className="adm-dash-mini-card">
                <p className="adm-dash-mini-value">{stats.orders.this_week ?? 0}</p>
                <p className="adm-dash-mini-label">Commandes / semaine</p>
            </div>
        </div>
    </div>);
}