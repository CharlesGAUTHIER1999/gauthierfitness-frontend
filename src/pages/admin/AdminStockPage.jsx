import {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    addAdminStock,
    adjustAdminStockLot,
    getAdminProductStock,
    getAdminStockMovements,
} from "../../api/adminApi";

// Helpers

const MOVEMENT_LABELS = {
    in: {label: "Entrée", css: "adm-mov-in"},
    out: {label: "Sortie", css: "adm-mov-out"},
    correction: {label: "Correction", css: "adm-mov-correction"},
};

// Renders a colored badge reflecting stock level (out of stock / low / ok).
function StockQty({qty}) {
    if (qty === 0) return <span className="adm-stock-qty is-empty">0 — Rupture</span>;
    if (qty < 5) return <span className="adm-stock-qty is-low">{qty} unité{qty > 1 ? "s" : ""}</span>;
    return <span className="adm-stock-qty is-ok">{qty} unités</span>;
}

// Add stock form
// Inline form to add a new stock lot for a product (or product option).
function AddStockForm({productId, optionId, onSuccess, onCancel}) {
    const [form, setForm] = useState({lot_number: "", quantity: "", expiration_date: ""});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Submits the new lot to the API.
    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await addAdminStock(productId, {
                product_option_id: optionId || null,
                lot_number: form.lot_number,
                quantity: parseInt(form.quantity, 10),
                expiration_date: form.expiration_date || null,
            });
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || "Erreur lors de l'ajout.");
        } finally {
            setSaving(false);
        }
    }

    const set = (key) => (e) => setForm((f) => ({...f, [key]: e.target.value}));

    return (
        <form className="adm-inline-form" onSubmit={handleSubmit}>
            <p className="adm-inline-form-title">Ajouter du stock</p>
            {error && <p className="adm-error">{error}</p>}
            <div className="adm-form-row">
                <div className="adm-form-group">
                    <label className="adm-label">N° de lot *</label>
                    <input
                        className="adm-input"
                        placeholder="LOT-001"
                        value={form.lot_number}
                        onChange={set("lot_number")}
                        required
                    />
                </div>
                <div className="adm-form-group">
                    <label className="adm-label">Quantité *</label>
                    <input
                        className="adm-input"
                        type="number"
                        min="1"
                        placeholder="0"
                        value={form.quantity}
                        onChange={set("quantity")}
                        required
                    />
                </div>
                <div className="adm-form-group">
                    <label className="adm-label">Date d'expiration</label>
                    <input
                        className="adm-input"
                        type="date"
                        value={form.expiration_date}
                        onChange={set("expiration_date")}
                    />
                </div>
            </div>
            <div className="adm-form-actions">
                <button type="submit" className="adm-primary-btn" disabled={saving}>
                    {saving ? "Enregistrement…" : "Confirmer"}
                </button>
                <button type="button" className="adm-secondary-btn" onClick={onCancel}>
                    Annuler
                </button>
            </div>
        </form>
    );
}

// Adjust lot form
// Inline form to correct the quantity of an existing stock lot, with a mandatory reason.
function AdjustLotForm({lot, onSuccess, onCancel}) {
    const [quantity, setQuantity] = useState(String(lot.quantity));
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Submits the quantity correction to the API.
    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await adjustAdminStockLot(lot.id, {quantity: parseInt(quantity, 10), reason});
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || "Erreur lors de la correction.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="adm-inline-form adm-inline-form--adjust" onSubmit={handleSubmit}>
            <p className="adm-inline-form-title">Corriger le lot {lot.lot_number}</p>
            {error && <p className="adm-error">{error}</p>}
            <div className="adm-form-row">
                <div className="adm-form-group">
                    <label className="adm-label">Nouvelle quantité *</label>
                    <input
                        className="adm-input"
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <div className="adm-form-group adm-form-group--wide">
                    <label className="adm-label">Raison * (inventaire, casse, vol…)</label>
                    <input
                        className="adm-input"
                        placeholder="Ex : Inventaire mensuel"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="adm-form-actions">
                <button type="submit" className="adm-primary-btn" disabled={saving}>
                    {saving ? "Enregistrement…" : "Confirmer"}
                </button>
                <button type="button" className="adm-secondary-btn" onClick={onCancel}>
                    Annuler
                </button>
            </div>
        </form>
    );
}

