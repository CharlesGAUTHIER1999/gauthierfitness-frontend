import {createRoot} from "react-dom/client";
import * as Sentry from "@sentry/react";
import "@fontsource/bebas-neue/400.css";
import "@fontsource/manrope/index.css";
import "./index.css";
import App from "./App.jsx";
import {CartProvider} from "./context/CartContext.jsx";

// Sentry monitoring
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        sendDefaultPii: false,
        tracesSampleRate: 0.2,
        integrations: [Sentry.browserTracingIntegration()],
    });
}

createRoot(document.getElementById("root")).render(<CartProvider>
    <App/>
</CartProvider>);
