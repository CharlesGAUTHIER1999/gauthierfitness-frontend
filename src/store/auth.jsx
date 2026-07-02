import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Stores or clears the auth token in localStorage.
function persistToken(t) {
    if (t) {
        localStorage.setItem(TOKEN_KEY, t);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

// Stores or clears the cached user object in localStorage.
function persistUser(u) {
    if (u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

// Provides auth state (token/user) and actions (login, register, logout, password reset) to the app.
export function AuthProvider({children}) {
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

            // Sync state from storage.
            if (mounted) setToken(storedToken);

            try {
                // /me must validate the token and return the user.
                const res = await api.get("/me");
                if (!mounted) return;
                setUser(res.data);
                persistUser(res.data);
            } catch (e) {
                if (!mounted) return;

                const status = e?.response?.status;

                // If 401 => token invalid => clear everything.
                if (status === 401) {
                    persistToken(null);
                    persistUser(null);
                    setToken(null);
                    setUser(null);
                } else {
                    // If 500/CORS/Network => backend is down => KEEP the token + cached user.
                    console.warn(
                        "BOOTSTRAP /me failed (kept token & cached user):",
                        status,
                        e?.message
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void bootstrap();

        return () => {
            mounted = false;
        };
    }, []);

    // Logs in with email/password and persists the returned token + user
    const login = useCallback(async (email, password) => {
        const res = await api.post("/login", {
            email: email.trim().toLowerCase(),
            password,
        });

        persistToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        persistUser(res.data.user);
        return res.data;
    }, []);

    // Registers a new account and persists the returned token + user
    const register = useCallback(async (form) => {
        const res = await api.post("/register", {
            ...form,
            email: form.email.trim().toLowerCase(),
        });

        persistToken(res.data.token);
        setToken(res.data.token);

        setUser(res.data.user);
        persistUser(res.data.user);

        return res.data;
    }, []);

    // Requests a password reset email for the given address
    const forgotPassword = useCallback(async (email) => {
        const res = await api.post("/forgot-password", {
            email: email.trim().toLowerCase(),
        });

        return res.data;
    }, []);

    // Submits a new password using the reset token received by email
    const resetPassword = useCallback(async ({email, token, password, password_confirmation}) => {
        const res = await api.post("/reset-password", {
            email: email.trim().toLowerCase(),
            token,
            password,
            password_confirmation,
        });

        return res.data;
    }, []);

    // Logs out : calls the API (best effort) then always clears local token/user state.
    const logout = useCallback(async () => {
        try {
            await api.post("/logout");
        } catch (e) {
            console.warn("Logout API failed (ignored):", e?.response?.status, e?.message);
        } finally {
            persistToken(null);
            persistUser(null);
            setToken(null);
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated: !!token,
            login,
            register,
            logout,
            forgotPassword,
            resetPassword,
        }),
        [user, token, loading, login, register, logout, forgotPassword, resetPassword]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to access the auth context
export function useAuth() {
    return useContext(AuthContext);
}