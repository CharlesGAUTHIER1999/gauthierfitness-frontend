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

// Attaches the Bearer token from localStorage to every outgoing request.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
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