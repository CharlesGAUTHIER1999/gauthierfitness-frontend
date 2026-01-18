import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-top">
                    <div className="footer-column">
                        <div className="footer-logo">GAUTHIER FITNESS</div>

                        <p className="footer-subtitle">
                            Suis-nous sur les réseaux sociaux
                        </p>

                        <div className="footer-socials">
                            <a
                                href="https://www.instagram.com/charlesgauthier_99/"
                                aria-label="Instagram"
                                target="_blank"
                                rel="noreferrer"
                            >
                                📷
                            </a>
                            <a
                                href="https://www.facebook.com/CharlesGauthier1711/"
                                aria-label="Facebook"
                                target="_blank"
                                rel="noreferrer"
                            >
                                📘
                            </a>
                            <a
                                href="https://www.linkedin.com/in/charlesgauthier999/"
                                aria-label="LinkedIn"
                                target="_blank"
                                rel="noreferrer"
                            >
                                💼
                            </a>
                        </div>
                    </div>

                    {/* Styles */}
                    <div className="footer-column">
                        <h4>PARCOURS NOS STYLES</h4>
                        <ul>
                            <li>
                                <Link to="/products?gender=femmes">
                                    Leggings femmes
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?gender=femmes">
                                    Hauts femmes
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?gender=hommes">
                                    Pantalons hommes
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?gender=hommes">
                                    Vestes sport
                                </Link>
                            </li>
                            <li>
                                <Link to="/products">Accessoires</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Livraison */}
                    <div className="footer-column">
                        <h4>LIVRAISON &amp; RETOURS</h4>
                        <ul>
                            <li>
                                <Link to="/returns">Portail des retours</Link>
                            </li>
                            <li>
                                <Link to="/shipping">
                                    Livraison &amp; frais de port
                                </Link>
                            </li>
                            <li>
                                <Link to="/refunds">
                                    Retours &amp; remboursements
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="footer-column">
                        <h4>SERVICES</h4>
                        <ul>
                            <li>
                                <Link to="/contact">Contact</Link>
                            </li>
                            <li>
                                <Link to="/account">Mon compte</Link>
                            </li>
                            <li>
                                <Link to="/help">Centre d’aide</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Juridique */}
                    <div className="footer-column">
                        <h4>JURIDIQUE</h4>
                        <ul>
                            <li>
                                <Link to="/cgv">CGV</Link>
                            </li>
                            <li>
                                <Link to="/privacy">
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal">Mentions légales</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} Gauthier Fitness</p>

                    <div
                        className="footer-payments"
                        aria-label="Moyens de paiement"
                    >
                        <img
                            src="/payments/google-pay.svg"
                            alt="Google Pay"
                            loading="lazy"
                        />
                        <img
                            src="/payments/cb.svg"
                            alt="Carte Bancaire"
                            loading="lazy"
                        />
                        <img
                            src="/payments/visa.svg"
                            alt="Visa"
                            loading="lazy"
                        />
                        <img
                            src="/payments/apple-pay.svg"
                            alt="Apple Pay"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}