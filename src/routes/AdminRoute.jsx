import {Navigate} from "react-router-dom";
import {useAuth} from "../store/auth";

// Guards admin routes
export default function AdminRoute({children}) {
    const {user, token, loading} = useAuth();
    if (loading) return null;
    if (!token) return <Navigate to="/login" replace/>;
    if (!user?.is_admin) {
        return (
            <div style={{maxWidth: 480, margin: "80px auto", textAlign: "center"}}>
                <h1>Accès refusé</h1>
                <p>Cette page est réservée aux administrateurs.</p>
            </div>
        );
    }
    return children;
}