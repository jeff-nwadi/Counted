'use client'

import { useState, useMemo } from 'react'

export function useSuggestion(locations, items, stockLevels) {
  const [dismissedList, setDismissedList] = useState([])

  const suggestions = useMemo(() => {
    if (!locations || !locations.length || !items || !items.length || !stockLevels || !stockLevels.length) {
      return []
    }

    const list = []

    // 1. Scan each location as a potential recipient
    for (const recipientLoc of locations) {
      const recipientStocks = stockLevels.filter((s) => s.location_id === recipientLoc.id)

      for (const rStock of recipientStocks) {
        const item = items.find((i) => i.id === rStock.item_id)
        if (!item) continue

        // Check if low or out (qty <= reorder_level)
        const isLowOrOut = rStock.qty <= rStock.reorder_level
        if (isLowOrOut) {
          // 2. Scan other locations for a donor with matching SKU/item_id
          const otherStocks = stockLevels.filter(
            (s) => s.location_id !== recipientLoc.id && s.item_id === rStock.item_id
          )

          // Donor must have qty >= reorder_level + 4. Find the best donor (highest qty)
          let bestDonorStock = null
          for (const dStock of otherStocks) {
            if (dStock.qty >= dStock.reorder_level + 4) {
              if (!bestDonorStock || dStock.qty > bestDonorStock.qty) {
                bestDonorStock = dStock
              }
            }
          }

          if (bestDonorStock) {
            const donorLoc = locations.find((l) => l.id === bestDonorStock.location_id)
            if (!donorLoc) continue

            // qty to move = min(reorder_threshold, donor_qty - 2)
            // If target's reorder_level is 0, we suggest moving a fallback of 2 units.
            const targetReorderLevel = rStock.reorder_level > 0 ? rStock.reorder_level : 2
            const qtyToMove = Math.min(targetReorderLevel, bestDonorStock.qty - 2)

            if (qtyToMove > 0) {
              const suggestionId = `${bestDonorStock.location_id}-${recipientLoc.id}-${item.id}`

              if (!dismissedList.includes(suggestionId)) {
                list.push({
                  id: suggestionId,
                  item,
                  qty: qtyToMove,
                  fromLocation: donorLoc,
                  toLocation: recipientLoc,
                  fromStock: bestDonorStock,
                  toStock: rStock
                })
              }
            }
          }
        }
      }
    }

    return list
  }, [locations, items, stockLevels, dismissedList])

  const dismissSuggestion = (id) => {
    setDismissedList((prev) => [...prev, id])
  }

  return {
    suggestions,
    dismissSuggestion
  }
}
