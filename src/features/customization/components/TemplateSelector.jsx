const TEMPLATES = [
    {
        id: null,
        name: "Aucun",
        description: "Pas de décor de fond",
    },
    {
        id: "basic-front-template",
        name: "Rayures / classique",
        description: "Placement centré sur la face avant",
    },
    {
        id: "clean-front-template",
        name: "Minimal",
        description: "Rendu plus sobre et propre",
    },
];

// Grid picker for the decorative template applied to the front view
export default function TemplateSelector({value, onChange}) {
    return (
        <div className="pc-section">
            <h4 className="pc-section-title">Templates</h4>

            <div className="pc-template-grid">
                {TEMPLATES.map((tpl) => {
                    const active = (value || null) === tpl.id;

                    return (
                        <button
                            key={tpl.id ?? "__none__"}
                            type="button"
                            className={`pc-template-card ${active ? "is-active" : ""}`}
                            onClick={() => onChange(tpl.id)}
                        >
                            <strong>{tpl.name}</strong>
                            <span>{tpl.description}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