// Lot row (table row + inline adjust form)
// Table row for a stock lot, with a toggle to show the inline adjust form.
function LotRow({lot, onAdjusted}) {
    const [adjusting, setAdjusting] = useState(false);

    return (
        <>
            <tr className="adm-lot-row">
                <td className="adm-date">Lot {lot.lot_number}</td>
                <td>{lot.quantity} unité{lot.quantity !== 1 ? "s" : ""}</td>
                <td className="adm-date">
                    {lot.expiration_date
                        ? new Date(lot.expiration_date).toLocaleDateString("fr-FR")
                        : "Sans expiration"}
                </td>
                <td>
                    <button
                        type="button"
                        className="adm-action-btn"
                        onClick={() => setAdjusting((v) => !v)}
                    >
                        {adjusting ? "Annuler" : "Corriger"}
                    </button>
                </td>
            </tr>
            {adjusting && (
                <tr>
                    <td colSpan={4} className="adm-lot-form-cell">
                        <AdjustLotForm
                            lot={lot}
                            onSuccess={() => {
                                setAdjusting(false);
                                onAdjusted();
                            }}
                            onCancel={() => setAdjusting(false)}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}

// Option stock block
// Displays stock for one product option (variant), its lots, and a form to restock it.
function OptionStockBlock({optionData, productId, onRefresh}) {
    const [showAdd, setShowAdd] = useState(false);

    return (
        <div className="adm-stock-block">
            <div className="adm-stock-block-head">
                <div className="adm-stock-block-info">
                    <span className="adm-badge adm-badge-blue">{optionData.option_type}</span>
                    <strong className="adm-stock-block-name">
                        {optionData.option_code}
                        {optionData.option_label &&
                        optionData.option_label !== optionData.option_code
                            ? ` — ${optionData.option_label}`
                            : ""}
                    </strong>
                    <StockQty qty={optionData.total_qty}/>
                </div>
                <button
                    type="button"
                    className="adm-primary-btn adm-primary-btn--sm"
                    onClick={() => setShowAdd((v) => !v)}
                >
                    {showAdd ? "Annuler" : "+ Réapprovisionner"}
                </button>
            </div>

            {showAdd && (
                <AddStockForm
                    productId={productId}
                    optionId={optionData.option_id}
                    onSuccess={() => {
                        setShowAdd(false);
                        onRefresh();
                    }}
                    onCancel={() => setShowAdd(false)}
                />
            )}

            {optionData.lots.length > 0 ? (
                <div className="adm-table-wrapper adm-table-wrapper--nested">
                    <table className="adm-table adm-table--lots">
                        <thead>
                        <tr>
                            <th>Lot</th>
                            <th>Quantité</th>
                            <th>Expiration</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {optionData.lots.map((lot) => (
                            <LotRow key={lot.id} lot={lot} onAdjusted={onRefresh}/>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="adm-empty-inline">Aucun lot enregistré — stock à zéro.</p>
            )}
        </div>
    );
}

// Main page
// Admin product stock page: current stock per option (or global) and movement history tabs.
export default function AdminStockPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("stock");
    const [stockData, setStockData] = useState(null);
    const [movements, setMovements] = useState(null);
    const [showGlobalAdd, setShowGlobalAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movPage, setMovPage] = useState(1);

    const loadStock = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setStockData(await getAdminProductStock(id));
        } catch {
            setError("Impossible de charger le stock de ce produit.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadMovements = useCallback(async () => {
        try {
            setMovements(await getAdminStockMovements(id, {page: movPage}));
        } catch {
            // Silent — only shown on tab switch
        }
    }, [id, movPage]);

    useEffect(() => {
        loadStock();
    }, [loadStock]);

    useEffect(() => {
        if (activeTab === "movements") loadMovements();
    }, [activeTab, loadMovements]);

    if (loading) return <p className="adm-loading">Chargement...</p>;
    if (error) return <p className="adm-error">{error}</p>;
    if (!stockData) return null;

    const hasOptions = (stockData.option_stocks?.length ?? 0) > 0;

    return (
        <div className="adm-page">
            <div className="adm-page-head">
                <button
                    type="button"
                    className="adm-back-btn"
                    onClick={() => navigate("/admin/stock")}
                >
                    ← Stocks
                </button>
                <h1 className="adm-page-title">Stock — {stockData.product_name}</h1>
            </div>

            {/* Tabs */}
            <div className="adm-tabs">
                {[
                    {id: "stock", label: "Stock actuel"},
                    {id: "movements", label: "Historique des mouvements"},
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`adm-tab ${activeTab === tab.id ? "is-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Actual Stock ── */}
            {activeTab === "stock" && (
                <div className="adm-stock-content">
                    {hasOptions ? (
                        stockData.option_stocks.map((optData) => (
                            <OptionStockBlock
                                key={optData.option_id}
                                optionData={optData}
                                productId={id}
                                onRefresh={loadStock}
                            />
                        ))
                    ) : (
                        /* Product without variants — global stock */
                        <div className="adm-stock-block">
                            <div className="adm-stock-block-head">
                                <div className="adm-stock-block-info">
                                    <strong className="adm-stock-block-name">Stock global</strong>
                                    <StockQty qty={stockData.global_stock.total_qty}/>
                                </div>
                                <button
                                    type="button"
                                    className="adm-primary-btn adm-primary-btn--sm"
                                    onClick={() => setShowGlobalAdd((v) => !v)}
                                >
                                    {showGlobalAdd ? "Annuler" : "+ Réapprovisionner"}
                                </button>
                            </div>

                            {showGlobalAdd && (
                                <AddStockForm
                                    productId={id}
                                    optionId={null}
                                    onSuccess={() => {
                                        setShowGlobalAdd(false);
                                        loadStock();
                                    }}
                                    onCancel={() => setShowGlobalAdd(false)}
                                />
                            )}

                            {stockData.global_stock.lots.length > 0 ? (
                                <div className="adm-table-wrapper adm-table-wrapper--nested">
                                    <table className="adm-table adm-table--lots">
                                        <thead>
                                        <tr>
                                            <th>Lot</th>
                                            <th>Quantité</th>
                                            <th>Expiration</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {stockData.global_stock.lots.map((lot) => (
                                            <LotRow
                                                key={lot.id}
                                                lot={lot}
                                                onAdjusted={loadStock}
                                            />
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="adm-empty-inline">Aucun lot enregistré — stock à zéro.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Historic ── */}
            {activeTab === "movements" && (
                <div className="adm-stock-content">
                    {!movements ? (
                        <p className="adm-loading">Chargement...</p>
                    ) : (
                        <>
                            <div className="adm-table-wrapper">
                                <table className="adm-table">
                                    <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Lot</th>
                                        <th>Quantité</th>
                                        <th>Raison</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(movements.data?.length ?? 0) === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="adm-empty">
                                                Aucun mouvement enregistré.
                                            </td>
                                        </tr>
                                    ) : (
                                        movements.data.map((mov) => {
                                            const mt = MOVEMENT_LABELS[mov.type] ?? {
                                                label: mov.type,
                                                css: "",
                                            };
                                            const qty = Number(mov.quantity);
                                            return (
                                                <tr key={mov.id}>
                                                    <td className="adm-date">
                                                        {new Date(mov.created_at).toLocaleString(
                                                            "fr-FR",
                                                            {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </td>
                                                    <td>
                                                            <span className={`adm-mov-badge ${mt.css}`}>
                                                                {mt.label}
                                                            </span>
                                                    </td>
                                                    <td className="adm-date">
                                                        {mov.lot?.lot_number ?? "—"}
                                                    </td>
                                                    <td>
                                                        {qty > 0 ? `+${qty}` : qty}
                                                    </td>
                                                    <td>{mov.reason || "—"}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {movements.last_page > 1 && (
                                <div className="adm-pagination">
                                    <button
                                        type="button"
                                        className="adm-page-btn"
                                        disabled={movPage <= 1}
                                        onClick={() => setMovPage((p) => p - 1)}
                                    >
                                        ← Précédent
                                    </button>
                                    <span className="adm-page-info">
                                        Page {movements.current_page} / {movements.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        className="adm-page-btn"
                                        disabled={movPage >= movements.last_page}
                                        onClick={() => setMovPage((p) => p + 1)}
                                    >
                                        Suivant →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
