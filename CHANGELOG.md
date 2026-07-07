# Changelog

Toutes les évolutions notables du frontend GauthierFitness sont documentées ici.

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/). Avant le tag `v1.0.0`, chaque entrée correspond à une branche de fonctionnalité `GF{n}` fusionnée dans `main` (convention de branchage du projet), plutôt qu'à un numéro de version sémantique.

## [Unreleased]
### Added
- Template GitHub Issue (`.github/ISSUE_TEMPLATE/bug_report.md`) pour structurer la consignation des anomalies.

## [GF30 — V1GF Last Checkup] - 2026-07-05
### Fixed
- Dernières vérifications et correctifs avant la V1 finale.

## [GF29 — Lighthouse] - 2026-07-05
### Changed
- Optimisations de performance et d'accessibilité suite aux audits Lighthouse (avant/après correctifs).

## [GF28 — V1GF Fixs (2)] - 2026-07-04
### Fixed
- Corrections diverses identifiées lors de la préparation de la V1 finale.

## [GF27 — Documentation V2] - 2026-07-02
### Changed
- Traduction en anglais des commentaires du code (aucune logique modifiée).

## [GF26 — Forgot Password] - 2026-07-01
### Added
- Pages "Mot de passe oublié" / "Réinitialisation" et méthodes associées dans le store d'authentification.

## [Fix v1 — placeholder image] - 2026-07-01
### Fixed
- Image placeholder produit et image de commande correctement servies en production.

## [GF25 — V1GF Fixs] - 2026-07-01
### Fixed
- Correctifs pré-V1 : liens du menu Header, redirection post-paiement, mémoire du formulaire de livraison en checkout.

## [GF15 — IA Generation] - 2026-06-28
### Added
- Génération d'images par IA branchée dans les configurateurs 2D et 3D.

## [GF24 — Sentry] - 2026-06-26
### Added
- Intégration Sentry frontend (capture des erreurs JS, performance, source maps).

## [GF23 — Tests Strategy] - 2026-06-25
### Added
- Stratégie de tests consolidée (suite Jest).

## [GF21 — Swagger Doc] - 2026-06-18
### Changed
- Ajustements liés à la documentation API.

## [GF20 — Shipments & Returns] - 2026-06-16
### Added
- Interfaces de livraison et retours de commande.

## [GF19 — Help Service] - 2026-06-16
### Added
- Service d'aide / contact.

## [GF18 — Juridic] - 2026-06-15
### Added
- Pages légales (mentions légales, CGV).

## [GF17 — Build Pipeline V2] - 2026-05-27
### Changed
- Amélioration du pipeline CI/CD frontend.

## [GF16 — Build Pipeline V0/V1] - 2026-02-19 / 2026-05-11
### Added
- Mise en place du pipeline d'intégration et de déploiement continu (ESLint, build Vite, image Docker).

## [GF14 — Panel Admin] - 2026-05-11
### Added
- Interface back-office admin (produits, stock, commandes, dashboard).

## [GF13 — Configuration 3D Produit V3] - 2026-05-03
## [GF12 — Configuration 3D Produit V2] - 2026-04-19
## [GF11 — Configuration 3D Produit V1] - 2026-04-17
### Added
- Configurateur de produit 3D (Three.js), versions successives.

## [GF10 — Configuration Produit V3] - 2026-04-16
## [GF9 — Configuration Produit V2] - 2026-04-11
## [GF8 — Configuration Produit V1] - 2026-04-07
### Added
- Configurateur de produit 2D (Konva), versions successives.

## [GF7 — App Stability] - 2026-03-25
### Fixed
- Corrections de stabilité applicative.

## [GF6 — Orders Details] - 2026-02-15
### Added
- Détail des commandes.

## [GF5 — Orders Checkout] - 2026-02-03
### Added
- Tunnel de commande et paiement Stripe.

## [GF4 — Users Authentification] - 2026-02-01
### Added
- Authentification utilisateur.

## [GF3 — Product Cart] - 2026-01-22
### Added
- Panier produit.

## [GF2 — Product Details] - 2026-01-18
### Added
- Fiche produit détaillée.

## [GF1 — Product Catalog] - 2026-01-18
### Added
- Catalogue produits initial.
