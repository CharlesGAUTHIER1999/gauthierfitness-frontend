import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";

// Monitoring Sentry : initialisé uniquement si un DSN est fourni
// (désactivé en local / CI où VITE_SENTRY_DSN est vide).
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        sendDefaultPii: false,
        tracesSampleRate: 0.2,
        integrations: [Sentry.browserTracingIntegration()],
    });
}

createRoot(document.getElementById("root")).render(
    <CartProvider>
        <App />
    </CartProvider>
);
