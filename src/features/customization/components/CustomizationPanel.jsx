import {useMemo, useRef, useState} from "react";
import {FiX} from "react-icons/fi";
import AiDesignForm from "./AiDesignForm";
import TemplateSelector from "./TemplateSelector";
import TextLayerForm from "./TextLayerForm";

// Constants

const TEXT_COLORS = [
    {label: "Noir", value: "#111111"},
    {label: "Blanc", value: "#ffffff"},
    {label: "Rouge", value: "#c62828"},
    {label: "Bleu", value: "#1565c0"},
];

const PRODUCT_COLOR_SWATCHES_3D = [
    {label: "Bleu fitness", value: "#1d4ed8"},
    {label: "Noir", value: "#111111"},
    {label: "Blanc", value: "#f9fafb"},
    {label: "Rouge", value: "#dc2626"},
    {label: "Vert", value: "#16a34a"},
    {label: "Marine", value: "#1e3a5f"},
    {label: "Gris anthracite", value: "#374151"},
    {label: "Bordeaux", value: "#7f1d1d"},
];

const PRESET_LOGOS = [
    {label: "Aucun logo", value: ""},
    {label: "UBB", value: "/logos/ubb.png"},
    {label: "FFR", value: "/logos/ffr.jpg"},
    {label: "Stade Toul.", value: "/logos/stadetoulousain.jpg"},
    {label: "Stade Roch.", value: "/logos/staderochelais.jpg"},
    {label: "Badge noir", value: "/logos/badge-black.jpg"},
    {label: "Badge blanc", value: "/logos/badge-white.jpg"},
];

const PATTERN_OPTIONS = [
    {id: "motif1", label: "Motif 1", thumb: "/motifs/motif1.png"},
    {id: "motif2", label: "Motif 2", thumb: "/motifs/motif2.png"},
    {id: "motif3", label: "Motif 3", thumb: "/motifs/motif3.png"},
];

const GRADIENT_OPTIONS = [
    {id: "degrade1", label: "Dégradé 1", thumb: "/degrades/degrade1.jpg"},
    {id: "degrade2", label: "Dégradé 2", thumb: "/degrades/degrade2.jpg"},
    {id: "degrade3", label: "Dégradé 3", thumb: "/degrades/degrade3.jpg"},
];

const TABS = [
    {id: "style", label: "Style"},
    {id: "texte", label: "Texte"},
    {id: "medias", label: "Médias"},
];

// Internal sub-components
// Toggleable accordion showing a grid of visual options (patterns/gradients) to pick from.
function VisualGallery({title, enabled, selectedId, options, onToggle, onSelect}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="pc-accordion">
            <div className="pc-accordion-head">
                <div className="pc-accordion-left">
                    <span className="pc-accordion-title">{title}</span>
                </div>
                <div className="pc-accordion-controls">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        className={`pc-toggle-btn ${enabled ? "is-on" : ""}`}
                        onClick={() => onToggle(!enabled)}
                        aria-label={`Activer ${title}`}
                    />
                    <button
                        type="button"
                        className={`pc-accordion-chevron ${open ? "is-open" : ""}`}
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Voir les options"
                    >
                        ›
                    </button>
                </div>
            </div>

            {open && (
                <div className="pc-style-gallery">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            className={`pc-style-option ${selectedId === option.id ? "is-active" : ""}`}
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
                    ))}
                </div>
            )}
        </div>
    );
}

const UploadIcon = () => (
    <svg
        className="pc-upload-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);

// File upload button backed by a hidden file input.
function UploadButton({label, accept, disabled, loading, onChange, children}) {
    const ref = useRef(null);

    return (
        <div className="pc-upload-wrap">
            <button
                type="button"
                className="pc-upload-btn"
                disabled={disabled || loading}
                onClick={() => ref.current?.click()}
            >
                <UploadIcon/>
                {loading ? "Import en cours…" : label}
            </button>
            <input
                ref={ref}
                type="file"
                accept={accept}
                disabled={disabled || loading}
                style={{display: "none"}}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                    e.target.value = "";
                }}
            />
            {children}
        </div>
    );
}

