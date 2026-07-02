# AGENTS.md — Counted

This file briefs any coding agent (Claude Code, Cursor, etc.) — or a human developer — on what "Counted" is, how it should be built, and exactly which skills/tools are needed at each stage. Read this fully before writing any code.

---

## 1. What we're building

**Counted** is a multi-location inventory tracker for small retail/restaurant/service businesses running 2–8 physical locations. It replaces the shared spreadsheet these businesses currently use, which falls out of sync between locations and causes overselling and lost stock.

**Core mechanic:** every location's stock lives in one shared, real-time database. Any change at one location is visible everywhere within seconds. The system proactively flags when one location is low/out on an item while another has spare stock, and lets a manager approve a transfer in two taps.

**Target customer:** non-technical small business owners and staff. Every screen must be usable without training. Target market is US/UK/EU (priced in USD, $25–40/location/month).

**Out of scope for v1** — do not build these unless explicitly asked later:
- Barcode scanning hardware integration
- Demand forecasting / auto-reordering
- Accounting/ERP integrations (QuickBooks, Xero)
- Manufacturing / bill-of-materials features

---

## 2. The five screens (build in this order)

1. **Overview** — card grid, one card per location, mini stock chart, status color, alert count. Click a card → Location Ledger.
2. **Location Ledger** — full stock table for one location: SKU, name, status pill, +/− adjusters, qty. Shows a transfer-suggestion banner when relevant (Approve / Dismiss).
3. **Transfer History** — auto-logged table of every approved transfer: SKU, item, qty, from → to, timestamp.
4. **Mobile View** — the only screen staff actually need day-to-day. One location, big tap targets, +/− buttons, nothing else.
5. **Setup / Import** — CSV upload, preview parsed rows before committing, import into a location.

The transfer-suggestion logic: scan a location's items: for any item that is `low` or `out`, check if another location has that SKU with quantity ≥ its own reorder threshold + 4. If so, suggest moving `min(reorder_threshold, donor_qty - 2)` units.

---

## 3. Tech stack — use exactly this unless there's a strong reason not to

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 | Single codebase for the marketing site, auth pages, and dashboard |
| Styling | Tailwind | Class-based, no runtime cost |
| Auth | **Better Auth** (email + password, no email verification in v1) | Sign-up auto-creates the org + profile in the same transaction via `databaseHooks.user.create.after` |
| Database | **Neon** (Postgres) | Serverless HTTP driver, cold-start friendly on Vercel |
| ORM | **Drizzle** | Type-safe queries, generated migrations in `./drizzle` |
| Realtime | TanStack Query polling (15s) on dashboard queries | Replaces Supabase `postgres_changes`. No WebSocket gateway to maintain. |
| Org scoping | Application-layer `where eq(orgId, sessionOrgId)` on every query | Replaces Postgres RLS. The route handlers in `src/app/api/stock/*` enforce it; client queries cannot bypass it. |
| Hosting | Vercel (frontend + API routes), Neon (DB) | Both have free tiers sufficient for early pilots |
| Payments | Stripe Billing, per-location seat pricing | Add only in the final build phase |
| State / cache | TanStack Query | One `QueryClient` per browser tab via `src/components/Providers.jsx` |
| CSV parsing | Hand-rolled, client-side | One file in `src/app/dashboard/setup/page.jsx` (the `parseCSV` helper) |
| Charts | Recharts (where needed) | Mini bar charts on Overview |
| Icons | lucide-react | Consistent across screens |

---

## 4. Data model (Neon / Postgres via Drizzle)

Tables live in `src/lib/db/schema.ts`; migrations are generated with
`npx drizzle-kit generate` and applied with `npx drizzle-kit migrate`
(uses `./drizzle/0000_*.sql`).

```text
orgs
  id            uuid primary key default gen_random_uuid()
  name          text not null default 'My Store'
  created_at    timestamptz not null default now()

profiles
  id            uuid primary key default gen_random_uuid()
  user_id       text unique partial-indexed references "user"(id) on delete set null
  org_id        uuid not null references orgs(id) on delete cascade
  full_name     text
  role          text not null default 'owner'
  created_at    timestamptz not null default now()

locations
  id            uuid primary key default gen_random_uuid()
  org_id        uuid not null references orgs(id) on delete cascade
  name          text not null
  code          text
  created_at    timestamptz not null default now()

items
  id            uuid primary key default gen_random_uuid()
  org_id        uuid not null references orgs(id) on delete cascade
  name          text not null
  sku           text
  created_at    timestamptz not null default now()
  -- composite unique on (org_id, sku) — SKUs are unique per org, not globally

stock_levels
  id            uuid primary key default gen_random_uuid()
  org_id        uuid not null references orgs(id) on delete cascade
  location_id   uuid not null references locations(id) on delete cascade
  item_id       uuid not null references items(id) on delete cascade
  qty           integer not null default 0
  reorder_level integer
  updated_at    timestamptz not null default now()
  -- composite unique on (location_id, item_id) — the upsert target

transfers
  id               uuid primary key default gen_random_uuid()
  org_id           uuid not null references orgs(id) on delete cascade
  item_id          uuid not null references items(id) on delete cascade
  from_location_id uuid not null references locations(id) on delete cascade
  to_location_id   uuid not null references locations(id) on delete cascade
  qty              integer not null
  created_at       timestamptz not null default now()
```

