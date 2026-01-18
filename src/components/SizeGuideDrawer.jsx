import { useEffect, useMemo, useRef, useState } from "react";

export default function SizeGuideDrawer({ open, onClose }) {
    const closeBtnRef = useRef(null);
    const panelRef = useRef(null);

    // Par défaut on affiche CM (comme ton screenshot)
    const [unit, setUnit] = useState("CM"); // "CM" | "IN"

    // Base en CM (XXS -> XXL)
    const rowsCm = useMemo(
        () => [
            { size: "XXS", waist: 70, inseam: 82 },
            { size: "XS", waist: 75, inseam: 82 },
            { size: "S", waist: 80, inseam: 82 },
            { size: "M", waist: 85, inseam: 82 },
            { size: "L", waist: 90, inseam: 82 },
            { size: "XL", waist: 95, inseam: 82 },
            { size: "XXL", waist: 100, inseam: 82 },
        ],
        []
    );

    const toInches = (cm) => Number((cm / 2.54).toFixed(1));

    const rows = useMemo(() => {
        if (unit === "CM") return rowsCm;
        return rowsCm.map((r) => ({
            ...r,
            waist: toInches(r.waist),
            inseam: toInches(r.inseam),
        }));
    }, [unit, rowsCm]);

    // Focus + ESC + lock scroll
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        closeBtnRef.current?.focus?.();

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();

            // mini focus-trap (simple)
            if (e.key === "Tab") {
                const focusables = panelRef.current?.querySelectorAll(
                    'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusables || focusables.length === 0) return;

                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="sg-overlay" role="presentation" onMouseDown={onClose}>
            <aside
                className="sg-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Guide des tailles"
                ref={panelRef}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                    width: "min(680px, 92vw)", // ✅ drawer plus large
                    maxWidth: "92vw",
                    height: "100vh",
                    overflowY: "auto",
                }}
            >
                {/* ✅ Conteneur interne pour centrer et ajouter des marges comme Gymshark */}
                <div
                    className="sg-inner"
                    style={{
                        height: "100%",
                        padding: "40px 48px", // ✅ espace aux bords
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center", // ✅ tout centré
                        gap: "22px",
                    }}
                >
                    {/* Header centré avec bouton close à droite */}
                    <div
                        className="sg-head"
                        style={{
                            width: "100%",
                            maxWidth: 560,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingTop: 6,
                        }}
                    >
                        <h2
                            className="sg-title"
                            style={{
                                margin: 0,
                                letterSpacing: "0.08em",
                                fontWeight: 800,
                                fontSize: 18,
                                textAlign: "center",
                            }}
                        >
                            GUIDE DES TAILLES
                        </h2>

                        <button
                            ref={closeBtnRef}
                            className="sg-close"
                            type="button"
                            onClick={onClose}
                            aria-label="Fermer"
                            title="Fermer"
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                border: "none",
                                background: "transparent",
                                fontSize: 20,
                                cursor: "pointer",
                                padding: 8,
                                lineHeight: 1,
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <h3
                        className="sg-subtitle"
                        style={{
                            margin: 0,
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            fontSize: 14,
                            textAlign: "center",
                        }}
                    >
                        TROUVEZ VOTRE TAILLE
                    </h3>

                    <div
                        className="sg-toggle"
                        role="tablist"
                        aria-label="Unité"
                        style={{
                            display: "inline-flex",
                            gap: 0,
                            background: "#eee",
                            borderRadius: 999,
                            padding: 3,
                        }}
                    >
                        <button
                            type="button"
                            className={`sg-toggle-btn ${unit === "IN" ? "is-active" : ""}`}
                            onClick={() => setUnit("IN")}
                            role="tab"
                            aria-selected={unit === "IN"}
                            style={{
                                border: "none",
                                cursor: "pointer",
                                padding: "8px 18px",
                                borderRadius: 999,
                                fontWeight: 800,
                                letterSpacing: "0.06em",
                                background: unit === "IN" ? "#333" : "transparent",
                                color: unit === "IN" ? "#fff" : "#111",
                            }}
                        >
                            IN
                        </button>
                        <button
                            type="button"
                            className={`sg-toggle-btn ${unit === "CM" ? "is-active" : ""}`}
                            onClick={() => setUnit("CM")}
                            role="tab"
                            aria-selected={unit === "CM"}
                            style={{
                                border: "none",
                                cursor: "pointer",
                                padding: "8px 18px",
                                borderRadius: 999,
                                fontWeight: 800,
                                letterSpacing: "0.06em",
                                background: unit === "CM" ? "#333" : "transparent",
                                color: unit === "CM" ? "#fff" : "#111",
                            }}
                        >
                            CM
                        </button>
                    </div>

                    <div
                        className="sg-table-wrap"
                        style={{
                            width: "100%",
                            maxWidth: 560, // ✅ la table ne colle pas aux bords
                            marginTop: 8,
                        }}
                    >
                        <table
                            className="sg-table"
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 14,
                            }}
                        >
                            <thead>
                            <tr style={{ borderBottom: "1px solid #e9e9e9" }}>
                                <th style={{ textAlign: "left", padding: "14px 0", letterSpacing: "0.06em", fontSize: 12 }}>
                                    TAILLE
                                </th>
                                <th style={{ textAlign: "left", padding: "14px 0", letterSpacing: "0.06em", fontSize: 12 }}>
                                    TOUR DE TAILLE
                                </th>
                                <th style={{ textAlign: "left", padding: "14px 0", letterSpacing: "0.06em", fontSize: 12 }}>
                                    ENTREJAMBE
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((r) => (
                                <tr key={r.size} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "16px 0", fontWeight: 800 }}>{r.size}</td>
                                    <td style={{ padding: "16px 0" }}>{r.waist}</td>
                                    <td style={{ padding: "16px 0" }}>{r.inseam}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* petit spacer bas pour respirer */}
                    <div style={{ height: 10 }} />
                </div>
            </aside>
        </div>
    );
}
