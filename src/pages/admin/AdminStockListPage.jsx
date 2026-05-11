import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStock } from "../../api/adminApi";

function StockBadge({ qty }) {
    if (qty === 0)  return <span className="adm-stock-qty is-empty">Rupture</span>;
    if (qty < 5)    return <span className="adm-stock-qty is-low">{qty} unités</span>;
    return <span className="adm-stock-qty is-ok">{qty} unités</span>;
}

export default function AdminStockListPage() {
    const [data, setData]       = useState(null);
    const [search, setSearch]   = useState("");
    const [page, setPage]       = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        getAdminStock({ search: search || undefined, page })
            .then(setData)
            .catch(() => setError("Impossible de charger les stocks."))
            .finally(() => setLoading(false));
    }, [search, page]);

    useEffect(() => { load(); }, [load]);

    const products = data?.data || [];

    return (
        <div className="adm-page">
            <div className="adm-page-head">
                <h1 className="adm-page-title">Gestion des stocks</h1>
            </div>

            <div className="adm-toolbar">
                <input
                    className="adm-input"
                    type="search"
                    placeholder="Rechercher par nom ou SKU…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {error && <p className="adm-error">{error}</p>}

            {loading ? (
                <p className="adm-loading">Chargement...</p>
            ) : (
                <div className="adm-table-wrapper">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>SKU</th>
                                <th>Stock total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="adm-empty">
                                        Aucun produit trouvé.
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <span className="adm-product-name">{p.name}</span>
                                            <span className="adm-product-slug">{p.slug}</span>
                                        </td>
                                        <td className="adm-date">{p.sku || "—"}</td>
                                        <td>
                                            <StockBadge qty={p.stock_qty ?? 0} />
                                        </td>
                                        <td>
                                            <Link
                                                to={`/admin/products/${p.id}/stock`}
                                                className="adm-action-btn"
                                            >
                                                Gérer
                                            </Link>
                                        </td>
                                    </tr>
                                ))
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
