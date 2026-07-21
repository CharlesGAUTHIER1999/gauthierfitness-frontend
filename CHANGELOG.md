# Changelog

All notable changes to the GauthierFitness frontend are documented here.

Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Before the `v1.0.0` tag, each entry
corresponds to a `GF{n}` feature branch merged into `main` (the project's branching convention), rather than a semantic
version number.

## [v1.0.4] - 2026-07-13

### Changed

- Updated minor/patch npm dependencies grouped by Dependabot (10 packages) and the GitHub Actions used in CI/CD (7
  updates). Major upgrades (`@stripe/stripe-js`, `vite`, the Jest ecosystem) are deliberately deferred until after the
  defense, per the process described in Bloc 4 (C4.1.1).

## [v1.0.3] - 2026-07-13

### Fixed

- `auth.test.jsx`: `api.get` mock scoped by URL to prevent a stray `console.error` from `CartProvider` (a `/cart` call
  cascading-failing alongside the simulated `/me` failure needed for the test) from polluting the test output. No impact
  on the app's actual behavior.

## [v1.0.2] - 2026-07-12

### Changed

- Components reorganized into `components/layout/` (Header, Footer, MegaMenu, StaticPage), `components/cart/` (
  CartDrawer, CheckoutPayment), and `components/product/` (ProductCard, SizeGuideDrawer), instead of a flat
  `components/` folder.

## [v1.0.1] - 2026-07-10

### Fixed

- Self-hosted the 3D editor's HDR texture, removing the external raw.githack dependency (see Incident Report 8, CSP).
- Redirect after login to the originally requested page; removed a dead login link in checkout.

### Removed

- Unused SearchBar component.

## [v1.0.0] - 2026-07-08

First tagged release of the frontend. Brings together all features developed from GF0 to GF31: storefront,
2D/3D configurator, cart, Stripe checkout, authentication, admin back-office, AI design generation,
legal pages.

### Added

- GitHub Issue template (`.github/ISSUE_TEMPLATE/bug_report.md`) to structure bug reporting.
- Tests for the login page (`Login.test.jsx`).

### Changed

- Factored out logic shared by the 2D/3D configurators into a shared hook (`useCustomizationEditorBase`).
- Renamed `AdminRoutes`/`ProtectedRoutes` → `AdminRoute`/`ProtectedRoute` (naming consistency).
- Compressed the 3D model (`tshirt.glb`) and logo to reduce bundle size.

## [GF30 - V1GF Last Checkup] - 2026-07-05

### Fixed

- Final checks and fixes before the final V1.

## [GF29 - Lighthouse] - 2026-07-05

### Changed

- Performance and accessibility optimizations following Lighthouse audits (before/after fixes).

## [GF28 - V1GF Fixs (2)] - 2026-07-04

### Fixed

- Various fixes identified while preparing the final V1.

## [GF27 - Documentation V2] - 2026-07-02

### Changed

- Translated code comments to English (no logic changed).

## [GF26 - Forgot Password] - 2026-07-01

### Added

- "Forgot password" / "Reset password" pages and associated methods in the auth store.

## [Fix v1 - placeholder image] - 2026-07-01

### Fixed

- Product placeholder image and order image now correctly served in production.

## [GF25 - V1GF Fixs] - 2026-07-01

### Fixed

- Pre-V1 fixes: Header menu links, post-payment redirect, checkout shipping form memory.

## [GF15 - IA Generation] - 2026-06-28

### Added

- AI image generation wired into the 2D and 3D configurators.

## [GF24 - Sentry] - 2026-06-26

### Added

- Frontend Sentry integration (JS error capture, performance, source maps).

## [GF23 - Tests Strategy] - 2026-06-25

### Added

- Consolidated test strategy (Jest suite).

## [GF21 - Swagger Doc] - 2026-06-18

### Changed

- Adjustments related to the API documentation.

## [GF20 - Shipments & Returns] - 2026-06-16

### Added

- Order shipping and returns interfaces.

## [GF19 - Help Service] - 2026-06-16

### Added

- Help / contact service.

## [GF18 - Juridic] - 2026-06-15

### Added

- Legal pages (legal notices, T&Cs).

## [GF17 - Build Pipeline V2] - 2026-05-27

### Changed

- Improved the frontend CI/CD pipeline.

## [GF16 - Build Pipeline V0/V1] - 2026-02-19 / 2026-05-11

### Added

- Set up the continuous integration and deployment pipeline (ESLint, Vite build, Docker image).

## [GF14 - Panel Admin] - 2026-05-11

### Added

- Admin back-office interface (products, stock, orders, dashboard).

## [GF13 - Configuration 3D Produit V3] - 2026-05-03

## [GF12 - Configuration 3D Produit V2] - 2026-04-19

## [GF11 - Configuration 3D Produit V1] - 2026-04-17

### Added

- 3D product configurator (Three.js), successive versions.

## [GF10 - Configuration Produit V3] - 2026-04-16

## [GF9 - Configuration Produit V2] - 2026-04-11

## [GF8 - Configuration Produit V1] - 2026-04-07

### Added

- 2D product configurator (Konva), successive versions.

## [GF7 - App Stability] - 2026-03-25

### Fixed

- Application stability fixes.

## [GF6 - Orders Details] - 2026-02-15

### Added

- Order detail view.

## [GF5 - Orders Checkout] - 2026-02-03

### Added

- Order tunnel and Stripe payment.

## [GF4 - Users Authentification] - 2026-02-01

### Added

- User authentication.

## [GF3 - Product Cart] - 2026-01-22

### Added

- Product cart.

## [GF2 - Product Details] - 2026-01-18

### Added

- Detailed product page.

## [GF1 - Product Catalog] - 2026-01-18

### Added

- Initial product catalog.
