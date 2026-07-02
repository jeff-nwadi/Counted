# Transfer feature — surface both sides of the suggestion, on both Overview and Ledger

## Context

The PRD's "feature that matters most" (Week 4) is the proactive transfer suggestion: the
system notices when one location is low/out on a SKU another has plenty of, and names
the exact move so a manager can approve in two taps. The current code only surfaces
the **recipient** side of each suggestion — a manager looking at the donor location
never sees "you can help," and the Overview (the owner's morning check) only shows a
count of alerts, not the actual moves available.

This plan surfaces both sides of every suggestion and lifts the suggestions up to the
Overview, matching the PRD's promise: *"the system taps the owner on the shoulder."*

## Scope

In:
1. `useSuggestion` returns `{ incoming, outgoing, dismiss }` from a single pass.
2. Overview page shows a compact "Transfer opportunities" card with all incoming + outgoing.
3. Ledger page shows both an incoming banner (existing) and a new outgoing banner.
4. `TransferBanner` accepts a `direction` prop so the same component renders both.

Out (deferred, separate plans):
- Persisting dismiss state to `localStorage` (currently useState, resets on remount).
- "Why this transfer" link from Transfer History back to the triggering suggestion.
- Changing the suggestion algorithm itself.

## Files to change

- `src/hooks/useSuggestion.js` — single-pass refactor; new return shape.
- `src/components/TransferBanner.jsx` — accept `direction` prop; render label/icon accordingly.
- `src/app/dashboard/page.jsx` — add `TransferOpportunities` panel above the location grid.
- `src/app/dashboard/ledger/page.jsx` — render outgoing banner alongside incoming.

## Algorithm (unchanged)

For every (recipient, recipient-stock) where qty ≤ reorderLevel:
  find donor at another location with same itemId, qty ≥ donor.reorderLevel + 4
  qtyToMove = min(recipient.reorderLevel || 2, donor.qty - 2)
  emit one suggestion with `id = donorLoc.id + recipientLoc.id + itemId`

The refactor only changes the *shape* of what the hook returns. The set of computed
suggestions is identical; we just bucket them as `{ incoming, outgoing }` so callers
can pick the view they need.

## Return shape

```js
// useSuggestion(locations, items, stockLevels) => {
//   incoming: Suggestion[]   // recipient is one of the manager's locations
//   outgoing: Suggestion[]   // donor is one of the manager's locations
//   dismiss: (id) => void
// }
```

Each `Suggestion` already carries `fromLocation` (donor) and `toLocation` (recipient).
A suggestion is in `incoming` if `toLocation.id === currentLocationId` for whichever
view the consumer is rendering, and `outgoing` otherwise. For the Overview panel
(no specific locationId), we render *all* suggestions — once as incoming (target
perspective) and once as outgoing (donor perspective) is over-counting; instead, we
just render the unfiltered list with the donor→recipient arrow visible.

## Overview panel shape

A single `<section>` placed above the existing location grid. Inside: a responsive
grid (1 col mobile, 2 col tablet, 3 col desktop) of `TransferOpportunityCard`s.

```
┌─ Transfer opportunities (3) ──────────────────────┐
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ → Mall   │ │ Downtown │ ← Mall                   │
│ │ 5 IPA    │ │ 3 Tote   │   2 Blazer              │
│ │ from:DT  │ │ from:WS  │   to:Downtown            │
│ │ [View]   │ │ [View]   │ │ [View]                  │
│ └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────────────────────────────────┘
```

Each card links to the donor's ledger (`/dashboard/ledger?locationId=<from>`) for
outgoing, or the recipient's ledger for incoming. The Ledger page is where the
Approve button lives; the Overview is for *triage*, not for executing the action.

## Verification

1. `npm run build` is green.
2. Manual: two locations, one shared item. Recipient at qty 0, donor at qty 10.
   - Overview shows one card with the donor→recipient arrow.
   - Recipient's ledger shows the existing "you need" banner.
   - Donor's ledger shows the new "you can help" banner with the same numbers.
3. Approve from either side → transfer logged in `/transfers`, both banners clear,
   Overview card disappears.
4. Dismiss from either side → that suggestion stops nagging on the same page.
   (Refresh = comes back. localStorage persistence is the deferred follow-up.)
5. No new API route; no new env var; no schema change.
