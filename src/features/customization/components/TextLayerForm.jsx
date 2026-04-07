import { useState } from "react";

export default function TextLayerForm({ onAddText, textColor = "#111111" }) {
    const [text, setText] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        const value = text.trim();
        if (!value) return;

        onAddText({
            text: value,
            font: "Arial",
            size: 28,
            color: textColor,
            x: 290,
            y: 315,
            rotation: 0,
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