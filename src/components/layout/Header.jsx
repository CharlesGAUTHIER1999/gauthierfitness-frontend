import {Link, useNavigate} from "react-router-dom";
import {useMemo, useState} from "react";
import {FiUser, FiShoppingCart, FiGrid} from "react-icons/fi";
import MegaMenu from "./MegaMenu";
import {useCart} from "../../context/CartContext.jsx";
import {useAuth} from "../../store/auth";

const NAV_ITEMS = [{key: "femmes", label: "Femmes"}, {key: "hommes", label: "Hommes"}, {
    key: "nutrition", label: "Nutrition"
}, {key: "equipments", label: "Équipements"},];

// Header
export default function Header() {
    const [openMenu, setOpenMenu] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const {count, openCart} = useCart();
    const {isAuthenticated, user} = useAuth();
    const profileHref = isAuthenticated ? "/account" : "/login";

    const initials = useMemo(() => {
        const f = user?.firstname?.trim()?.[0];
        const l = user?.lastname?.trim()?.[0];
        return f && l ? `${f}${l}`.toUpperCase() : null;
    }, [user]);

    // Closes mega menu
    function closeMenu() {
        setOpenMenu(null);
    }

    // Navigates to product listing
    function submitSearch(e) {
        e.preventDefault();
        const term = searchQuery.trim();
        if (!term) return;
        closeMenu();
        navigate(`/products?search=${encodeURIComponent(term)}`);
    }

    return (<header className="header">
        <div className="header-inner">
            <Link to="/" className="logo" onClick={closeMenu}>
                <img className="logo-img" src="/logos/logo-gf.png" alt="GauthierFitness" width="198" height="71"/>
                <span>GAUTHIER Fitness</span>
            </Link>

            <nav className="nav">
                {NAV_ITEMS.map(({key, label}) => (<div
                    key={key}
                    className="nav-item"
                    onMouseEnter={() => setOpenMenu(key)}
                    onMouseLeave={() => setOpenMenu(null)}
                >
                    <Link
                        to={`/products?gender=${key}&per_page=20`}
                        className="nav-link"
                        onClick={closeMenu}
                    >
                        {label}
                    </Link>
                    {openMenu === key && <MegaMenu type={key}/>}
                </div>))}

                <Link to="/about" className="nav-item" onClick={closeMenu}>
                    À PROPOS DE NOUS
                </Link>
            </nav>

            <div className="actions">
                <form role="search" onSubmit={submitSearch}>
                    <input
                        type="search"
                        placeholder="Rechercher un produit"
                        aria-label="Rechercher un produit"
                        className="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {isAuthenticated && user?.is_admin && (<Link
                    to="/admin"
                    className="icon"
                    aria-label="Back-office"
                    title="Back-office"
                    onClick={closeMenu}
                >
                    <FiGrid/>
                </Link>)}

                <Link
                    to={profileHref}
                    className={`icon ${isAuthenticated && initials ? "icon-initials" : ""}`}
                    aria-label="Mon compte"
                    onClick={closeMenu}
                >
                    {isAuthenticated && initials ? initials : <FiUser/>}
                </Link>

                <button
                    type="button"
                    className="cart-icon-btn"
                    onClick={() => {
                        closeMenu();
                        openCart();
                    }}
                    aria-label="Ouvrir le panier"
                >
                    <FiShoppingCart/>{count > 0 && <span className="cart-badge">{count}</span>}
                </button>
            </div>
        </div>
    </header>);
}