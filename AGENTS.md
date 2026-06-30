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
| Frontend | React + Vite, PWA-installable | One codebase for desktop and mobile staff use |
| Styling | Plain CSS-in-JS or Tailwind (either is fine) | Keep it simple — no heavy design system needed for v1 |
| Backend / API | Node.js (Fastify or NestJS), OR skip a custom backend entirely and call Supabase directly from the frontend for v1 | A separate backend is optional for v1 — Supabase's client SDK can handle most of this directly |
| Database + real-time sync | **Supabase** (Postgres + built-in real-time subscriptions) | This is the single most important infrastructure choice — it gives instant cross-location sync without custom websocket code |
| Auth | Supabase Auth (email/password or magic link to start) | Don't build custom auth |
| Hosting | Vercel (frontend), Supabase (backend/db) | Both have free tiers sufficient for early pilots |
| Payments | Stripe Billing, per-location seat pricing | Add this only in the final build phase, once pilots are validated |
| CSV parsing | Papaparse | Used only in the Setup/Import screen |
| Charts | Recharts | Used only for the mini bar charts on the Overview screen |
| Icons | lucide-react | Consistent icon set across all screens |

---

## 4. Data model (Supabase / Postgres)

```sql
locations
  id            uuid primary key default gen_random_uuid()
  name          text not null
  code          text not null            -- e.g. "DT-01"
  created_at    timestamptz default now()

items
  id            uuid primary key default gen_random_uuid()
  sku           text not null unique
  name          text not null

stock_levels
  id            uuid primary key default gen_random_uuid()
  location_id   uuid references locations(id)
  item_id       uuid references items(id)
  qty           integer not null default 0
  reorder_level integer not null default 0
  updated_at    timestamptz default now()
  unique (location_id, item_id)

transfers
  id            uuid primary key default gen_random_uuid()
  item_id       uuid references items(id)
  qty           integer not null
  from_location uuid references locations(id)
  to_location   uuid references locations(id)
  created_at    timestamptz default now()
```

Enable Supabase real-time on `stock_levels` so every connected client receives updates without polling.

---

## 5. Skills checklist — what the agent/developer needs to know

Work through these in order. Each one unblocks the next.

### Stage 1 — Project setup
- [ ] Scaffolding a Vite + React project
- [ ] Setting up a Supabase project (free tier): creating tables via SQL editor or migrations
- [ ] Connecting a React app to Supabase using `@supabase/supabase-js`
- [ ] Basic environment variable handling (`.env`, never commit secrets)

### Stage 2 — Core data + real-time
- [ ] Writing Supabase queries: select, insert, update across the schema above
- [ ] Subscribing to Supabase real-time channels (`supabase.channel(...).on('postgres_changes', ...)`) so UI updates live across browser tabs/devices
- [ ] Basic React state management (`useState`, `useMemo`) — no need for Redux/Zustand at this scale

### Stage 3 — Building the screens
- [ ] React component composition (the five screens as separate components sharing one data layer)
- [ ] Conditional styling based on status (`ok` / `low` / `out`) — color logic should live in one shared utility, not be repeated per screen
- [ ] Using Recharts for the small bar charts on the Overview screen
- [ ] Using Papaparse to parse uploaded CSV files client-side before writing to Supabase

### Stage 4 — Auth & multi-tenancy
- [ ] Supabase Auth basics: sign up, log in, session handling
- [ ] Row Level Security (RLS) policies in Postgres — **critical**: without RLS, one customer's business could see another's data. Each business's data should be scoped by an `org_id` (add this column once you have more than one paying customer; not required for a single-pilot v1)

### Stage 5 — Mobile-first / PWA
- [ ] Configuring a Vite app as an installable PWA (manifest.json, service worker basics)
- [ ] Responsive CSS for the Mobile View screen specifically — large tap targets (minimum ~44px), no hover-dependent interactions

