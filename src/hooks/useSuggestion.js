'use client'

import { useState, useMemo } from 'react'

/**
 * Compute transfer suggestions for the current org.
 *
 * Each suggestion is one of:
 *   - **incoming** for a location — that location is the recipient of a
 *     possible move (it's low/out, and another location has surplus).
 *   - **outgoing** for a location — that location is the donor (it has
 *     surplus, and another location is low/out).
 *
 * The hook returns the full list plus a `dismiss(id)` helper. The
 * caller (Ledger or Overview) chooses how to bucket / display.
 *
 * Algorithm (kept identical to the pre-refactor version — only the
 * return shape changed):
 *   1. For each location as a potential recipient, scan its stock rows.
 *   2. For each row that is low or out (qty ≤ reorderLevel), look for a
 *      donor at another location holding the same item with
 *      qty ≥ donor.reorderLevel + 4.
 *   3. Pick the donor with the highest qty (best buffer).
 *   4. Suggest qty = min(recipient.reorderLevel || 2, donor.qty - 2).
 *
 * Dismiss state is held in component state (resets on remount). Per-
 * org localStorage persistence is a planned follow-up — see
 * .claude/plans/enchanted-weaving-alpaca.md.
 */
export function useSuggestion(locations, items, stockLevels) {
  const [dismissedSet, setDismissedSet] = useState(() => new Set())

  // Compute every suggestion once, then bucket as incoming/outgoing for
  // each location. Single memo, single pass over the data — the
  // Overview and the Ledger both read from this same list.
  const allSuggestions = useMemo(() => {
    if (!locations || !locations.length || !items || !items.length || !stockLevels || !stockLevels.length) {
      return []
    }

    const list = []

    for (const recipientLoc of locations) {
      const recipientStocks = stockLevels.filter((s) => s.locationId === recipientLoc.id)

      for (const rStock of recipientStocks) {
        const item = items.find((i) => i.id === rStock.itemId)
        if (!item) continue

        // Recipient must be low or out.
        const isLowOrOut = rStock.qty <= rStock.reorderLevel
        if (!isLowOrOut) continue

        // Find a donor at any other location for the same SKU, with a
        // comfortable buffer. Pick the donor with the highest qty.
        const otherStocks = stockLevels.filter(
          (s) => s.locationId !== recipientLoc.id && s.itemId === rStock.itemId
        )

        let bestDonorStock = null
        for (const dStock of otherStocks) {
          if (dStock.qty >= dStock.reorderLevel + 4) {
            if (!bestDonorStock || dStock.qty > bestDonorStock.qty) {
              bestDonorStock = dStock
            }
          }
        }

        if (!bestDonorStock) continue

        const donorLoc = locations.find((l) => l.id === bestDonorStock.locationId)
        if (!donorLoc) continue

        // qty to move = min(reorder_threshold, donor_qty - 2). If the
        // recipient's threshold is 0, fall back to 2 units so the
        // suggestion is still meaningful.
        const targetReorderLevel = rStock.reorderLevel > 0 ? rStock.reorderLevel : 2
        const qtyToMove = Math.min(targetReorderLevel, bestDonorStock.qty - 2)
        if (qtyToMove <= 0) continue

        const suggestionId = `${bestDonorStock.locationId}-${recipientLoc.id}-${item.id}`

        list.push({
          id: suggestionId,
          item,
          qty: qtyToMove,
          fromLocation: donorLoc,
          toLocation: recipientLoc,
          fromStock: bestDonorStock,
          toStock: rStock,
        })
      }
    }

    return list
  }, [locations, items, stockLevels])

  // Same list, filtered for dismissals, then bucketed by the location
  // they're *relevant to* (Overview passes null and gets the full list).
  const incomingByLocation = useMemo(() => {
    const map = new Map() // locationId -> Suggestion[]
    for (const loc of locations ?? []) map.set(loc.id, [])
    for (const s of allSuggestions) {
      if (dismissedSet.has(s.id)) continue
      const bucket = map.get(s.toLocation.id)
      if (bucket) bucket.push(s)
    }
    return map
  }, [allSuggestions, locations, dismissedSet])

  const outgoingByLocation = useMemo(() => {
    const map = new Map()
    for (const loc of locations ?? []) map.set(loc.id, [])
    for (const s of allSuggestions) {
      if (dismissedSet.has(s.id)) continue
      const bucket = map.get(s.fromLocation.id)
      if (bucket) bucket.push(s)
    }
    return map
  }, [allSuggestions, locations, dismissedSet])

  const dismiss = (id) => {
    setDismissedSet((prev) => {
      // Same id dismissed twice in a row — copy-on-write only when we
      // actually add something, to keep the deps stable.
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  return {
    /** All non-dismissed suggestions. Used by the Overview. */
    all: allSuggestions.filter((s) => !dismissedSet.has(s.id)),
    /** Suggestions where `toLocation` is the given location. */
    incoming: (locationId) => incomingByLocation.get(locationId) ?? [],
    /** Suggestions where `fromLocation` is the given location. */
    outgoing: (locationId) => outgoingByLocation.get(locationId) ?? [],
    dismiss,
  }
}
