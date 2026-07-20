import axios from "axios";

// Fallback to /api when VITE_API_URL is not set
const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "/api";

const api = axios.create({
    baseURL, headers: {Accept: "application/json"}, timeout: 15000,
});

const GUEST_CART_TOKEN_KEY = "guest_cart_token";

// Returns guest cart token
export function peekGuestCartToken() {
    return localStorage.getItem(GUEST_CART_TOKEN_KEY);
}

function randomId() {
    if (typeof crypto?.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// Returns guest cart token
export function getGuestCartToken() {
    let token = localStorage.getItem(GUEST_CART_TOKEN_KEY);
    if (!token) {
        token = randomId();
        localStorage.setItem(GUEST_CART_TOKEN_KEY, token);
    }
    return token;
}

// Drops guest cart token
export function clearGuestCartToken() {
    localStorage.removeItem(GUEST_CART_TOKEN_KEY);
}

// Attaches Bearer token when logged in
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

// Clears stored token
api.interceptors.response.use((res) => res, (error) => {
    if (error?.response?.status === 401) {
        localStorage.removeItem("token");
    }
    return Promise.reject(error);
});

export default api;