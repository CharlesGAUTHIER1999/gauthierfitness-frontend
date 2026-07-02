import {useState} from "react";

const MIN_PROMPT_LENGTH = 10;
const MAX_PROMPT_LENGTH = 5000;

// Prompt input and AI design generation.
export default function AiDesignForm({onGenerate, loading = false, error = null, disabled = false}) {
    const [prompt, setPrompt] = useState("");

    const trimmed = prompt.trim();
    const tooShort = trimmed.length > 0 && trimmed.length < MIN_PROMPT_LENGTH;
    const canSubmit = !loading && !disabled && trimmed.length >= MIN_PROMPT_LENGTH;

    // Submits the prompt to generate a design, clears the field on success
    async function handleSubmit() {
        if (!canSubmit) return;
        const ok = await onGenerate(trimmed);
        if (ok) setPrompt("");
    }

    return (
        <div className="pc-field-group">
            <p className="pc-field-label">Générer un design par IA</p>

            <textarea
                className="pc-input"
                rows={3}
                value={prompt}
                disabled={loading || disabled}
                maxLength={MAX_PROMPT_LENGTH}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex : un aigle stylisé géométrique aux couleurs flashy pour un maillot de sport"
            />

            <p className="pc-medias-hint">
                Décrivez le visuel souhaité. Les demandes et images contraires à nos règles
                de contenu (haine, violence, contenu explicite…) sont automatiquement refusées.
            </p>

            <button
                type="button"
                className="pc-upload-btn"
                disabled={!canSubmit}
                onClick={handleSubmit}
            >
                {loading ? "Génération en cours…" : "Générer le design"}
            </button>

            {tooShort && (
                <p className="pc-upload-error">
                    Le prompt doit faire au moins {MIN_PROMPT_LENGTH} caractères.
                </p>
            )}
            {error && <p className="pc-upload-error">{error}</p>}
        </div>
    );
}
