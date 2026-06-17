# My Brand — commercetools B2C storefront

A production-ready **B2C** storefront on **Next.js 16** (App Router, Turbopack) + **commercetools**,
scaffolded via the `/commercetools:commercetools-storefront` skill. Connected to commercetools
project `us-store` (region `us-central1.gcp`).

> The user-facing overview lives in `README.md`. **This file is for agents** — read it before
> editing, and follow the conventions and gotchas below exactly.

## Read this first

- **This is Next.js 16, not your training data.** See `@AGENTS.md`. Before writing routing,
  caching, middleware, or `params`/`searchParams` code, read the relevant guide in
  `node_modules/next/dist/docs/`.
- **Use the commercetools knowledge MCP, not memory.** For any commercetools API/GraphQL work,
  search the docs and fetch the schema (`mcp__plugin_commercetools_commercetools-knowledge__*`),
  then validate GraphQL before relying on it. Read the `commercetools-developer-tips` MCP prompt
  for key conventions (key vs id, centAmount, localized strings, predicates, in-store APIs).
- **Product Search API only.** Use `apiRoot.products().search()` everywhere. Never use the
  deprecated `productProjections`.

## Architecture — the app is its own BFF

The browser **never** calls commercetools directly. All credentials are server-only (no
`NEXT_PUBLIC_` prefixes). Data flows in one direction:

```
Browser component → hooks/* (SWR) → app/api/* (Route Handler / BFF)
  → lib/ct/* (server-only) → lib/mappers/* → apiRoot → commercetools
```

| Layer | Path | Rule |
|---|---|---|
| commercetools client | `lib/ct/client.ts` | Single `apiRoot` (client-credentials). `import 'server-only'`. |
| Domain logic | `lib/ct/*` | Server-only. One file per domain (cart, search, categories, orders, wishlists, shipping, auth, facets). |
| Mappers | `lib/mappers/*` | Convert raw SDK responses → domain types in `lib/types.ts`. |
| Domain types | `lib/types.ts` | The **only** shape components and hooks may import. Never import the SDK in a component. |
| BFF | `app/api/*` | Route Handlers. The trust boundary; validates input, reads/writes session. |
| Client state | `hooks/*` | SWR hooks (`useCart`, `useAccount`, `useOrders`, `useWishlist`, `useShippingMethods`). |
| UI | `components/*` | Server + client components. Import only from `lib/types.ts` and hooks. |

**Server-rendered vs client-fetched:** catalog (home, PLP, PDP, search) is server-rendered in
`page.tsx`. Cart, account, and wishlist are client-fetched via SWR hooks against `app/api/*`.

## Conventions

- **Import alias:** `@/*` → repo root (e.g. `@/lib/types`, `@/lib/ct/cart`).
- **Adding a feature that needs commercetools data:** add the call in `lib/ct/<domain>.ts`, map it
  through `lib/mappers/` into a `lib/types.ts` type, expose it via a Route Handler in `app/api/`,
  and (for client state) wrap it in an SWR hook. Don't shortcut a layer.
- **Money:** values are `centAmount` (integer minor units) + `currencyCode`. Format with
  `formatMoney()` in `lib/utils.ts`; never divide by 100 inline in components.
- **Localized strings:** use `getLocalizedString(obj, locale)` from `lib/utils.ts`.
- **No hardcoded UI strings.** All copy lives in `messages/{en-US,en-GB,de-DE}.json`, namespaced
  (common/nav/footer/home/product/plp/pdp/cart/miniCart/checkout/auth/account/wishlist/search/
  notFound/error). Add a key to **all three** catalogs. Use `useTranslations` (client) /
  `getTranslations` (server). `de-DE` is real German; `en-GB` mirrors `en-US`.

## i18n & locale routing

- Locales: `en-US` (USD/US, default), `en-GB` (GBP/GB), `de-DE` (EUR/DE) — defined once in
  `COUNTRY_CONFIG` in `lib/utils.ts`. To add a locale, extend that object and add a `messages/` file.
- next-intl v4 with `localePrefix: 'always'` (`i18n/routing.ts`). Use the `Link`/`redirect`/router
  exported from `i18n/routing.ts` for locale-aware navigation.
- **Middleware is `proxy.ts`** (exports `proxy`, not `middleware`). It prefixes the URL with the
  locale and keeps the `your-shop-country-locale` cookie in sync with the URL so server-side price
  selection (currency/country) follows the active locale. `getLocale()` in `lib/session.ts` reads
  session first, then that cookie.
- Root `app/layout.tsx` is a passthrough; `<html>` lives in `app/[locale]/layout.tsx`.

## Sessions & auth

- `lib/session.ts`: signed-JWT (jose, HS256) in the HTTP-only `my-brand-session` cookie, 30-day
  expiry. `Session` holds `customerId/Email/…`, `cartId`, and `country/currency/locale`.
- Helpers: `getSession()`, `getLocale()`, `createSessionToken()`, `setSessionCookie()`,
  `clearSessionCookie()`, and `withSession(data, body, status)` to persist an updated session onto a
  JSON response. Route handlers that mutate the session must return via `withSession`.
- Login (`apiRoot.login()`) merges the anonymous cart into the customer cart.
- `SESSION_SECRET` must be ≥32 chars; there's a dev-only fallback, so **set it in production**.

## Checkout

Payment step uses the commercetools **Checkout Browser SDK** in **payment-only** (`paymentFlow`)
mode. The Checkout Application key is the constant `APP_KEY = 'storefront-checkout'` in
`app/api/checkout/session/route.ts`. Session creation + widget are fully wired. **Live payments**
require, in Merchant Center → Checkout: a Checkout Application with key `storefront-checkout` plus an
attached PSP connector (Stripe/Adyen/Mollie) and a registered `paymentReturnUrl`.

## Facets

Derived from product-type attribute definitions flagged `isSearchable` (`lib/ct/facets.ts`,
`lib/ct/variant-config.ts`), surfaced as `f_*` URL params, and translated to a commercetools
`postFilter` on the Product Search call. Facet shapes are `FacetResult`/`FacetBucket` in
`lib/types.ts`.

## Environment

Set in `.env` (git-ignored, present locally; also `~/.commercetools/credentials`):

```
CTP_PROJECT_KEY=us-store
CTP_AUTH_URL=https://auth.us-central1.gcp.commercetools.com
CTP_API_URL=https://api.us-central1.gcp.commercetools.com
CTP_CLIENT_ID=…
CTP_CLIENT_SECRET=…
CTP_SCOPES=manage_project:us-store
SESSION_SECRET=<random ≥32 chars>
```

## Commands & gotchas

```
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

- `params`, `searchParams`, and `cookies()` are **async** in Next 16 — always `await` them.
- `tsconfig.json` includes both `.next/types` and `.next/dev/types`. After adding/removing routes,
  or if you hit stale-type `tsc` errors, run `npx next typegen`.
- Images are `unoptimized` with a permissive remote allowlist (`next.config.ts`).
- Deploy config: `netlify.toml` and `vercel.json` are at repo root. Skills
  `commercetools:nextjs-deploy-netlify` / `…-vercel` handle deploys.
