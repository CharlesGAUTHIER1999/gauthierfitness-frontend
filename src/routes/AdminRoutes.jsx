import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function AdminRoute({ children }) {
    const { user, token, loading } = useAuth();
    if (loading) return null;
    if (!token) return <Navigate to="/login" replace />;
    if (!user?.is_admin) return <Navigate to="/" replace />;
    return children;
}