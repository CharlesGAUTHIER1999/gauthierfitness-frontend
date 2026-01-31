import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}
