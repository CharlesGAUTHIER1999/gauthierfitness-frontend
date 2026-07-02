import {Link} from "react-router-dom";

// Dropdown mega menu with category links, rendered based on the nav item type (femmes/hommes/nutrition/equipments)
export default function MegaMenu({type}) {
    if (type === "femmes") {
        return (
            <div className="mega-menu">
                <div className="mega-column">
                    <h4>Découvrir</h4>
                    <Link to="/products?gender=femmes&tag=bestseller">Bestsellers</Link>
                    <Link to="/products?gender=femmes&tag=new">Nouveautés</Link>
                </div>

                <div className="mega-column">
                    <h4>Catégories</h4>
                    <Link to="/products?gender=femmes&per_page=20">Tous les produits</Link>
                    <Link to="/products?gender=femmes&category=femmes-sweats">Sweats</Link>
                    <Link to="/products?gender=femmes&category=femmes-vestes">Vestes</Link>
                    <Link to="/products?gender=femmes&category=femmes-pantalons">Pantalons</Link>
                    <Link to="/products?gender=femmes&category=femmes-tshirts">T-shirts</Link>
                </div>
            </div>
        );
    }

    if (type === "hommes") {
        return (
            <div className="mega-menu">
                <div className="mega-column">
                    <h4>Découvrir</h4>
                    <Link to="/products?gender=hommes&tag=bestseller">Bestsellers</Link>
                    <Link to="/products?gender=hommes&tag=new">Nouveautés</Link>
                </div>

                <div className="mega-column">
                    <h4>Catégories</h4>
                    <Link to="/products?gender=hommes&per_page=20">Tous les produits</Link>
                    <Link to="/products?gender=hommes&category=hommes-sweats">Sweats</Link>
                    <Link to="/products?gender=hommes&category=hommes-vestes">Vestes</Link>
                    <Link to="/products?gender=hommes&category=hommes-pantalons">Pantalons</Link>
                    <Link to="/products?gender=hommes&category=hommes-tshirts">T-shirts</Link>
                </div>
            </div>
        );
    }

    if (type === "nutrition") {
        return (
            <div className="mega-menu">
                <div className="mega-column">
                    <h4>Découvrir</h4>
                    <Link to="/products?gender=nutrition&tag=bestseller">Bestsellers</Link>
                    <Link to="/products?gender=nutrition&tag=new">Nouveautés</Link>
                </div>

                <div className="mega-column">
                    <h4>Nutrition</h4>
                    <Link to="/products?gender=nutrition&per_page=20">Tous les produits</Link>
                    <Link to="/products?gender=nutrition&category=nutrition-proteines-poudre">Protéines en poudre</Link>
                    <Link to="/products?gender=nutrition&category=nutrition-isolats">Isolats</Link>
                    <Link to="/products?gender=nutrition&category=nutrition-barres">Barres protéinées</Link>
                    <Link to="/products?gender=nutrition&category=nutrition-creatine">Créatine</Link>
                    <Link to="/products?gender=nutrition&category=nutrition-boissons">Boissons</Link>
                </div>
            </div>
        );
    }

    if (type === "equipments") {
        return (
            <div className="mega-menu">
                <div className="mega-column">
                    <h4>Découvrir</h4>
                    <Link to="/products?gender=equipments&tag=bestseller">Bestsellers</Link>
                    <Link to="/products?gender=equipments&tag=new">Nouveautés</Link>
                </div>

                <div className="mega-column">
                    <h4>Équipements</h4>
                    <Link to="/products?gender=equipments&per_page=20">Tous les produits</Link>
                    <Link to="/products?gender=equipments&category=equipments-barres">Barres</Link>
                    <Link to="/products?gender=equipments&category=equipments-musculation">Musculation</Link>
                    <Link to="/products?gender=equipments&category=equipments-prepa">Préparation</Link>
                    <Link to="/products?gender=equipments&category=equipments-calisthenie">Calisthénie</Link>
                    <Link to="/products?gender=equipments&category=equipments-mobilite">Mobilité</Link>
                </div>
            </div>
        );
    }

    return null;
}
