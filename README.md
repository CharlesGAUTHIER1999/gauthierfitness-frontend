# GauthierFitness - Frontend

> React SPA for the GauthierFitness store: catalog, product page, 3D customization editor, Stripe checkout flow,
> and admin back-office (products, orders, stock).

Repo: `CharlesGAUTHIER1999/gauthierfitness-frontend` &nbsp; &nbsp; 🌐 Production: <https://gauthierfitness.fr>

> Cross-project documentation (architecture, deployment, user manual, upgrades): [meta-repo
`gauthierfitness/docs`](https://github.com/CharlesGAUTHIER1999/gauthierfitness/tree/main/docs)

---

## Stack

| Layer        | Technology                                                  |
|--------------|-------------------------------------------------------------|
| Framework    | React 19                                                    |
| Build        | Vite 7 (ESM, HMR)                                           |
| Routing      | React-router-dom 7                                          |
| Global state | React Context (auth, cart)                                  |
| HTTP         | Axios (auth interceptors + 401 handling)                    |
| 3D editor    | Three.js + `@react-three/fiber` + `drei`                    |
| Payment      | `@stripe/react-stripe-js` + Stripe.js                       |
| Style        | CSS modules + global files                                  |
| Lint         | ESLint 9 (flat config)                                      |
| CI/CD        | GitHub Actions → GHCR image (nginx + dist) → infra dispatch |

---

## Local setup

```bash
cp .env.example .env.local
# → fill in VITE_STRIPE_PUBLIC_KEY with a Stripe pk_test_… key
npm install
npm run dev
```

Frontend served at `http://localhost:5173`. The Laravel backend must be running in parallel on `http://localhost:8000` -
the Vite proxy redirects `/api/*` and `/storage/*` to that port (see [`vite.config.js`](vite.config.js)).

### Environment variables

| Var                      | Use                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------|
| `VITE_API_URL`           | Leave **empty** in dev (Vite proxy). In production: `https://api.gauthierfitness.fr/api` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key (`pk_test_…` in dev, `pk_live_…` in production)                        |
| `VITE_SENTRY_DSN`        | Sentry DSN (frontend error monitoring). Empty = monitoring disabled (local/CI)           |

In production, the `VITE_*` variables are injected at `docker build` time on the infra side (see [
`Dockerfile`](Dockerfile)) - they're therefore baked into the bundle.

---

## Code structure

```
src/
├── api/                  Axios instance + interceptors (token, 401)
│   ├── axios.js
│   └── adminApi.js
├── components/           Reusable UI components
│   ├── layout/           Header.jsx · Footer.jsx · MegaMenu.jsx · StaticPage.jsx
│   ├── cart/             CartDrawer.jsx · CheckoutPayment.jsx
│   └── product/          ProductCard.jsx · SizeGuideDrawer.jsx
├── context/              React providers (Cart, etc.)
├── features/             Code organized by functional domain
│   └── customization/    3D configurator, canvas, preview
├── layouts/               AppLayout, AdminLayout
├── pages/                 One page = one route
│   ├── Home, Products, ProductDetail, ProductCustomizePage
│   ├── CartPage, CheckoutPage, PaymentSuccess, PaymentCancel
│   ├── Login, Register, AccountPage, OrdersPage, OrderDetailsPage
│   ├── AddressesPage
│   ├── admin/            Back-office (Dashboard, Products, Orders, Stock)
│   └── static/           Legal pages (T&Cs, notices, etc.)
├── routes/               Guards: ProtectedRoute, AdminRoute
├── services/             API calls (productService, …)
├── store/                Auth React provider (auth.jsx)
├── utils/                Helpers
├── App.jsx               Main routes + providers
└── main.jsx              Vite entry point
```

---

## Conventions

- **Internal navigation**: always `<Link>` / `<NavLink>` from `react-router-dom`, never `<a href>` (which would cause a
  full page reload). `<a href>` reserved for external links (social media in the Footer).
- **Auth**: Sanctum JWT token stored in `localStorage`. The axios interceptor attaches it to every request. On 401, the
  token is purged automatically.
- **State**: React Context for shared state (auth, cart) and for values local to a subtree. No Redux or external
  state manager.
- **Protected routes**: `<ProtectedRoute>` (auth required) and `<AdminRoute>` (auth + admin role) components in
  `src/routes/`.
- **Customization**: the design session is created on the backend (`POST /api/customization/sessions`) and linked to a
  cart line. The frontend doesn't store the config locally after it's added to the cart.

---

## Tests & quality

```bash
npm run lint           # ESLint flat config (eslint.config.js)
npm test                # Jest unit tests (src/**/*.test.jsx, tests/smoke.test.js)
npm run test:coverage  # Same, with a coverage report
npm run build          # Verifies the production build succeeds (dist/)
npm run preview        # Serves dist/ locally to validate the bundle
```

Jest unit tests cover critical components/pages/context (auth, cart, protected routes). Cypress E2E tests are
managed from the **infra** repo (`infra/e2e/`) and target the deployed staging environment.

CI: `ESLint` → `Jest` → `build Vite` → `build GHCR image` → `dispatch infra`. See [
`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

---

## Production build

```bash
npm run build          # Generates dist/ (static assets)
```

In production, `dist/` is served by an Nginx container (Docker image generated by CI, see [`Dockerfile`](Dockerfile)).
The
`VITE_*` variables are passed as `--build-arg` when the image is built.

---

## Branching convention

- `feature`: `GF{n}-{ShortName}` (e.g. `GF21-SwaggerDoc`, `GF22-Documentation`)
- `develop`: automatic push → image `ghcr.io/.../gauthierfitness-frontend:develop` → infra deploys staging
- `main`: push → `:latest` image + SHA tag → manual production trigger

---

## Useful links

- [User manual (customer + admin journeys)](https://github.com/CharlesGAUTHIER1999/gauthierfitness/blob/main/docs/03-user-guide.md)
- [Detailed architecture](https://github.com/CharlesGAUTHIER1999/gauthierfitness/blob/main/docs/01-architecture.md)
- [REST API — Swagger](https://github.com/CharlesGAUTHIER1999/gauthierfitness/blob/main/docs/05-api.md)
- [Backend repo](https://github.com/CharlesGAUTHIER1999/gauthierfitness-backend)
- [Infra repo](https://github.com/CharlesGAUTHIER1999/gauthierfitness-infra)