Plus the four Better Auth tables (`user`, `session`, `account`,
`verification`) generated by `npx @better-auth/cli generate` into
`src/lib/db/auth-schema.ts` and re-exported from the main schema.

**Cross-org access is prevented in code, not in SQL.** Every route
handler in `src/app/api/stock/*` runs through `getOrgId(request)` (in
`src/lib/org.ts`) which loads the session, reads `profile.orgId`, and
filters every query with `eq(table.orgId, ctx.orgId)`. Writes add an
extra `where` on the row's `orgId` for defense-in-depth. Don't
introduce a new query that bypasses `getOrgId`.

Realtime is a 15-second `refetchInterval` on the dashboard's TanStack
queries (`useStockQuery.js` → `POLL_INTERVAL_MS`). Good enough for an
operator looking at a second tab; the user can lower it to 5s if they
want snappier updates.

---

## 5. Skills checklist — what the agent/developer needs to know

Work through these in order. Each one unblocks the next.

### Stage 1 — Project setup
- [ ] Scaffolding a Vite + React project
- [ ] Setting up a Supabase project (free tier): creating tables via SQL editor or migrations
- [ ] Connecting a Next.js app to a Neon Postgres database via Drizzle ORM
- [ ] `npx drizzle-kit generate` / `npx drizzle-kit migrate` workflow
- [ ] `npx @better-auth/cli generate` to refresh the auth schema after adding plugins
- [ ] Basic environment variable handling (`.env.local`, never commit secrets)

### Stage 2 — Core data + polling
- [ ] Writing Drizzle queries: select, insert, update, transactions (the transfer route runs the row insert + two stock_level updates in a single `db.transaction`)
- [ ] Wiring TanStack Query for the dashboard data layer (`useStockQuery.js`); the 15s `refetchInterval` is the realtime substitute
- [ ] Basic React state management (`useState`, `useMemo`) — no need for Redux/Zustand at this scale

### Stage 3 — Building the screens
- [ ] React component composition (the five screens as separate components sharing one data layer)
- [ ] Conditional styling based on status (`ok` / `low` / `out`) — color logic should live in one shared utility, not be repeated per screen
- [ ] Using Recharts for the small bar charts on the Overview screen
- [ ] Hand-rolled CSV parser in `src/app/dashboard/setup/page.jsx` (no Papaparse — kept the dep count down)

### Stage 4 — Auth & multi-tenancy
- [ ] Better Auth setup: server config (`src/lib/auth.ts`), client (`src/lib/auth-client.ts`), catch-all route handler (`src/app/api/auth/[...all]/route.ts`)
- [ ] The `databaseHooks.user.create.after` hook that creates the org + profile on signup
- [ ] Application-layer org scoping in every Drizzle query (no RLS — the route handler reads the session, looks up `profile.orgId`, and adds `eq(table.orgId, …)` to every where clause)

### Stage 5 — Mobile-first / PWA
- [ ] Configuring Next.js as a PWA (manifest.json, service worker basics)
- [ ] Responsive CSS for the Mobile View screen specifically — large tap targets (minimum ~44px), no hover-dependent interactions

### Stage 6 — Deployment
- [ ] Deploying a Next.js app to Vercel
- [ ] Setting `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_BETTER_AUTH_URL` in Vercel's dashboard (not hardcoded)
- [ ] Basic custom domain setup once a name/domain is finalized

### Stage 7 — Billing (only after pilots validate the product)
- [ ] Stripe Billing basics: products, prices, checkout sessions
- [ ] Per-location seat pricing — quantity-based subscription items in Stripe so price scales with number of locations
- [ ] Stripe webhooks to update a customer's access level in the `profiles.role` column when a subscription changes

---

## 6. Build order (do not skip ahead)

