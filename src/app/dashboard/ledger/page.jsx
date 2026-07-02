'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRequireUser } from '@/hooks/use-user'
import { useStock } from '@/hooks/useStock'
import { useTransfers } from '@/hooks/useTransfers'
import { useSuggestion } from '@/hooks/useSuggestion'
import { getStatus } from '@/lib/status'
import StatusPill from '@/components/StatusPill'
import TransferBanner from '@/components/TransferBanner'
import { ChevronLeft, Plus, Minus, Settings, Info, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

function LedgerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locationIdParam = searchParams.get('locationId')

  const { session } = useRequireUser()
  const { locations, items, stockLevels, loading, error, orgId, adjustStock, updateStockSettings } = useStock()
  const { executeTransfer } = useTransfers()
  const { incoming, outgoing, dismiss } = useSuggestion(locations, items, stockLevels)

  const [selectedLocId, setSelectedLocId] = useState('')

  // Set selected location based on query param or default to first location
  useEffect(() => {
    if (locations.length > 0) {
      if (locationIdParam && locations.some((l) => l.id === locationIdParam)) {
        setSelectedLocId(locationIdParam)
      } else {
        setSelectedLocId(locations[0].id)
      }
    }
  }, [locations, locationIdParam])

  // Sync selected location change to query param
  const handleLocationChange = (e) => {
    const newId = e.target.value
    setSelectedLocId(newId)
    router.push(`/dashboard/ledger?locationId=${newId}`)
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
          <span className="text-sm text-ink-3">Loading ledger…</span>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-ink mb-2">Location Ledger</h1>
        <p className="text-sm text-ink-2 mb-6">Drill into stock details, adjust levels, and handle transfer suggestions.</p>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold">Database error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        )}
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">No Locations Configured</h3>
            <p className="text-xs text-ink-3 mt-1 max-w-sm">
              Configure your first shop location and import inventory items on the Setup &amp; Import screen to view the ledger.
            </p>
          </div>
          <Link
            href="/dashboard/setup"
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors mt-2"
          >
            Go to Setup
          </Link>
        </div>
      </div>
    )
  }

  const selectedLoc = locations.find((l) => l.id === selectedLocId)
  
  // Filter stock for current location
  const locStocks = stockLevels
    .filter((s) => s.locationId === selectedLocId)
    .map((s) => ({
      ...s,
      item: items.find((i) => i.id === s.itemId),
    }))
    .filter((s) => s.item)
    .sort((a, b) => a.item.name.localeCompare(b.item.name))

  // Selected location's incoming + outgoing suggestions. Both lists
  // are pre-bucketed by the hook keyed on `selectedLocId`, so this is
  // an O(1) lookup rather than a per-render filter.
  const incomingSuggestions = selectedLocId ? incoming(selectedLocId) : []
  const outgoingSuggestions = selectedLocId ? outgoing(selectedLocId) : []

  // Handle transfer approval
  const handleApproveTransfer = async (suggestion) => {
    if (!session?.user?.id) return
    await executeTransfer(
      suggestion.item.id,
      suggestion.qty,
      suggestion.fromLocation.id,
      suggestion.toLocation.id
    )
  }

  return (
    <div className="max-w-5xl">
      {/* The OrgMissingDialog is mounted by the dashboard layout
          (see M-4 in the security audit) so it's not duplicated here. */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold">Database error</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
            Location Ledger
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Drill into local quantities, adjust active thresholds, and rebalance stock.
          </p>
        </div>

        {/* Location selector dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="locationSelect" className="text-xs font-semibold text-ink-3 uppercase tracking-wider">
            Location:
          </label>
          <select
            id="locationSelect"
            value={selectedLocId}
            onChange={handleLocationChange}
            className="bg-white border border-border rounded-xl text-sm px-3 py-2 text-ink font-medium hover:border-border-2 focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested transfers — incoming ("you need it") first, then
          outgoing ("you can help"). Order matters: a manager looking
          at this ledger most likely cares about their own stockouts
          first, then about the surplus they can offer elsewhere. */}
      <TransferBanner
        suggestions={incomingSuggestions}
        onApprove={handleApproveTransfer}
        onDismiss={dismiss}
        direction="incoming"
      />
      <TransferBanner
        suggestions={outgoingSuggestions}
        onApprove={handleApproveTransfer}
        onDismiss={dismiss}
        direction="outgoing"
      />

      {/* Main Stock Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {locStocks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Info className="w-8 h-8 text-ink-3" />
            <div>
              <p className="text-sm font-semibold text-ink">No items in this location</p>
              <p className="text-xs text-ink-3 mt-1 max-w-sm">
                Head to the Setup & Import page to upload products and link them to this location.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate/40 text-xs font-semibold text-ink-3 uppercase tracking-wider">
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4 text-center">Reorder Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {locStocks.map((s) => {
                  const status = getStatus(s.qty, s.reorderLevel)
                  return (
                    <tr key={s.id} className="hover:bg-slate/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-ink-2 font-semibold">
                        {s.item.sku}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-ink">
                        {s.item.name}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-6 py-4">
                        {/* Quantity Adjusters */}
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => adjustStock(s.locationId, s.itemId, s.qty - 1)}
                            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-2 hover:bg-slate transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-ink">
                            {s.qty}
                          </span>
                          <button
                            onClick={() => adjustStock(s.locationId, s.itemId, s.qty + 1)}
                            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-2 hover:bg-slate transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* Reorder Threshold Adjusters */}
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateStockSettings(s.locationId, s.itemId, s.qty, Math.max(0, s.reorderLevel - 1))}
                            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-2 hover:bg-slate transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-ink-2">
                            {s.reorderLevel}
                          </span>
                          <button
                            onClick={() => updateStockSettings(s.locationId, s.itemId, s.qty, s.reorderLevel + 1)}
                            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-2 hover:bg-slate transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LedgerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
          <span className="text-sm text-ink-3">Loading ledger…</span>
        </div>
      </div>
    }>
      <LedgerContent />
    </Suspense>
  )
}
