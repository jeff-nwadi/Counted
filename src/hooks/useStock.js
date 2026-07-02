'use client'

/**
 * Compatibility shim — re-exports the TanStack-Query-backed hook with
 * the same shape the dashboard pages were written against. New code
 * should import the query hooks directly from `@/hooks/useStockQuery`.
 *
 * The realtime subscription is owned by the dashboard layout
 * (`useStockRealtime(orgId)`) so we don't open one channel per page.
 */

import { useOrg } from '@/hooks/useStockQuery'
import {
  useLocations,
  useItems,
  useStockLevels,
  useAdjustStock,
  useAddLocation,
  useAddItem,
  useUpsertStockSettings,
} from '@/hooks/useStockQuery'

export function useStock() {
  const { orgId, userId } = useOrg()

  const locationsQ = useLocations(orgId)
  const itemsQ = useItems(orgId)
  const levelsQ = useStockLevels(orgId)

  const adjustStockMut = useAdjustStock(orgId)
  const addLocationMut = useAddLocation(orgId)
  const addItemMut = useAddItem(orgId)
  const updateStockSettingsMut = useUpsertStockSettings(orgId)

  // Adapter: the old signature took positional args, the new mutation
  // takes a single object. Keep the old calling sites working.
  const adjustStock = (locationId, itemId, newQty) =>
    adjustStockMut.mutateAsync({ locationId, itemId, newQty })
  const addLocation = (name, code) => addLocationMut.mutateAsync({ name, code })
  const addItem = (name, sku) => addItemMut.mutateAsync({ name, sku })
  const updateStockSettings = (locationId, itemId, qty, reorderLevel) =>
    updateStockSettingsMut.mutateAsync({ locationId, itemId, qty, reorderLevel })

  return {
    locations: locationsQ.data ?? [],
    items: itemsQ.data ?? [],
    stockLevels: levelsQ.data ?? [],
    loading:
      locationsQ.isLoading ||
      itemsQ.isLoading ||
      levelsQ.isLoading ||
      !orgId,
    error:
      (locationsQ.error?.message ||
        itemsQ.error?.message ||
        levelsQ.error?.message) ??
      null,
    orgId,
    userId,
    adjustStock,
    addLocation,
    addItem,
    updateStockSettings,
  }
}
