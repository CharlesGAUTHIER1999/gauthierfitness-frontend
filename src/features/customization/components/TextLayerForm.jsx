import {useState} from "react";

// Form to add a free text layer to the product with default position/style
export default function TextLayerForm({onAddText, textColor = "#111111"}) {
    const [text, setText] = useState("");

    // Builds a new text layer object
    function handleSubmit(e) {
        e.preventDefault();

        const value = text.trim();
        if (!value) return;

        onAddText({
            id: `txt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: value,
            font: "Arial",
            size: 60,
            color: textColor,
            x: 290,
            y: 315,
            rotation: 0,
            uv: {x: 0.55, y: 0.55},
        });

        setText("");
    }

    return (
        <form className="pc-section" onSubmit={handleSubmit}>
            <h4 className="pc-section-title">Ajouter du texte libre</h4>

            <input
                className="pc-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: CHAMPION"
                maxLength={30}
            />

            <button type="submit" className="pc-secondary-btn" disabled={!text.trim()}>
                Ajouter le texte
            </button>
        </form>
    );
}