import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (!token) return;

        localStorage.setItem("token", token);

        api.get("/me")
            .then(res => setUser(res.data))
            .catch(() => logout());
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post("/login", { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (form) => {
        const res = await api.post("/register", form);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        api.post("/logout").finally(() => {
            setToken(null);
            setUser(null);
            localStorage.removeItem("token");
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}