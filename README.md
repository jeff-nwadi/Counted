# Counted — Landing Page (Next.js 14)

A production-ready **Next.js 14** landing page for **Counted**, an affordable multi-location inventory tool for small retail and restaurant operators.

## Stack

| Tool | Purpose |
|---|---|
| **Next.js 14** | App Router, server components, file-based routing |
| **React 18** | UI components |
| **Tailwind CSS 3** | Utility-first styling with custom design tokens |
| **lucide-react** | Icon library |
| **Google Fonts** | Instrument Serif (display) + Inter (body via `next/font`) |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → http://localhost:3000

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

## Project structure

```
src/
├── app/
│   ├── layout.jsx          # Root layout — metadata, fonts, global CSS
│   ├── page.jsx            # Home page — assembles all sections (server component)
│   └── globals.css         # Tailwind base + custom utilities
├── components/
│   ├── Button.jsx          # Reusable button (server-safe, no hooks)
│   ├── Badge.jsx           # Coloured label chip
│   └── HeroWidget.jsx      # 'use client' — interactive live inventory demo
└── sections/
    ├── Navbar.jsx          # 'use client' — scroll detection + mobile menu
    ├── Hero.jsx            # Server — headline + HeroWidget
    ├── SocialProof.jsx     # Server — stats bar + category pills
    ├── Problem.jsx         # Server — the "before" problem cards
    ├── Features.jsx        # Server — 5-feature grid
    ├── HowItWorks.jsx      # Server — 4-step process, sticky left column
    ├── Testimonials.jsx    # Server — 3 customer quote cards
    ├── Pricing.jsx         # 'use client' — per-location pricing with live slider
    ├── FinalCTA.jsx        # Server — dark closing CTA
    └── Footer.jsx          # Server — full footer with link groups
```

## Server vs client components

This project follows Next.js best practices — only components that need browser APIs or React state are marked `'use client'`:

| Component | Type | Reason |
|---|---|---|
| `HeroWidget` | Client | `useState` for live stock adjustment |
| `Navbar` | Client | `useState` (mobile menu) + `useEffect` (scroll) |
| `Pricing` | Client | `useState` for location count slider |
| Everything else | Server | Static markup, no interactivity needed |

## Design tokens (`tailwind.config.js`)

| Token | Value | Usage |
|---|---|---|
| `ink` | `#0f1117` | Primary text |
| `ink-2` | `#3d3f4a` | Secondary text |
| `ink-3` | `#7a7d8a` | Muted / labels |
| `brand` | `#1a56f5` | Primary CTA, active states |
| `brand-light` | `#eef2ff` | Brand tint backgrounds |
| `slate` | `#f4f5f7` | Section / card backgrounds |
| `border` | `#e4e5ea` | Default borders |

## Customising

### Change content
All copy is inline in each section file in `src/sections/`. No separate CMS or content layer.

### Add a page
Create `src/app/about/page.jsx` — Next.js App Router picks it up automatically at `/about`.

### Wire up a real signup form
Replace the `href="#pricing"` links in `Hero.jsx`, `FinalCTA.jsx`, and `Pricing.jsx` with your auth provider's signup URL (Clerk, Auth0, Supabase Auth, etc.).

### Change the font
`layout.jsx` loads Inter via `next/font/google` (zero layout shift). The display serif (Instrument Serif) is loaded via a `<link>` tag. Swap either by changing the import.

## Deployment

### Vercel (recommended)
```bash
npx vercel --prod
```
Vercel auto-detects Next.js and configures everything.

### Other platforms
```bash
npm run build   # → .next/ build output
npm start       # → runs production server on port 3000
```

Or use `next export` for a fully static build (remove dynamic server features first).

### Environment variables
No environment variables are required for the landing page. When you add a backend (Supabase, Stripe, etc.), add them to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
STRIPE_SECRET_KEY=...
```

## Performance notes

- **Server components by default** — only 3 components ship JS to the client
- **`next/font`** — Inter is self-hosted, zero FOUT
- **Images** — add product screenshots via `next/image` for automatic optimisation
- **Core Web Vitals** — no layout shift sources; all animations respect `prefers-reduced-motion`
