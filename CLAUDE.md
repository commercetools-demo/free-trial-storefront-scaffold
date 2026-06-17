# CLAUDE.md

Guidance for AI agents working in this repository. Read this before writing code.

## What this is

A **B2B storefront** on **commercetools**, scaffolded from the `/commercetools:commercetools-storefront` skill. Stack: **Next.js 16** (App Router, Turbopack, React 19), **next-intl** locale routing, **Tailwind v4**, **SWR** for client data, **jose** for session JWTs. commercetools is reached through the official TypeScript SDK (`@commercetools/platform-sdk` + `@commercetools/ts-client`).

The defining intent: this is a **server-owned BFF**. The browser never talks to commercetools directly and never sees commercetools credentials. Every commercetools call happens in a Route Handler (`app/api/**`) or a Server Component, using a single server-side API client. The client tier (components/hooks) talks only to our own `/api/*` endpoints.


## Architecture & layering

Respect these layers — do not let one reach past its neighbor:

```
app/[locale]/**         Server Components (pages) + client components — UI
app/api/**              Route Handlers — the BFF; the ONLY place that reads the session and calls lib/ct
hooks/**                Client-side SWR hooks — fetch from /api/*, never from commercetools
context/**              React context (active business unit, providers)
components/**            Presentational + interactive components
lib/ct/**               commercetools SDK calls. Returns SDK types.
lib/mappers/**           Map raw SDK shapes → app types in lib/types.ts. Pages/components consume mapped types only.
lib/session.ts          Signed-JWT session (cookie 'b2b-store-session'), getLocale()
lib/guards.ts           requireSession() for protected Server Components
lib/utils.ts            COUNTRY_CONFIG, money/address/attribute formatting, localized-string helper
lib/types.ts            App-boundary types (NOT SDK types)
```

**Mapping boundary:** raw commercetools responses are mapped to the clean app types in `lib/types.ts` via `lib/mappers/*` before they cross into pages/components. When adding a field, add it to the mapper and the app type — don't leak raw SDK shapes into UI.

## commercetools conventions (load-bearing)

- **Single client singleton.** `lib/ct/client.ts` exports `apiRoot` (client-credentials flow). Import it everywhere; **never** instantiate `ClientBuilder` inside a page, component, or Route Handler.
- **B2B = the as-associate API chain.** Cart, orders, quotes, approval-flows, approval-rules, and purchase-lists all route through:
  ```ts
  apiRoot.asAssociate()
    .withAssociateIdValue({ associateId })       // = session.customerId
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .<resource>()
  ```
  This makes commercetools enforce associate **permissions server-side** — that enforcement is the point, don't bypass it with project-level calls. Exception: **business-unit discovery** at login uses a project-level query (`businessUnits().get({ where: 'associates(customer(id="..."))' })`) because there's no `businessUnitKey` in the session yet (see `lib/ct/businessUnits.ts`).
- **Login:** `apiRoot.login().post(...)` is the only valid login call in SDK v2. `apiRoot.customers().login()` does **not** exist.
- **key vs id, money as `centAmount`, localized strings** — standard commercetools rules. Use `getLocalizedString()` / `formatMoney()` / `formatAttributeValue()` from `lib/utils.ts` in UI; don't hand-roll.
- **Product search** goes through `lib/ct/product-api.ts` (Product Search API, `products().search()`), with `markMatchingVariants: true`, store projection, price channel, and `priceCustomerGroupAssignments` from the session. Full-text/exact clauses carry a `language` — see gotchas.
- **Use the commercetools Knowledge MCP** (`mcp__plugin_commercetools_*`) for API/GraphQL questions: doc search first, then schema, then validate generated GraphQL. Don't answer commercetools API questions from memory.

## Sessions, auth & B2B context

- The session is a signed JWT in the `b2b-store-session` httpOnly cookie (`lib/session.ts`). `SessionData` (in `lib/types.ts`) carries auth (`customerId`, email/name), the active `cartId`, and the **B2B context resolved at login / BU-select**: `businessUnitKey`, `storeKey`/`storeId`, `supplyChannelId`, `distributionChannelId`, `productSelectionId`, and `accountGroupIds`.
- Route Handlers read the session with `getSession()` and, when persisting changes, return via `jsonWithSession(data, session)` to re-sign + set the cookie.
- Protected **pages**: call `requireSession(locale)` (from `lib/guards.ts`) **outside any try/catch** — it uses `redirect()`, which throws a control-flow signal.
- **Permissions** are computed client-side in `hooks/usePermissions.ts` from the active BU's associate role keys × associate-role permissions (`can()`, `hasAnyPermission()`, `hasAllPermissions()`). This is UX gating only — real enforcement is server-side via the as-associate chain.

## Locale / i18n

- Locales come from `COUNTRY_CONFIG` in `lib/utils.ts` (`en-US` default, plus `en-GB`, `de-DE`); messages in `messages/*.json`. To add a locale, add an entry there + a messages file.
- Routing is `localePrefix: 'always'` — every path is `/[locale]/...`. Navigation helpers (`Link`, `redirect`, `useRouter`, `usePathname`) come from `@/i18n/routing`, **not** `next/navigation`/`next/link`.
- `proxy.ts` is the locale middleware: skips `/api`, `_next`, files; otherwise redirects to a locale-prefixed path using the `your-shop-country-locale` cookie (stores the BCP-47 locale directly).

## Gotchas

- **Product-search language is the BCP-47 locale** (`en-US`, not `en`) in `fullText`/`exact` clauses. Mismatching the project's configured search language returns empty results.
- **Approval rules cannot be deleted** in commercetools — they can only be deactivated/updated. Build UIs accordingly.
- **commercetools Checkout (`paymentFlow`) is not fully configured yet.** `CTP_CHECKOUT_APP_KEY` is scaffolded in env; payment wiring is incomplete.
- One package manager only. The repo has had both `package-lock.json` and `yarn.lock` present — mixing npm/yarn produced a half-installed state. Pick one.
- If a dev-server module error persists after an install (e.g. "Cannot find module 'tailwindcss'"), it's usually a stale Turbopack cache: `rm -rf .next` and restart.

## Environment

Server-only env (`.env.local`, **never** `NEXT_PUBLIC_`-prefixed for these):
`CTP_PROJECT_KEY`, `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_AUTH_URL`, `CTP_API_URL`, `CTP_SCOPES`, `SESSION_SECRET` (≥32 chars; `openssl rand -base64 32`), `CTP_CHECKOUT_APP_KEY`. The commercetools API client should use the **Frontend B2B** scope template, plus `manage_sessions` and `manage_orders`.

## Commands

- `npm run dev` — dev server (Turbopack) at http://localhost:3000, redirects to `/en-US`.
- `npm run build` / `npm run start` — production build / serve.
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`).

`/api/health` is a liveness check. Deploy configs exist for both Netlify (`netlify.toml`) and Vercel (`vercel.json`).

## Conventions for edits

- Path alias `@/*` → repo root. Use it; avoid long relative chains.
- Match the surrounding file's idiom: thin Route Handlers, `lib/ct` returns SDK types, mappers produce app types, UI consumes app types.
- New B2B resource access **must** go through the as-associate chain with `associateId` + `businessUnitKey` from the session.
- Cache keys for SWR live in `lib/cache-keys.ts` — reuse them; don't inline string keys in hooks.
