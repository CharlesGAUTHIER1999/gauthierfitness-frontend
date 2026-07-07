import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {createAdminProduct, getAdminProduct, updateAdminProduct,} from "../../api/adminApi";

const EMPTY_FORM = {
    name: "",
    description: "",
    price_ht: "",
    price_ttc: "",
    vat: "20",
    is_active: true,
    is_customizable: false,
    customization_mode: "",
    allow_text_customization: false,
    allow_image_upload: false,
    allow_ai_generation: false,
};

const EMPTY_OPTION = {type: "size", code: "", label: ""};

// Admin product create/edit form
export default function AdminProductFormPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [form, setForm] = useState(EMPTY_FORM);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isEdit) return;
        getAdminProduct(id)
            .then((res) => {
                const p = res.data ?? res;
                setForm({
                    name: p.name ?? "",
                    description: p.description ?? "",
                    price_ht: p.price_ht ?? "",
                    price_ttc: p.price_ttc ?? "",
                    vat: p.vat ?? "20",
                    is_active: p.is_active ?? true,
                    is_customizable: p.is_customizable ?? false,
                    customization_mode: p.customization?.mode ?? "",
                    allow_text_customization: p.customization?.text ?? false,
                    allow_image_upload: p.customization?.image ?? false,
                    allow_ai_generation: p.customization?.ai ?? false,
                });
                setOptions(Array.isArray(p.options) ? p.options.map((o) => ({
                    _localId: crypto.randomUUID(),
                    type: o.type,
                    code: o.code,
                    label: o.label ?? ""
                })) : []);
            })
            .catch(() => setError("Produit introuvable."))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    // Updates a single field on the product form
    function set(key, value) {
        setForm((prev) => ({...prev, [key]: value}));
    }

    // Appends a new blank option row
    function addOption() {
        setOptions((prev) => [...prev, {...EMPTY_OPTION, _localId: crypto.randomUUID()}]);
    }

    // Strips the client-only _localId before sending options to the API
    function toOptionPayload(opt) {
        const {_localId, ...rest} = opt;
        return rest;
    }

    // Removes the option row at the given index
    function removeOption(idx) {
        setOptions((prev) => prev.filter((_, i) => i !== idx));
    }

    // Updates a single field of the option row at the given index
    function updateOption(idx, key, value) {
        setOptions((prev) => prev.map((o, i) => (i === idx ? {...o, [key]: value} : o)));
    }

    // Builds the payload and creates or updates the product depending on edit mode
    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            ...form,
            price_ht: parseFloat(form.price_ht),
            price_ttc: parseFloat(form.price_ttc),
            vat: parseFloat(form.vat),
            customization_mode: form.is_customizable ? form.customization_mode || null : null,
            options: form.is_customizable ? undefined : options,
        };

        if (!form.is_customizable) {
            payload.options = options.filter((o) => o.code.trim()).map(toOptionPayload);
        }

        try {
            if (isEdit) {
                await updateAdminProduct(id, payload);
            } else {
                await createAdminProduct({
                    ...payload,
                    options: options.filter((o) => o.code.trim()).map(toOptionPayload),
                });
            }
            navigate("/admin/products");
        } catch (e) {
            setError(e?.response?.data?.message || JSON.stringify(e?.response?.data?.errors) || "Une erreur est survenue.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="adm-loading">Chargement...</p>;

    return (<div className="adm-page">
        <h1 className="adm-page-title">
            {isEdit ? "Modifier le produit" : "Nouveau produit"}
        </h1>

        {error && <p className="adm-error">{error}</p>}

        <form className="adm-form" onSubmit={handleSubmit}>
            <div className="adm-form-section">
                <h2 className="adm-form-section-title">Informations générales</h2>

                <label className="adm-label">
                    Nom *
                    <input
                        className="adm-input"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        required
                    />
                </label>

                <label className="adm-label">
                    Description
                    <textarea
                        className="adm-input adm-textarea"
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        rows={3}
                    />
                </label>

                <div className="adm-form-row">
                    <label className="adm-label">
                        Prix HT (€) *
                        <input
                            className="adm-input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.price_ht}
                            onChange={(e) => set("price_ht", e.target.value)}
                            required
                        />
                    </label>
                    <label className="adm-label">
                        Prix TTC (€) *
                        <input
                            className="adm-input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.price_ttc}
                            onChange={(e) => set("price_ttc", e.target.value)}
                            required
                        />
                    </label>
                    <label className="adm-label">
                        TVA (%)
                        <input
                            className="adm-input"
                            type="number"
                            step="0.1"
                            min="0"
                            value={form.vat}
                            onChange={(e) => set("vat", e.target.value)}
                        />
                    </label>
                </div>

                <label className="adm-checkbox-row">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => set("is_active", e.target.checked)}
                    />
                    Produit actif (visible en boutique)
                </label>
            </div>

            <div className="adm-form-section">
                <h2 className="adm-form-section-title">Personnalisation</h2>

                <label className="adm-checkbox-row">
                    <input
                        type="checkbox"
                        checked={form.is_customizable}
                        onChange={(e) => set("is_customizable", e.target.checked)}
                    />
                    Produit customisable
                </label>

                {form.is_customizable && (<>
                    <label className="adm-label">
                        Mode de customisation
                        <select
                            className="adm-input"
                            value={form.customization_mode}
                            onChange={(e) => set("customization_mode", e.target.value)}
                        >
                            <option value="">— Choisir —</option>
                            <option value="2d">2D (canvas)</option>
                            <option value="3d">3D (modèle GLB)</option>
                        </select>
                    </label>

                    <div className="adm-checkbox-group">
                        <label className="adm-checkbox-row">
                            <input
                                type="checkbox"
                                checked={form.allow_text_customization}
                                onChange={(e) => set("allow_text_customization", e.target.checked)}
                            />
                            Texte libre
                        </label>
                        <label className="adm-checkbox-row">
                            <input
                                type="checkbox"
                                checked={form.allow_image_upload}
                                onChange={(e) => set("allow_image_upload", e.target.checked)}
                            />
                            Upload d'image
                        </label>
                        <label className="adm-checkbox-row">
                            <input
                                type="checkbox"
                                checked={form.allow_ai_generation}
                                onChange={(e) => set("allow_ai_generation", e.target.checked)}
                            />
                            Génération IA
                        </label>
                    </div>
                </>)}
            </div>

            <div className="adm-form-section">
                <div className="adm-form-section-head">
                    <h2 className="adm-form-section-title">Options (tailles, formats…)</h2>
                    <button type="button" className="adm-secondary-btn" onClick={addOption}>
                        + Ajouter
                    </button>
                </div>

                {options.length === 0 && (
                    <p className="adm-hint">Aucune option — le produit sera ajouté sans taille.</p>)}

                {options.map((opt, idx) => (<div key={opt._localId} className="adm-option-row">
                    <select
                        className="adm-input adm-input-sm"
                        value={opt.type}
                        onChange={(e) => updateOption(idx, "type", e.target.value)}
                    >
                        <option value="size">Taille</option>
                        <option value="format">Format</option>
                        <option value="capacity">Capacité</option>
                    </select>

                    <input
                        className="adm-input adm-input-sm"
                        placeholder="Code (ex: S, XL)"
                        value={opt.code}
                        onChange={(e) => updateOption(idx, "code", e.target.value)}
                    />

                    <input
                        className="adm-input adm-input-sm"
                        placeholder="Label (optionnel)"
                        value={opt.label}
                        onChange={(e) => updateOption(idx, "label", e.target.value)}
                    />

                    <button
                        type="button"
                        className="adm-action-btn adm-action-danger"
                        onClick={() => removeOption(idx)}
                    >
                        ✕
                    </button>
                </div>))}
            </div>

            <div className="adm-form-actions">
                <button
                    type="button"
                    className="adm-secondary-btn"
                    onClick={() => navigate("/admin/products")}
                >
                    Annuler
                </button>
                <button type="submit" className="adm-primary-btn" disabled={saving}>
                    {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le produit"}
                </button>
            </div>
        </form>
    </div>);
}
