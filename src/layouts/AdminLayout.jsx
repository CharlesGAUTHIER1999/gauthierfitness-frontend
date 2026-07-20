import {NavLink, Outlet, useNavigate} from "react-router-dom";
import {useAuth} from "../store/auth";

const NAV = [{to: "/admin", label: "Tableau de bord", end: true}, {
    to: "/admin/products", label: "Produits"
}, {to: "/admin/orders", label: "Commandes"}, {to: "/admin/stock", label: "Stocks"},];

// Admin panel shell
export default function AdminLayout() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    // Logs admin out and redirects to login page
    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (<div className="adm-shell">
        <aside className="adm-sidebar">
            <div className="adm-logo">GF Admin</div>

            <nav className="adm-nav">
                {NAV.map(({to, label, end}) => (<NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({isActive}) => `adm-nav-link ${isActive ? "is-active" : ""}`}
                >
                    {label}
                </NavLink>))}
            </nav>

            <div className="adm-sidebar-footer">
                <p className="adm-user-name">
                    {user?.firstname} {user?.lastname}
                </p>
                <a href="/" className="adm-store-link">
                    ← Boutique
                </a>
                <button
                    type="button"
                    className="adm-logout-btn"
                    onClick={handleLogout}
                >
                    Déconnexion
                </button>
            </div>
        </aside>

        <main className="adm-main">
            <Outlet/>
        </main>
    </div>);
}
