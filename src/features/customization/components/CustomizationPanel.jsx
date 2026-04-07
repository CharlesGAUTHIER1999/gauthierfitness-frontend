import { useMemo, useState } from "react";
import TemplateSelector from "./TemplateSelector";
import TextLayerForm from "./TextLayerForm";

const TEXT_COLORS = [
    { label: "Noir", value: "#111111" },
    { label: "Blanc", value: "#ffffff" },
    { label: "Rouge", value: "#c62828" },
    { label: "Bleu", value: "#1565c0" },
];

const PRESET_LOGOS = [
    { label: "Aucun logo", value: "" },
    { label: "UBB", value: "/logos/ubb.png" },
    { label: "FFR", value: "/logos/ffr.jpg" },
    { label: "ST", value: "/logos/stadetoulousain.jpg" },
    { label: "SR", value: "/logos/staderochelais.jpg" },
    { label: "Badge noir", value: "/logos/badge-black.jpg" },
    { label: "Badge blanc", value: "/logos/badge-white.jpg" },
];

const PATTERN_OPTIONS = [
    { id: "motif1", label: "Motif 1", thumb: "/motifs/motif1.png" },
    { id: "motif2", label: "Motif 2", thumb: "/motifs/motif2.png" },
    { id: "motif3", label: "Motif 3", thumb: "/motifs/motif3.png" },
];

const GRADIENT_OPTIONS = [
    { id: "degrade1", label: "Dégradé 1", thumb: "/degrades/degrade1.jpg" },
    { id: "degrade2", label: "Dégradé 2", thumb: "/degrades/degrade2.jpg" },
    { id: "degrade3", label: "Dégradé 3", thumb: "/degrades/degrade3.jpg" },
];

