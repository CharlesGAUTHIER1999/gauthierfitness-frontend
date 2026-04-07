const TEMPLATES = [
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

export default function TemplateSelector({ value, onChange }) {
    return (
        <div className="pc-section">
            <h4 className="pc-section-title">Templates</h4>

            <div className="pc-template-grid">
                {TEMPLATES.map((tpl) => {
                    const active = value === tpl.id;

                    return (
                        <button
                            key={tpl.id}
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