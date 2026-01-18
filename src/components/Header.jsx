import { Link } from "react-router-dom";
import { useState } from "react";
import MegaMenu from "./MegaMenu";

const NAV_ITEMS = [
    { key: "femmes", label: "Femmes" },
    { key: "hommes", label: "Hommes" },
    { key: "nutrition", label: "Nutrition" },
    { key: "equipements", label: "Équipements" },
];

export default function Header() {
    const [openMenu, setOpenMenu] = useState(null);

    return (
        <header className="header">
            <div className="header-inner">

                {/* Logo */}
                <Link to="/" className="logo">
                    {/* plus tard <img src="/logo.svg" /> */}
                    GAUTHIER Fitness
                </Link>

                {/* Navigation */}
                <nav className="nav">
                    {NAV_ITEMS.map(({ key, label }) => (
                        <div
                            key={key}
                            className="nav-item"
                            onMouseEnter={() => setOpenMenu(key)}
                            onMouseLeave={() => setOpenMenu(null)}
                        >
                            {label}
                            {openMenu === key && <MegaMenu type={key} />}
                        </div>
                    ))}

                    <Link to="/about" className="nav-item">
                        À propos
                    </Link>
                </nav>

                {/* Actions */}
                <div className="actions">
                    <input
                        type="text"
                        placeholder="Rechercher un produit"
                        className="search"
                    />

                    <Link to="/login" className="icon">👤</Link>
                    <Link to="/cart" className="icon">🛒</Link>
                </div>
            </div>
        </header>
    );
}