function StyleSelectionBlock({
                                 title,
                                 enabled,
                                 selectedId,
                                 options,
                                 onToggle,
                                 onSelect,
                             }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="pc-style-card">
            <div className="pc-style-head">
                <div className="pc-style-head-left">
                    <p className="pc-style-label">{title}</p>
                    <p className="pc-style-subtext">
                        Active {title.toLowerCase()} puis choisis un visuel.
                    </p>
                </div>

                <div className="pc-style-actions">
                    <input
                        type="checkbox"
                        className="pc-toggle"
                        checked={Boolean(enabled)}
                        onChange={(e) => onToggle(e.target.checked)}
                    />

                    <button
                        type="button"
                        className="pc-style-expand-btn"
                        onClick={() => setExpanded((prev) => !prev)}
                        aria-label={`Ouvrir la liste ${title.toLowerCase()}`}
                    >
                        {expanded ? "−" : "›"}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="pc-style-gallery">
                    {options.map((option) => {
                        const isActive = selectedId === option.id;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                className={`pc-style-option ${isActive ? "is-active" : ""}`}
                                onClick={() => onSelect(option.id)}
                            >
                                <div className="pc-style-thumb">
                                    <img
                                        src={option.thumb}
                                        alt={option.label}
                                        className="pc-style-thumb-image"
                                    />
                                </div>

                                <span className="pc-style-option-label">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function CustomizationPanel({
                                               configuration,
                                               onTemplateChange,
                                               onViewChange,
                                               onAddTextLayer,
                                               onPlayerNameChange,
                                               onPlayerNumberChange,
                                               onToggleLogo,
                                               onTextColorChange,
                                               onLogoSelect,
                                               onPatternToggle,
                                               onPatternSelect,
                                               onGradientToggle,
                                               onGradientSelect,
                                               onSave,
                                               onFinish,
                                               saving,
                                               finishing,
                                               disabled = false,
                                               hasSavedSession = false,
                                           }) {
    const currentView = configuration?.view || "front";

    const currentStyle = useMemo(() => {
        return configuration?.style?.[currentView] || {
            pattern: { enabled: false, id: null },
            gradient: { enabled: false, id: null },
        };
    }, [configuration?.style, currentView]);

    return (
        <aside className="pc-sidebar">
            <div className="pc-sidebar-card">
                <h3 className="pc-sidebar-title">Configuration</h3>
                <p className="pc-sidebar-text">
                    Choisis un design de base, sélectionne la face avant ou arrière,
                    ajoute un nom, un numéro, un logo ou un texte libre, puis termine
                    la configuration.
                </p>
            </div>

            <div className="pc-sidebar-card">
                <div className="pc-section">
                    <h4 className="pc-section-title">Vue</h4>

                    <div className="pc-view-switch">
                        <button
                            type="button"
                            className={`pc-view-btn ${configuration?.view === "front" ? "is-active" : ""}`}
                            onClick={() => onViewChange("front")}
                        >
                            Face avant
                        </button>
                        <button
                            type="button"
                            className={`pc-view-btn ${configuration?.view === "back" ? "is-active" : ""}`}
                            onClick={() => onViewChange("back")}
                        >
                            Face arrière
                        </button>
                    </div>
                </div>
            </div>

            <div className="pc-sidebar-card">
                <TemplateSelector
                    value={configuration?.template_id}
                    onChange={onTemplateChange}
                />
            </div>

            <div className="pc-sidebar-card">
                <StyleSelectionBlock
                    title="Motifs"
                    enabled={currentStyle?.pattern?.enabled}
                    selectedId={currentStyle?.pattern?.id}
                    options={PATTERN_OPTIONS}
                    onToggle={onPatternToggle}
                    onSelect={onPatternSelect}
                />

                <div style={{ marginTop: 16 }}>
                    <StyleSelectionBlock
                        title="Dégradés"
                        enabled={currentStyle?.gradient?.enabled}
                        selectedId={currentStyle?.gradient?.id}
                        options={GRADIENT_OPTIONS}
                        onToggle={onGradientToggle}
                        onSelect={onGradientSelect}
                    />
                </div>
            </div>

            <div className="pc-sidebar-card">
                <div className="pc-section">
                    <h4 className="pc-section-title">Couleur du texte</h4>
                    <div className="pc-color-grid">
                        {TEXT_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                className={`pc-color-chip ${
                                    configuration?.text_style?.color === color.value ? "is-active" : ""
                                }`}
                                onClick={() => onTextColorChange(color.value)}
                            >
                                <span
                                    className="pc-color-dot"
                                    style={{ backgroundColor: color.value }}
                                />
                                {color.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pc-sidebar-card">
                <div className="pc-section">
                    <h4 className="pc-section-title">Nom du joueur</h4>
                    <input
                        className="pc-input"
                        type="text"
                        value={configuration?.player_name?.value || ""}
                        onChange={(e) => onPlayerNameChange(e.target.value)}
                        placeholder="Ex: GAUTHIER"
                        maxLength={18}
                    />
                </div>

                <div className="pc-section" style={{ marginTop: 14 }}>
                    <h4 className="pc-section-title">Numéro</h4>
                    <input
                        className="pc-input"
                        type="text"
                        value={configuration?.player_number?.value || ""}
                        onChange={(e) => onPlayerNumberChange(e.target.value)}
                        placeholder="Ex: 7"
                        maxLength={3}
                    />
                </div>
            </div>

            <div className="pc-sidebar-card">
                <div className="pc-section">
                    <label className="pc-checkbox-row">
                        <input
                            type="checkbox"
                            checked={Boolean(configuration?.logo?.enabled)}
                            onChange={(e) => onToggleLogo(e.target.checked)}
                        />
                        <span>Afficher un logo poitrine</span>
                    </label>

                    <select
                        className="pc-input"
                        value={configuration?.logo?.src || ""}
                        onChange={(e) => onLogoSelect(e.target.value)}
                        disabled={!configuration?.logo?.enabled}
                    >
                        {PRESET_LOGOS.map((logo) => (
                            <option key={logo.value} value={logo.value}>
                                {logo.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="pc-sidebar-card">
                <TextLayerForm
                    onAddText={onAddTextLayer}
                    textColor={configuration?.text_style?.color}
                />
            </div>

            <div className="pc-sidebar-card">
                <button
                    type="button"
                    className="pc-secondary-btn"
                    onClick={onSave}
                    disabled={saving || disabled}
                >
                    {saving ? "Enregistrement..." : "Sauvegarder le brouillon"}
                </button>

                <button
                    type="button"
                    className="pc-primary-btn"
                    onClick={onFinish}
                    disabled={disabled || finishing}
                    style={{ marginTop: 12 }}
                >
                    {finishing
                        ? "Finalisation..."
                        : hasSavedSession
                            ? "Terminer la configuration"
                            : "Sauvegarder et terminer"}
                </button>
            </div>
        </aside>
    );
}