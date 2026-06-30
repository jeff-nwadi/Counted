'use client'

import { useRequireUser } from '@/hooks/use-user'
import { useTransfers } from '@/hooks/useTransfers'
import { useStock } from '@/hooks/useStock'
import OrgMissingDialog from '@/components/OrgMissingDialog'
import { supabase } from '@/lib/supabase'
import { ArrowRight, History, HelpCircle } from 'lucide-react'

export default function TransfersHistoryPage() {
  useRequireUser()
  const { transfers, loading: transfersLoading, error: transfersError } = useTransfers()
  const { locations, items, loading: stockLoading, error: stockError, orgId } = useStock()

  const loading = transfersLoading || stockLoading
  const error = transfersError || stockError

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
          <span className="text-sm text-ink-3">Loading history…</span>
        </div>
      </div>
    )
  }

  // Map IDs to display names
  const enrichedTransfers = transfers.map((t) => {
    const item = items.find((i) => i.id === t.item_id)
    const fromLoc = locations.find((l) => l.id === t.from_location)
    const toLoc = locations.find((l) => l.id === t.to_location)

    return {
      ...t,
      itemSku: item?.sku ?? '—',
      itemName: item?.name ?? 'Unknown Item',
      fromLocName: fromLoc?.name ?? 'Unknown Location',
      toLocName: toLoc?.name ?? 'Unknown Location',
      formattedDate: new Date(t.created_at).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    }
  })

  return (
    <div className="max-w-5xl">
      {/* Org missing — animated dialog from animate-ui */}
      <OrgMissingDialog
        open={!loading && !orgId}
        onSignOut={async () => {
          await supabase.auth.signOut()
          window.location.href = '/login'
        }}
      />
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold">Database error</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
          Transfer History
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Complete, audit-ready history of all stock movements between locations.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {enrichedTransfers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <History className="w-8 h-8 text-ink-3" />
            <div>
              <p className="text-sm font-semibold text-ink">No Transfers Logged</p>
              <p className="text-xs text-ink-3 mt-1 max-w-sm">
                Approved stock transfers between locations will appear here automatically.
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
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrichedTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-ink-2 font-semibold">
                      {t.itemSku}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-ink">
                      {t.itemName}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-brand-dark">
                      {t.qty}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-ink-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate px-2 py-1 rounded font-medium">{t.fromLocName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-ink-3" />
                        <span className="bg-brand-light text-brand px-2 py-1 rounded font-medium">{t.toLocName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-ink-3">
                      {t.formattedDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
