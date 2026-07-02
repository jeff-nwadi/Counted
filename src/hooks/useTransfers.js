'use client'

/**
 * Compatibility shim — re-exports the TanStack-Query-backed hook with
 * the same shape the dashboard pages were written against. New code
 * should import the query hooks directly from `@/hooks/useStockQuery`.
 *
 * The realtime subscription is owned by the dashboard layout
 * (`useTransfersRealtime(orgId)`) so we don't open one channel per page.
 */

import { useOrg } from '@/hooks/useStockQuery'
import {
  useTransfersList,
  useExecuteTransfer,
} from '@/hooks/useStockQuery'

export function useTransfers() {
  const { orgId } = useOrg()

  const listQ = useTransfersList(orgId)
  const executeMut = useExecuteTransfer(orgId)

  // Adapter: the old signature took positional args, the new mutation
  // takes a single object. The userId is no longer needed — the
  // `transfer_stock` RPC reads auth.uid() server-side.
  const executeTransfer = (itemId, qty, fromLocation, toLocation) =>
    executeMut.mutateAsync({ itemId, qty, fromLocation, toLocation })

  return {
    transfers: listQ.data ?? [],
    loading: listQ.isLoading || !orgId,
    error: listQ.error?.message ?? null,
    executeTransfer,
  }
}
