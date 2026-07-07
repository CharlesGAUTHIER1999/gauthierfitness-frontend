# GauthierFitness - Frontend

> SPA React de la boutique GauthierFitness : catalogue, fiche produit, éditeur de personnalisation 3D, parcours d'achat
> avec Stripe, et back-office admin (produits, commandes, stock).

Repo : `CharlesGAUTHIER1999/gauthierfitness-frontend` &nbsp; &nbsp; 🌐 Production : <https://gauthierfitness.fr>

> Documentation projet transverse (architecture, déploiement, manuel utilisateur, mise à jour) : [meta-repo
`gauthierfitness/docs`](https://github.com/CharlesGAUTHIER1999/gauthierfitness/tree/main/docs)

---

## Stack

| Couche       | Technologie                                                 |
|--------------|-------------------------------------------------------------|
| Framework    | React 19                                                    |
| Build        | Vite 7 (ESM, HMR)                                           |
| Routing      | React-router-dom 7                                          |
| State global | Context React (auth, cart)                                  |
| HTTP         | Axios (intercepteurs auth + 401 handling)                   |
| Éditeur 3D   | Three.js + `@react-three/fiber` + `drei`                    |
| Paiement     | `@stripe/react-stripe-js` + Stripe.js                       |
| Style        | CSS modules + fichiers globaux                              |
| Lint         | ESLint 9 (config flat)                                      |
| CI/CD        | GitHub Actions → image GHCR (nginx + dist) → dispatch infra |

---

## Démarrage local

```bash
cp .env.example .env.local
# → remplir VITE_STRIPE_PUBLIC_KEY avec une clé pk_test_… de Stripe
npm install
npm run dev
```

Frontend exposé sur `http://localhost:5173`. Le backend Laravel doit tourner en parallèle sur `http://localhost:8000` -
le proxy Vite redirige `/api/*` et `/storage/*` vers ce port (cf. [`vite.config.js`](vite.config.js)).

### Variables d'environnement

| Var                      | Usage                                                                                |
|--------------------------|--------------------------------------------------------------------------------------|
| `VITE_API_URL`           | Laisser **vide** en dev (proxy Vite). En prod : `https://api.gauthierfitness.fr/api` |
| `VITE_STRIPE_PUBLIC_KEY` | Clé publique Stripe (`pk_test_…` en dev, `pk_live_…` en prod)                        |
| `VITE_SENTRY_DSN`        | DSN Sentry (monitoring erreurs front). Vide = monitoring désactivé (local/CI)        |

En production, les variables `VITE_*` sont injectées au moment du `docker build` côté infra (cf. [
`Dockerfile`](Dockerfile)) - elles sont donc figées dans le bundle.

---

## Structure du code

```
src/
├── api/                  Instance axios + intercepteurs (token, 401)
│   ├── axios.js
│   └── adminApi.js
├── components/           Composants UI réutilisables
│   ├── Header.jsx · Footer.jsx · MegaMenu.jsx
│   ├── CartDrawer.jsx · CheckoutPayment.jsx
│   ├── ProductCard.jsx · SearchBar.jsx
│   ├── SizeGuideDrawer.jsx
│   └── StaticPage.jsx
├── context/              Providers React (Cart, etc.)
├── features/             Code par domaine fonctionnel
│   └── customization/    Configurateur 3D, canvas, preview
├── layouts/              AppLayout, AdminLayout
├── pages/                Une page = une route
│   ├── Home, Products, ProductDetail, ProductCustomizePage
│   ├── CartPage, CheckoutPage, PaymentSuccess, PaymentCancel
│   ├── Login, Register, AccountPage, OrdersPage, OrderDetailsPage
│   ├── AddressesPage, Dashboard
│   ├── admin/            Back-office (Dashboard, Products, Orders, Stock)
│   └── static/           Pages légales (CGV, mentions, etc.)
├── routes/               Guards : ProtectedRoute, AdminRoute
├── services/             Appels API (productService, …)
├── store/                Provider React de l'auth (auth.jsx)
├── utils/                Helpers
├── App.jsx               Routes principales + providers
└── main.jsx              Entrée Vite
```

---

## Conventions

- **Navigation interne** : toujours `<Link>` / `<NavLink>` de `react-router-dom`, jamais `<a href>` (qui causerait un
  full page reload). `<a href>` réservé aux liens externes (réseaux sociaux dans le Footer).
- **Auth** : token JWT Sanctum stocké dans `localStorage`. L'intercepteur axios l'attache à chaque requête. Sur 401, le
  token est purgé automatiquement.
- **State** : Context React pour l'état partagé (auth, cart) et pour les valeurs locales à un sous-arbre. Pas de
  Redux ni de state manager externe.
- **Routes protégées** : composants `<ProtectedRoute>` (auth requise) et `<AdminRoute>` (auth + rôle admin) dans
  `src/routes/`.
- **Customisation** : la session de design est créée côté backend (`POST /api/customization/sessions`) et liée à une
  ligne de panier. Le frontend ne stocke pas la config localement après l'ajout au panier.

---

## Tests & qualité

```bash
npm run lint           # ESLint flat config (eslint.config.js)
npm test                # Tests unitaires Jest (src/**/*.test.jsx, tests/smoke.test.js)
npm run test:coverage  # Idem avec rapport de couverture
npm run build          # Vérifie que la prod build passe (dist/)
npm run preview        # Sert dist/ en local pour valider le bundle
```

Tests unitaires Jest sur les composants/pages/contexte critiques (auth, panier, routes protégées). Les tests E2E
Cypress sont gérés depuis le repo **infra** (`infra/e2e/`) et ciblent le staging déployé.

CI : `ESLint` → `Jest` → `build Vite` → `build image GHCR` → `dispatch infra`. Cf. [
`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

---

## Build de production

```bash
npm run build          # Génère dist/ (assets statiques)
```

En prod, `dist/` est servi par un container Nginx (image Docker générée par la CI, voir [`Dockerfile`](Dockerfile)). Les
variables `VITE_*` sont passées en `--build-arg` lors du build de l'image.

---

## Convention de branchage

- `feature` : `GF{n}-{NomCourt}` (ex : `GF21-SwaggerDoc`, `GF22-Documentation`)
- `develop` : push auto → image `ghcr.io/.../gauthierfitness-frontend:develop` → infra déploie staging
- `main` : push → image `:latest` + tag SHA → déclenchement manuel prod

---

## Liens utiles

- [Manuel utilisateur (parcours client + admin)](https://github.com/CharlesGAUTHIER1999/gauthierfitness/blob/main/docs/03-user-guide.md)
- [Architecture détaillée](https://github.com/CharlesGAUTHIER1999/gauthierfitness/blob/main/docs/01-architecture.md)
- [API REST — Swagger](https://github.com/CharlesGAUTHIER1999/gauthierfitness/blob/main/docs/05-api.md)
- [Repo backend](https://github.com/CharlesGAUTHIER1999/gauthierfitness-backend)
- [Repo infra](https://github.com/CharlesGAUTHIER1999/gauthierfitness-infra)
