import axios from "axios";

// Falls back to /api when VITE_API_URL is not set (e.g. local/CI).
const baseURL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "/api";

const api = axios.create({
    baseURL,
    headers: {Accept: "application/json"},
    timeout: 15000,
});

const GUEST_CART_TOKEN_KEY = "guest_cart_token";

// Returns the guest cart token if one exists, without generating a new one.
export function peekGuestCartToken() {
    return localStorage.getItem(GUEST_CART_TOKEN_KEY);
}

// Random identifier, preferring crypto.randomUUID (not always available, e.g. in
// older browsers or non-secure contexts) with a plain fallback — this token only
// scopes an anonymous cart, it isn't a security credential.
function randomId() {
    if (typeof crypto?.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// Returns the guest cart token, generating and persisting one on first use.
export function getGuestCartToken() {
    let token = localStorage.getItem(GUEST_CART_TOKEN_KEY);
    if (!token) {
        token = randomId();
        localStorage.setItem(GUEST_CART_TOKEN_KEY, token);
    }
    return token;
}

// Drops the guest cart token (its cart has been merged into an account).
export function clearGuestCartToken() {
    localStorage.removeItem(GUEST_CART_TOKEN_KEY);
}

// Attaches the Bearer token when logged in, otherwise a guest cart token.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers || {};
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        config.headers["X-Guest-Cart-Token"] = getGuestCartToken();
    }
    return config;
});

// Clears the stored token on 401 responses (invalid/expired session).
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export default api;