### Stage 6 — Deployment
- [ ] Deploying a Vite/React app to Vercel
- [ ] Setting Supabase environment variables correctly in Vercel's dashboard (not hardcoded)
- [ ] Basic custom domain setup once a name/domain is finalized

### Stage 7 — Billing (only after pilots validate the product)
- [ ] Stripe Billing basics: products, prices, checkout sessions
- [ ] Per-location seat pricing — quantity-based subscription items in Stripe so price scales with number of locations
- [ ] Stripe webhooks to update a customer's access level in Supabase when a subscription changes

---

## 6. Build order (do not skip ahead)

1. Supabase project + schema (Section 4)
2. Overview screen with hardcoded/seed data — confirms the data model works
3. Location Ledger screen with live Supabase reads/writes
4. Real-time subscription — open two browser tabs, confirm a change in one appears in the other within seconds. **Do not move on until this works reliably** — it's the core value of the product.
5. Transfer-suggestion logic + Transfer History screen
6. Mobile View (can reuse Ledger logic, simplified UI)
7. Setup/Import screen
8. Auth + RLS
9. Deploy to Vercel, pilot with 2–3 real businesses
10. Stripe billing — only once pilots are using it daily without prompting

## 7. Conventions

- Keep all status-color logic (`ok`/`low`/`out` → color mapping) in one shared file, imported everywhere — never hardcode hex values per component.
- Every Supabase write should be optimistic in the UI (update local state immediately, then confirm via the real-time subscription) so the app feels instant even on a slow connection.
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
├── vite.config.js
├── index.html
│
├── public/
│   ├── manifest.json           # PWA manifest (Stage 5)
│   └── icons/                  # app icons for PWA install
│
├── supabase/
│   ├── schema.sql               # the table definitions from Section 4, source of truth
│   ├── seed.sql                  # sample locations/items/stock for local dev
│   └── policies.sql              # Row Level Security policies (Stage 4)
│
└── src/
    ├── main.jsx                  # app entry point
    ├── App.jsx                   # top-level screen router/switcher only — no business logic here
    │
    ├── lib/
    │   ├── supabaseClient.js     # one shared Supabase client instance — never re-instantiate elsewhere
    │   └── status.js             # the ok/low/out → color + label mapping (Section 7 convention) — single source of truth
    │
    ├── screens/
    │   ├── OverviewScreen.jsx
    │   ├── LedgerScreen.jsx
    │   ├── HistoryScreen.jsx
    │   ├── MobileScreen.jsx
    │   └── SetupScreen.jsx
    │
    ├── components/
    │   ├── NavButton.jsx
    │   ├── StatusPill.jsx
    │   ├── LocationCard.jsx
    │   └── TransferBanner.jsx
    │
    ├── hooks/
    │   ├── useStock.js           # reads + real-time subscription to stock_levels
    │   ├── useTransfers.js       # reads + writes to transfers table
    │   └── useSuggestion.js      # the transfer-suggestion logic from Section 2
    │
    └── styles/
        └── tokens.js              # shared colors/fonts (INK, TEAL, AMBER, CLAY, LINE, font names)
```

**Rules for placing new files:**
- A new screen → `src/screens/`, named `<Name>Screen.jsx`, and registered in `App.jsx`'s switcher. Never put a screen file directly in `src/`.
- A piece of UI used on more than one screen → `src/components/`. If it's only ever used on one screen, keep it inside that screen's file instead of creating a new component file.
- Any Supabase read/write logic → goes in a hook under `src/hooks/`, never written inline inside a screen component. Screens call hooks; they don't talk to Supabase directly.
- Color values, fonts, spacing constants → always `src/styles/tokens.js`. Never hardcode a hex value inside a component — import it from tokens instead.
- Database changes → always written to `supabase/schema.sql` first, then applied. Never make a schema change only in the Supabase dashboard without also updating this file, or the file stops being the source of truth.
- New environment variables → add to `.env.example` with a placeholder value at the same time as `.env`, so the setup instructions stay accurate.