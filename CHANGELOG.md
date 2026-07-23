# Changelog

All notable changes to the GauthierFitness frontend are documented here.

Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Before the `v1.0.0` tag, each entry
corresponds to a `GF{n}` feature branch merged into `main` (the project's branching convention), rather than a semantic
version number.

## [v1.0.7] - 2026-07-23

### Added

- Backfilled missing changelog entries for v1.0.5 and v1.0.6.

## [v1.0.6] - 2026-07-23

### Fixed

- `CartContext.jsx` now exposes an `isLoading` flag (defaults `true`, cleared once the first `/cart` fetch
  resolves). `CartDrawer.jsx`, `CartPage.jsx`, and `CheckoutPage.jsx` gate their "empty cart" message on this
  flag, fixing a hard-reload flash where a non-empty cart briefly rendered as empty before the initial fetch
  completed.
- `CheckoutPage.jsx`: the `/payment/intent` request now uses an explicit 30s timeout (up from the global 15s
  axios default), since creating a Stripe PaymentIntent is a real external round trip.

## [v1.0.5] - 2026-07-22

Brings guest support to the 3D customizer and checkout, live shipping options, a Help Center, and several
3D-configurator stability fixes (GF33 to GF40).

### Added

- Guest customization: `/products/:slug/customize` no longer requires login. AI design generation still
  requires an account — `CustomizationPanel.jsx` now shows a "Connecte-toi pour générer un design par IA"
  prompt instead of hiding the feature.
- Guest checkout: `/checkout` no longer requires login, with a "Vous avez un compte ? Se connecter" link and
  the email now sent in the payload. "Finish configuration" was reworked into "Add to cart" (stays on the
  customizer instead of jumping straight to checkout).
- Shipping method selection: new `src/constants/shipping.js` mirrors the backend pricing (`standard`: 3-5j,
  free ≥70€, else 4.90€ / `express`: 24-48h, 9.90€ flat). Checkout now shows both options with live
  price/ETA instead of a hardcoded rate; cart preview estimates use the same constant.
- Help Center: full FAQ (Commandes, Livraison, Paiement, Personnalisation, Retours) replacing the placeholder
  page; the contact form gained a required "Motif" reason dropdown.

### Fixed

- 3D configurator: self-hosted Bebas Neue/Manrope fonts instead of the Google Fonts CDN.
- 3D configurator: recovers from WebGL context loss (detects `webglcontextlost`/`webglcontextrestored` and
  remounts the canvas), and proactively remounts if the tab was hidden more than 15 minutes.
- 3D configurator: canvas sized correctly after route transitions via a `ResizeObserver`, fixing cases where
  the renderer kept a stale default drawing-buffer size.
- 3D configurator: clones the cached GLB scene per mount so navigating back to the customizer doesn't mutate
  an already-pruned shared Three.js scene.
- Auth: login redirect correctly returns to the originally-requested page; later simplified so login always
  lands on home, with admins reaching the back-office via a dedicated header link instead of an automatic
  redirect.
- Checkout: navigating back from checkout to the 3D configurator while the item is still in the cart now
  resumes that exact customization and removes the stale cart line instead of leaving a duplicate.
- Header: admin users get a back-office link.

### Changed

- Visual refresh across most pages/components (CSS/markup polish, no functional changes).
- Updated minor/patch dependencies grouped by Dependabot (`globals`, `jest-environment-jsdom`, `babel-jest`,
  `actions/setup-node`) and fixed a `brace-expansion` ReDoS advisory (`npm audit fix`).
- Formatting/config cleanup (README, CI, ESLint) and admin-page refactors — no behavioral change to
  customer-facing logic.

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