1. Neon project + Drizzle schema (Section 4)
2. Overview screen with hardcoded/seed data — confirms the data model works
3. Location Ledger screen with live Drizzle reads/writes (via the `/api/stock/*` route handlers)
4. Polling-based "realtime" — open two browser tabs, confirm a change in one appears in the other within ~15s. **Do not move on until this works reliably** — it's the core value of the product. If you need lower latency, drop `POLL_INTERVAL_MS` in `useStockQuery.js`.
5. Transfer-suggestion logic + Transfer History screen
6. Mobile View (can reuse Ledger logic, simplified UI)
7. Setup/Import screen
8. Better Auth + org-scoped queries
9. Deploy to Vercel, pilot with 2–3 real businesses
10. Stripe billing — only once pilots are using it daily without prompting

## 7. Conventions

- Keep all status-color logic (`ok`/`low`/`out` → color mapping) in one shared file, imported everywhere — never hardcode hex values per component.
- Every mutation should be optimistic in the UI (update local state immediately, then confirm via the polled refetch) so the app feels instant even on a slow connection.
- Don't add a feature from the "out of scope" list in Section 1 without explicit confirmation — this product's whole value proposition is staying simple.

---

## 8. Project structure

Follow this exact layout. Do not invent alternate folder names or move files outside this structure — consistency here matters more than personal preference, since future sessions (or other agents) rely on predictable paths.

```
counted/
├── AGENTS.md                  # this file — read first, every session
├── README.md                  # short human-facing setup instructions
├── .env.example                # documents required env vars, no real secrets
├── .env                        # actual secrets, gitignored, never committed
├── .gitignore
├── package.json
├── next.config.js
├── drizzle.config.js
├── drizzle/                    # generated SQL migrations from drizzle-kit
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/
│
└── src/
    ├── app/                    # Next.js App Router
    │   ├── layout.jsx          # root layout (Providers)
    │   ├── page.jsx            # marketing landing
    │   ├── api/
    │   │   ├── auth/[...all]/route.ts          # Better Auth catch-all
    │   │   ├── stock/route.ts                  # GET/POST/PATCH stock data
    │   │   ├── stock/transfer/route.ts         # atomic transfer txn
    │   │   └── org/ensure/route.ts             # backfill org+profile
    │   ├── (auth)/
    │   │   ├── login/page.jsx
    │   │   ├── signup/page.jsx
    │   │   ├── forgot-password/page.jsx
    │   │   └── reset-password/page.jsx
    │   └── dashboard/
    │       ├── layout.jsx
    │       ├── page.jsx
    │       ├── ledger/page.jsx
    │       ├── transfers/page.jsx
    │       ├── mobile/page.jsx
    │       └── setup/page.jsx
    │
    ├── components/
    │   ├── Providers.jsx       # TanStack Query provider
    │   ├── OrgMissingDialog.jsx
    │   ├── SignedInRedirect.jsx
    │   └── ...
    │
    ├── lib/
    │   ├── auth.ts             # Better Auth server config (drizzleAdapter, databaseHooks)
    │   ├── auth-client.ts      # Better Auth browser client
    │   ├── auth-errors.js      # friendly error mapper
    │   ├── org.ts              # getOrgId(request) — used by every API route
    │   ├── db/
    │   │   ├── client.ts       # drizzle(neon(DATABASE_URL))
    │   │   ├── schema.ts       # business tables (orgs, profiles, locations, …)
    │   │   └── auth-schema.ts  # Better Auth tables (user, session, …)
    │   ├── query-keys.js       # TanStack Query key factories
    │   └── status.js           # ok/low/out → color + label mapping
    │
    └── hooks/
        ├── use-user.js                 # session + orgId
        ├── useStockQuery.js            # the data layer (queries + mutations + 15s polling)
        ├── useStock.js                 # compatibility shim — re-exports useStockQuery
        ├── useTransfers.js             # compatibility shim
        ├── useSuggestion.js            # transfer-suggestion logic (pure compute)
        └── use-inactivity-timer.js     # 24h idle sign-out
```

**Rules for placing new files:**
- A new screen → `src/app/(auth)/…` or `src/app/dashboard/…`, named `page.jsx`. Never put a screen file in `src/components/`.
- A piece of UI used on more than one screen → `src/components/`.
- Any DB read/write logic → lives in `src/app/api/*` route handlers, called by hooks in `src/hooks/useStockQuery.js`. Screens call hooks; they don't fetch directly.
- Database changes → write to `src/lib/db/schema.ts` first, then `npx drizzle-kit generate`, then `npx drizzle-kit migrate`. Commit the generated SQL to `./drizzle/`.
- New environment variables → add to `.env.example` with a placeholder value at the same time as `.env`, so the setup instructions stay accurate.