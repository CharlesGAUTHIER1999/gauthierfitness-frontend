import { Link } from "react-router-dom";

export default function MegaMenu({ type }) {
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
                    <Link to="/products?gender=femmes">Tous les produits</Link>
                    <Link to="/products?gender=femmes&category=leggings">Leggings</Link>
                    <Link to="/products?gender=femmes&category=jogging">Jogging</Link>
                    <Link to="/products?gender=femmes&category=sweats">Sweats</Link>
                    <Link to="/products?gender=femmes&category=vestes">Vestes</Link>
                    <Link to="/products?gender=femmes&category=shorts">Shorts</Link>
                    <Link to="/products?gender=femmes&category=brassieres">Brassières</Link>
                    <Link to="/products?gender=femmes&category=tshirts">T-shirts</Link>
                    <Link to="/products?gender=femmes&category=accessoires">Accessoires</Link>
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
                    <Link to="/products?gender=hommes">Tous les produits</Link>
                    <Link to="/products?gender=hommes&category=accessoires">Accessoires</Link>
                    <Link to="/products?gender=hommes&category=sweats">Sweats</Link>
                    <Link to="/products?gender=hommes&category=vestes">Vestes</Link>
                    <Link to="/products?gender=hommes&category=pantalons">Pantalons</Link>
                    <Link to="/products?gender=hommes&category=shorts">Shorts</Link>
                    <Link to="/products?gender=hommes&category=tshirts">T-shirts</Link>
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
                    <h4>Protéines</h4>
                    <Link to="/products?gender=nutrition&category=proteines-poudre">Protéines en poudre</Link>
                    <Link to="/products?gender=nutrition&category=isolats">Isolats</Link>
                    <Link to="/products?gender=nutrition&category=hydrolysees">Hydrolysées</Link>
                    <Link to="/products?gender=nutrition&category=barres">Barres protéinées</Link>
                </div>

                <div className="mega-column">
                    <h4>Performance</h4>
                    <Link to="/products?gender=nutrition&category=masse">Prise de masse</Link>
                    <Link to="/products?gender=nutrition&category=creatine">Créatine</Link>
                    <Link to="/products?gender=nutrition&category=preworkout">Pre-workout</Link>
                    <Link to="/products?gender=nutrition&category=boissons">Boissons énergétiques</Link>
                </div>
            </div>
        );
    }

    if (type === "equipements") {
        return (
            <div className="mega-menu">
                <div className="mega-column">
                    <h4>Équipements</h4>
                    <Link to="/products?gender=equipements&category=barres">Barres & disques</Link>
                    <Link to="/products?gender=equipements&category=musculation">Matériel de musculation</Link>
                    <Link to="/products?gender=equipements&category=rigs">Rigs & racks</Link>
                    <Link to="/products?gender=equipements&category=prepa">Préparation physique</Link>
                    <Link to="/products?gender=equipements&category=calisthenie">Calisthénie & gymnastique</Link>
                    <Link to="/products?gender=equipements&category=bandes">Bandes & sangles</Link>
                    <Link to="/products?gender=equipements&category=mobilite">Mobilité</Link>
                </div>
            </div>
        );
    }

    return null;
}