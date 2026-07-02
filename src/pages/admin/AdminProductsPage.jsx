import {useCallback, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {deleteAdminProduct, getAdminProducts, toggleAdminProductActive} from "../../api/adminApi";

// Admin products list page
export default function AdminProductsPage() {
    const [data, setData] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetches products matching the current search/page filters
    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        getAdminProducts({search: search || undefined, page})
            .then(setData)
            .catch(() => setError("Impossible de charger les produits."))
            .finally(() => setLoading(false));
    }, [search, page]);

    useEffect(() => {
        load();
    }, [load]);

    // Toggles a product's active/inactive state, then refreshes the list
    async function handleToggle(id) {
        await toggleAdminProductActive(id);
        load();
    }

    // Confirms then deletes a product, then refreshes the list
    async function handleDelete(product) {
        if (!window.confirm(`Supprimer « ${product.name} » ? Cette action est irréversible.`)) return;
        await deleteAdminProduct(product.id);
        load();
    }

    const products = data?.data || [];

    return (
        <div className="adm-page">
            <div className="adm-page-head">
                <h1 className="adm-page-title">Produits</h1>
                <Link to="/admin/products/new" className="adm-primary-btn">
                    + Nouveau produit
                </Link>
            </div>

            <div className="adm-toolbar">
                <input
                    className="adm-input"
                    type="search"
                    placeholder="Rechercher par nom ou SKU…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
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
                            <th>Nom</th>
                            <th>Prix TTC</th>
                            <th>Actif</th>
                            <th>Customisable</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="adm-empty">
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
                                    <td>{Number(p.price_ttc).toFixed(2)} €</td>
                                    <td>
                                        <button
                                            type="button"
                                            className={`adm-badge ${p.is_active ? "adm-badge-green" : "adm-badge-grey"}`}
                                            onClick={() => handleToggle(p.id)}
                                            title="Cliquer pour basculer"
                                        >
                                            {p.is_active ? "Actif" : "Inactif"}
                                        </button>
                                    </td>
                                    <td>
                                        {p.is_customizable ? (
                                            <span className="adm-badge adm-badge-blue">
                                                    {p.customization?.mode ?? "oui"}
                                                </span>
                                        ) : (
                                            <span className="adm-badge adm-badge-grey">Non</span>
                                        )}
                                    </td>
                                    <td className="adm-actions">
                                        <Link
                                            to={`/admin/products/${p.id}/edit`}
                                            className="adm-action-btn"
                                        >
                                            Modifier
                                        </Link>
                                        <Link
                                            to={`/admin/products/${p.id}/stock`}
                                            className="adm-action-btn"
                                        >
                                            Stock
                                        </Link>
                                        <button
                                            type="button"
                                            className="adm-action-btn adm-action-danger"
                                            onClick={() => handleDelete(p)}
                                        >
                                            Supprimer
                                        </button>
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
