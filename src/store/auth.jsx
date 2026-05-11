import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    const persistToken = (t) => {
        if (t) localStorage.setItem(TOKEN_KEY, t);
        else localStorage.removeItem(TOKEN_KEY);
    };

    const persistUser = (u) => {
        if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
        else localStorage.removeItem(USER_KEY);
    };

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            if (!storedToken) {
                if (!mounted) return;
                setToken(null);
                setUser(null);
                setLoading(false);
                return;
            }

            // sync state depuis storage
            if (mounted && storedToken !== token) setToken(storedToken);

            try {
                // /me doit valider le token et renvoyer user
                const res = await api.get("/me");
                if (!mounted) return;

                setUser(res.data);
                persistUser(res.data);
            } catch (e) {
                if (!mounted) return;

                const status = e?.response?.status;

                // ✅ Si 401 => token invalide => on nettoie tout
                if (status === 401) {
                    persistToken(null);
                    persistUser(null);
                    setToken(null);
                    setUser(null);
                } else {
                    // ✅ Si 500/CORS/Network => backend KO => on GARDE le token + user cache
                    // Donc tu restes "connecté" visuellement même si /me tombe.
                    console.warn("BOOTSTRAP /me failed (kept token & cached user):", status, e?.message);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        bootstrap();

        // ✅ FIX TS : cleanup doit retourner void (pas boolean)
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionnel : une seule exécution au mount

    const login = async (email, password) => {
        const res = await api.post("/login", {
            email: email.trim().toLowerCase(),
            password,
        });

        persistToken(res.data.token);
        setToken(res.data.token);

        setUser(res.data.user);
        persistUser(res.data.user);

        return res.data;
    };

    const register = async (form) => {
        const res = await api.post("/register", {
            ...form,
            email: form.email.trim().toLowerCase(),
        });

        persistToken(res.data.token);
        setToken(res.data.token);

        setUser(res.data.user);
        persistUser(res.data.user);

        return res.data;
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (e) {
            // backend peut planter / CORS, mais on force la déconnexion front
            console.warn("Logout API failed (ignored):", e?.response?.status, e?.message);
        } finally {
            persistToken(null);
            persistUser(null);
            setToken(null);
            setUser(null);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated: !!token,
            login,
            register,
            logout,
        }),
        [user, token, loading] // login/logout/register sont stables (closures sur setters)
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