// Tabs content
// "Style" tab: view (front/back), product color/variant, template, and visual effects
function StyleTab({
                      configuration,
                      mode,
                      variants,
                      currentVariantSlug,
                      product,
                      currentView,
                      currentStyle,
                      onViewChange,
                      onProductColorChange,
                      onVariantSelect,
                      onTemplateChange,
                      onPatternToggle,
                      onPatternSelect,
                      onGradientToggle,
                      onGradientSelect,
                  }) {
    return (
        <div className="pc-tab-body">
            {/* Application zone */}
            <div className="pc-field-group">
                <p className="pc-field-label">Zone d'application</p>
                <div className="pc-view-switch">
                    <button
                        type="button"
                        className={`pc-view-btn ${currentView === "front" ? "is-active" : ""}`}
                        onClick={() => onViewChange("front")}
                    >
                        Face avant
                    </button>
                    <button
                        type="button"
                        className={`pc-view-btn ${currentView === "back" ? "is-active" : ""}`}
                        onClick={() => onViewChange("back")}
                    >
                        Face arrière
                    </button>
                </div>
            </div>

            {/* Product color */}
            {mode === "3d" ? (
                <div className="pc-field-group">
                    <p className="pc-field-label">Couleur du vêtement</p>
                    <div className="pc-swatches-row">
                        {PRODUCT_COLOR_SWATCHES_3D.map((swatch) => (
                            <button
                                key={swatch.value}
                                type="button"
                                title={swatch.label}
                                aria-label={swatch.label}
                                className={`pc3d-swatch ${configuration?.product_color_hex === swatch.value ? "is-active" : ""}`}
                                style={{backgroundColor: swatch.value}}
                                onClick={() => onProductColorChange?.(swatch.value)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                variants.length > 0 && (
                    <div className="pc-field-group">
                        <p className="pc-field-label">Couleur / variante</p>
                        <div className="pc-variants-grid">
                            {variants.map((variant) => {
                                const label =
                                    variant.variant_value_label ||
                                    variant.flavor_label ||
                                    variant.color_label ||
                                    variant.slug;
                                const isActive = variant.slug === currentVariantSlug;
                                return (
                                    <button
                                        key={variant.slug}
                                        type="button"
                                        className={`pc-style-option ${isActive ? "is-active" : ""}`}
                                        onClick={() => onVariantSelect?.(variant.slug)}
                                        title={label}
                                    >
                                        <div className="pc-style-thumb">
                                            <img
                                                src={variant.thumb_url || product?.main_image || "/placeholder.png"}
                                                alt={label}
                                                className="pc-style-thumb-image"
                                            />
                                        </div>
                                        <span className="pc-style-option-label">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )
            )}

            {/* Templates */}
            <div className="pc-field-group">
                <TemplateSelector
                    value={configuration?.template_id}
                    onChange={onTemplateChange}
                />
            </div>

            {/* Patterns & gradients */}
            <div className="pc-field-group">
                <p className="pc-field-label">Effets visuels</p>
                <VisualGallery
                    title="Motifs"
                    enabled={currentStyle?.pattern?.enabled}
                    selectedId={currentStyle?.pattern?.id}
                    options={PATTERN_OPTIONS}
                    onToggle={onPatternToggle}
                    onSelect={onPatternSelect}
                />
                <VisualGallery
                    title="Dégradés"
                    enabled={currentStyle?.gradient?.enabled}
                    selectedId={currentStyle?.gradient?.id}
                    options={GRADIENT_OPTIONS}
                    onToggle={onGradientToggle}
                    onSelect={onGradientSelect}
                />
            </div>
        </div>
    );
}

// "Text" tab : text color, player name/number, and free text layers.
function TexteTab({
                      configuration,
                      onTextColorChange,
                      onPlayerNameChange,
                      onPlayerNumberChange,
                      onAddTextLayer,
                  }) {
    return (
        <div className="pc-tab-body">
            {/* Text color */}
            <div className="pc-field-group">
                <p className="pc-field-label">Couleur du texte</p>
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
                                style={{backgroundColor: color.value}}
                            />
                            {color.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Player name */}
            <div className="pc-field-group">
                <label className="pc-field-label" htmlFor="pc-player-name">
                    Nom du joueur
                </label>
                <input
                    id="pc-player-name"
                    className="pc-input"
                    type="text"
                    value={configuration?.player_name?.value || ""}
                    onChange={(e) => onPlayerNameChange(e.target.value)}
                    placeholder="Ex : GAUTHIER"
                    maxLength={18}
                />
            </div>

            {/* Number */}
            <div className="pc-field-group">
                <label className="pc-field-label" htmlFor="pc-player-number">
                    Numéro
                </label>
                <input
                    id="pc-player-number"
                    className="pc-input"
                    type="text"
                    value={configuration?.player_number?.value || ""}
                    onChange={(e) => onPlayerNumberChange(e.target.value)}
                    placeholder="Ex : 7"
                    maxLength={3}
                />
            </div>

            {/* Free text */}
            <div className="pc-field-group">
                <TextLayerForm
                    onAddText={onAddTextLayer}
                    textColor={configuration?.text_style?.color}
                />
            </div>
        </div>
    );
}

// "Media" tab : logo selection/upload, free images, and AI design generation.
function MediasTab({
                       configuration,
                       currentView,
                       onToggleLogo,
                       onLogoSelect,
                       onUploadLogo,
                       uploadLogoLoading,
                       uploadLogoError,
                       onRemoveLogo,
                       onUploadImage,
                       uploadImageLoading,
                       uploadImageError,
                       onRemoveImageLayer,
                       onGenerateAiDesign,
                       aiLoading,
                       aiError,
                       aiEnabled,
                   }) {
    const isUploadedLogo =
        Boolean(configuration?.logo?.src) &&
        !PRESET_LOGOS.some((l) => l.value === configuration?.logo?.src);

    const currentViewImageLayers = Array.isArray(configuration?.image_layers)
        ? configuration.image_layers.filter(
            (layer) => (layer?.view || "front") === currentView
        )
        : [];

    return (
        <div className="pc-tab-body">
            {/* Logo */}
            <div className="pc-field-group">
                <div className="pc-field-row">
                    <p className="pc-field-label" style={{margin: 0}}>
                        Logo poitrine
                    </p>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(configuration?.logo?.enabled)}
                        className={`pc-toggle-btn ${configuration?.logo?.enabled ? "is-on" : ""}`}
                        onClick={() => onToggleLogo(!configuration?.logo?.enabled)}
                        aria-label="Activer le logo"
                    />
                </div>

                {!configuration?.logo?.enabled && (
                    <p className="pc-medias-hint">
                        Activez le toggle pour choisir ou importer un logo sur la poitrine.
                    </p>
                )}

                {configuration?.logo?.enabled && (
                    <>
                        <select
                            className="pc-input"
                            value={isUploadedLogo ? "" : (configuration?.logo?.src || "")}
                            onChange={(e) => onLogoSelect(e.target.value)}
                        >
                            {PRESET_LOGOS.map((logo) => (
                                <option key={logo.value} value={logo.value}>
                                    {logo.label}
                                </option>
                            ))}
                        </select>

                        <UploadButton
                            label="Importer un logo personnalisé"
                            accept=".png,.jpg,.jpeg,.webp"
                            loading={uploadLogoLoading}
                            onChange={onUploadLogo}
                        >
                            {uploadLogoError && (
                                <p className="pc-upload-error">{uploadLogoError}</p>
                            )}
                            {isUploadedLogo && (
                                <p className="pc-upload-ok">Logo personnalisé importé</p>
                            )}
                        </UploadButton>

                        {Boolean(configuration?.logo?.src) && (
                            <button
                                type="button"
                                className="pc-remove-btn"
                                onClick={onRemoveLogo}
                            >
                                Supprimer le logo
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Free image */}
            <div className="pc-field-group">
                <p className="pc-field-label">
                    Image libre
                    {currentViewImageLayers.length > 0 && (
                        <span className="pc-field-count">
                            {currentViewImageLayers.length}
                        </span>
                    )}
                </p>

                <UploadButton
                    label="Ajouter une image"
                    accept=".png,.jpg,.jpeg,.webp"
                    loading={uploadImageLoading}
                    onChange={onUploadImage}
                >
                    {uploadImageError && (
                        <p className="pc-upload-error">{uploadImageError}</p>
                    )}
                </UploadButton>

                {currentViewImageLayers.length > 0 && (
                    <div className="pc-image-list">
                        {currentViewImageLayers.map((layer, index) => (
                            <div
                                key={layer.id || `${layer.src}-${index}`}
                                className="pc-image-item"
                            >
                                <span className="pc-image-name">
                                    {layer.original_name || `Image ${index + 1}`}
                                </span>
                                <button
                                    type="button"
                                    className="pc-remove-btn pc-remove-btn-sm"
                                    onClick={() => onRemoveImageLayer?.(layer.id)}
                                >
                                    <FiX/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI design generation */}
            {aiEnabled && (
                <AiDesignForm
                    onGenerate={onGenerateAiDesign}
                    loading={aiLoading}
                    error={aiError}
                />
            )}
        </div>
    );
}

// Main component
// Sidebar panel with tabbed sections (style/text/media) for configuring the product.
export default function CustomizationPanel({
                                               product,
                                               configuration,
                                               variants = [],
                                               currentVariantSlug = null,
                                               onVariantSelect,
                                               onTemplateChange,
                                               onViewChange,
                                               onAddTextLayer,
                                               onPlayerNameChange,
                                               onPlayerNumberChange,
                                               onToggleLogo,
                                               onTextColorChange,
                                               onLogoSelect,
                                               onUploadLogo,
                                               uploadLogoLoading = false,
                                               uploadLogoError = null,
                                               onRemoveLogo,
                                               onUploadImage,
                                               uploadImageLoading = false,
                                               uploadImageError = null,
                                               onRemoveImageLayer,
                                               onGenerateAiDesign,
                                               aiLoading = false,
                                               aiError = null,
                                               onPatternToggle,
                                               onPatternSelect,
                                               onGradientToggle,
                                               onGradientSelect,
                                               onProductColorChange,
                                               onResetConfiguration,
                                               onSave,
                                               onFinish,
                                               saving,
                                               finishing,
                                               disabled = false,
                                               hasSavedSession = false,
                                               mode = "2d",
                                           }) {
    const [activeTab, setActiveTab] = useState("style");
    const currentView = configuration?.view || "front";

    const currentStyle = useMemo(
        () =>
            configuration?.style?.[currentView] || {
                pattern: {enabled: false, id: null},
                gradient: {enabled: false, id: null},
            },
        [configuration?.style, currentView]
    );

    return (
        <aside className="pc-sidebar">
            {/* Header */}
            <div className="pc-panel-header">
                <h3 className="pc-panel-title">Configuration</h3>
                {product?.name && (
                    <p className="pc-panel-subtitle">{product.name}</p>
                )}
            </div>

            {/* Tab navigation */}
            <div className="pc-tabs" role="tablist">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={`pc-tab ${activeTab === tab.id ? "is-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Active tab content */}
            <div className="pc-tab-content" role="tabpanel">
                {activeTab === "style" && (
                    <StyleTab
                        configuration={configuration}
                        mode={mode}
                        variants={variants}
                        currentVariantSlug={currentVariantSlug}
                        product={product}
                        currentView={currentView}
                        currentStyle={currentStyle}
                        onViewChange={onViewChange}
                        onProductColorChange={onProductColorChange}
                        onVariantSelect={onVariantSelect}
                        onTemplateChange={onTemplateChange}
                        onPatternToggle={onPatternToggle}
                        onPatternSelect={onPatternSelect}
                        onGradientToggle={onGradientToggle}
                        onGradientSelect={onGradientSelect}
                    />
                )}

                {activeTab === "texte" && (
                    <TexteTab
                        configuration={configuration}
                        onTextColorChange={onTextColorChange}
                        onPlayerNameChange={onPlayerNameChange}
                        onPlayerNumberChange={onPlayerNumberChange}
                        onAddTextLayer={onAddTextLayer}
                    />
                )}

                {activeTab === "medias" && (
                    <MediasTab
                        configuration={configuration}
                        currentView={currentView}
                        onToggleLogo={onToggleLogo}
                        onLogoSelect={onLogoSelect}
                        onUploadLogo={onUploadLogo}
                        uploadLogoLoading={uploadLogoLoading}
                        uploadLogoError={uploadLogoError}
                        onRemoveLogo={onRemoveLogo}
                        onUploadImage={onUploadImage}
                        uploadImageLoading={uploadImageLoading}
                        uploadImageError={uploadImageError}
                        onRemoveImageLayer={onRemoveImageLayer}
                        onGenerateAiDesign={onGenerateAiDesign}
                        aiLoading={aiLoading}
                        aiError={aiError}
                        aiEnabled={Boolean(product?.customization?.ai)}
                    />
                )}
            </div>

            {/* Footer CTA - always visible */}
            <div className="pc-panel-footer">
                <div className="pc-footer-secondary">
                    <button
                        type="button"
                        className="pc-secondary-btn"
                        onClick={onSave}
                        disabled={saving || disabled}
                    >
                        {saving ? "Enregistrement…" : "Brouillon"}
                    </button>
                    <button
                        type="button"
                        className="pc-secondary-btn"
                        onClick={onResetConfiguration}
                        disabled={saving || finishing}
                    >
                        Réinitialiser
                    </button>
                </div>

                <button
                    type="button"
                    className="pc-primary-btn"
                    onClick={onFinish}
                    disabled={disabled || finishing}
                >
                    {finishing
                        ? "Finalisation…"
                        : hasSavedSession
                            ? "Terminer la configuration"
                            : "Sauvegarder et terminer"}
                </button>
            </div>
        </aside>
    );
}
