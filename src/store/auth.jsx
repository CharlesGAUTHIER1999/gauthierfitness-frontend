import {createContext, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import api, {clearGuestCartToken, peekGuestCartToken} from "../api/axios";
import {useCart} from "../context/CartContext";

const AuthContext = createContext(null);
const TOKEN_KEY = "token";
const USER_KEY = "user";

// Stores or clears auth token
function persistToken(t) {
    if (t) {
        localStorage.setItem(TOKEN_KEY, t);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

// Stores or clears cached user object
function persistUser(u) {
    if (u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

// Provides auth state + actions to the app
export function AuthProvider({children}) {
    const {refetchCart} = useCart();
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

            // Sync state from storage
            if (mounted) setToken(storedToken);

            try {
                const res = await api.get("/me");
                if (!mounted) return;
                setUser(res.data);
                persistUser(res.data);
            } catch (e) {
                if (!mounted) return;

                const status = e?.response?.status;

                // If 401 => token invalid
                if (status === 401) {
                    persistToken(null);
                    persistUser(null);
                    setToken(null);
                    setUser(null);
                } else {
                    // If 500/CORS/Network => backend down
                    console.warn("BOOTSTRAP /me failed (kept token & cached user):", status, e?.message);
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

    const login = useCallback(async (email, password) => {
        const res = await api.post("/login", {
            email: email.trim().toLowerCase(), password, guest_cart_token: peekGuestCartToken(),
        });

        persistToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        persistUser(res.data.user);
        clearGuestCartToken();
        void refetchCart();
        return res.data;
    }, [refetchCart]);

    // Registers a new account
    const register = useCallback(async (form) => {
        const res = await api.post("/register", {
            ...form, email: form.email.trim().toLowerCase(), guest_cart_token: peekGuestCartToken(),
        });

        persistToken(res.data.token);
        setToken(res.data.token);

        setUser(res.data.user);
        persistUser(res.data.user);
        clearGuestCartToken();
        void refetchCart();

        return res.data;
    }, [refetchCart]);

    // Requests a password reset email
    const forgotPassword = useCallback(async (email) => {
        const res = await api.post("/forgot-password", {
            email: email.trim().toLowerCase(),
        });

        return res.data;
    }, []);

    // Submits new password using the reset token
    const resetPassword = useCallback(async ({email, token, password, password_confirmation}) => {
        const res = await api.post("/reset-password", {
            email: email.trim().toLowerCase(), token, password, password_confirmation,
        });

        return res.data;
    }, []);

    // Updates logged-in user's contact/address details
    const updateProfile = useCallback(async (fields) => {
        const res = await api.patch("/me", fields);
        setUser(res.data);
        persistUser(res.data);
        return res.data;
    }, []);

    // Logs out
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
            void refetchCart();
        }
    }, [refetchCart]);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
    }), [user, token, loading, login, register, logout, forgotPassword, resetPassword, updateProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to access the auth context
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}