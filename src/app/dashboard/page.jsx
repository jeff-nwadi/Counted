'use client'

import { Suspense } from 'react'
import { useRequireUser } from '@/hooks/use-user'
import { useStock } from '@/hooks/useStock'
import { getStatus, getStatusDetails } from '@/lib/status'
import { Boxes, ArrowRight, Sparkles, AlertTriangle, CheckCircle2, ArrowRightLeft } from 'lucide-react'
import Link from 'next/link'
import FromLandingBanner from '@/components/FromLandingBanner'
import { useSuggestion } from '@/hooks/useSuggestion'

function MiniStockChart({ locationId, stockLevels, items }) {
  const locationStocks = stockLevels
    .filter((s) => s.locationId === locationId)
    .map((s) => ({
      ...s,
      item: items.find((i) => i.id === s.itemId),
    }))
    .filter((s) => s.item)
    .slice(0, 6) // Display top 6 items

  if (locationStocks.length === 0) {
    return (
      <div className="h-12 flex items-center justify-center bg-slate text-[11px] text-ink-3 rounded-lg">
        No stock levels logged
      </div>
    )
  }

  const maxQty = Math.max(...locationStocks.map((s) => s.qty), 10)

  return (
    <div className="h-12 bg-slate/50 p-2 rounded-lg flex items-end gap-1.5 border border-border/40">
      {locationStocks.map((s) => {
        const heightPercent = Math.max(10, Math.min(100, (s.qty / maxQty) * 100))
        const status = getStatus(s.qty, s.reorderLevel)
        const details = getStatusDetails(status)

        return (
          <div key={s.id} className="flex-1 flex flex-col items-center h-full justify-end group relative">
            <div
              className="w-full rounded-t-[2px] transition-all duration-300"
              style={{ height: `${heightPercent}%`, backgroundColor: details.color }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1.5 hidden group-hover:flex bg-ink text-white text-[10px] py-1 px-1.5 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none flex-col">
              <span className="font-semibold">{s.item.name}</span>
              <span>Qty: {s.qty} (Reorder: {s.reorderLevel})</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OverviewPage() {
  const { session } = useRequireUser()
  const { locations, items, stockLevels, loading, error, orgId } = useStock()
  const { all: transferOpportunities } = useSuggestion(locations, items, stockLevels)

  const fullName = session?.user?.name
  const firstName = fullName ? fullName.split(' ')[0] : null

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
          <span className="text-sm text-ink-3">Loading overview…</span>
        </div>
      </div>
    )
  }

  // Process data for display
  const locationsWithStats = locations.map((loc) => {
    const locStocks = stockLevels.filter((s) => s.locationId === loc.id)

    let alertCount = 0
    let hasOut = false
    let hasLow = false

    locStocks.forEach((s) => {
      const status = getStatus(s.qty, s.reorderLevel)
      if (status === 'out') {
        alertCount++
        hasOut = true
      } else if (status === 'low') {
        alertCount++
        hasLow = true
      }
    })

    let status = 'ok'
    if (hasOut) status = 'out'
    else if (hasLow) status = 'low'

    return {
      ...loc,
      totalItems: locStocks.length,
      alertCount,
      status,
    }
  })

  const totalAlerts = locationsWithStats.reduce((acc, loc) => acc + loc.alertCount, 0)
  const isStockCritical = locationsWithStats.some((loc) => loc.status === 'out' || loc.status === 'low')

  return (
    <div className="max-w-5xl">
      {/* The OrgMissingDialog is mounted by the dashboard layout
          (see M-4 in the security audit) so it's not duplicated here. */}

      {/* Database load error banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold">Database error</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}

      {/* "You came from the landing page" banner — shows for 4s when a
          signed-in user is bounced off the marketing root. Wrapped in
          Suspense because useSearchParams() requires it for static
          prerendering. */}
      <Suspense fallback={null}>
        <FromLandingBanner />
      </Suspense>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">
          {firstName ? `Good day, ${firstName}.` : 'Good day.'}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
          Overview
        </h1>
        <p className="text-sm text-ink-2 mt-2 max-w-xl">
          Every location you run, with what&rsquo;s in stock and what needs
          attention — updated in real time.
        </p>
      </div>


      {locations.length > 0 && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          isStockCritical
            ? 'bg-amber-bg border-brand-mid/50 text-amber'
            : 'bg-green-bg border-green-100 text-green'
        }`}>
          {isStockCritical ? (
            <>
              <AlertTriangle className="w-5 h-5 text-amber shrink-0" />
              <span className="text-sm font-medium text-ink">
                Stock alerts active: <span className="font-semibold text-amber">{totalAlerts} items</span> are low or out of stock across your locations.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-green shrink-0" />
              <span className="text-sm font-medium text-ink">
                All locations healthy. No active reorder alerts.
              </span>
            </>
          )}
        </div>
      )}

      {/* Transfer opportunities — every move the system thinks the
          org should make right now, regardless of which side of the
          ledger the current user is looking at. Each card links to
          the donor's ledger (where the Approve button lives), so the
          Overview is for triage, the Ledger is for action. */}
      {transferOpportunities.length > 0 && (
        <section className="mb-8" aria-labelledby="transfer-opportunities-heading">
          <div className="flex items-baseline justify-between mb-3">
            <h2
              id="transfer-opportunities-heading"
              className="text-sm font-semibold text-ink uppercase tracking-wider flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4 text-brand" />
              Transfer opportunities ({transferOpportunities.length})
            </h2>
            <Link
              href="/dashboard/transfers"
              className="text-xs font-medium text-ink-3 hover:text-ink transition-colors"
            >
              View history →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {transferOpportunities.slice(0, 6).map((s) => (
              <TransferOpportunityCard key={s.id} suggestion={s} />
            ))}
          </div>
          {transferOpportunities.length > 6 && (
            <p className="mt-3 text-[11px] text-ink-3 text-center">
              +{transferOpportunities.length - 6} more — see the relevant
              location ledger for the full list.
            </p>
          )}
        </section>
      )}

      {locations.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 sm:p-14 flex flex-col items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="max-w-lg">
            <h2 className="text-lg font-semibold text-ink mb-1.5">
              No locations yet
            </h2>
            <p className="text-sm text-ink-2 leading-relaxed">
              Add your first shop to start tracking live inventory across your
              business. Once a location exists, this page will show stock health,
              transfer suggestions, and the items most likely to run out today.
            </p>
          </div>

          <ul className="text-sm text-ink-2 flex flex-col gap-2 mt-1">
            {[
              'Add a location (Downtown, Westside, Mall Kiosk — whatever you call them).',
              'Import your existing spreadsheet, or add items by hand.',
              'Invite the staff at each location to use the mobile view.',
            ].map((line, i) => (
              <li key={line} className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-brand-light text-brand text-[11px] font-semibold flex items-center justify-center mt-0.5 shrink-0">
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 mt-2">
            <Link
              href="/dashboard/setup"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Add your first location
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Active grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {locationsWithStats.map((loc) => {
            const statusDetails = getStatusDetails(loc.status)

            return (
              <Link
                key={loc.id}
                href={`/dashboard/ledger?locationId=${loc.id}`}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-brand/40 hover:shadow-card transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-ink group-hover:text-brand transition-colors">
                        {loc.name}
                      </h3>
                      <span className="text-[10px] text-ink-3 font-mono">
                        {loc.code}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border ${statusDetails.bgClass}`}>
                      {statusDetails.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <MiniStockChart 
                      locationId={loc.id} 
                      stockLevels={stockLevels} 
                      items={items} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate/50">
                  <span className="text-ink-2">{loc.totalItems} items tracked</span>
                  {loc.alertCount > 0 ? (
                    <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {loc.alertCount} alerts
                    </span>
                  ) : (
                    <span className="text-green font-medium">Healthy</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Compact card for a single transfer opportunity on the Overview.
 *
 * Designed for *triage*, not action: shows the move in plain terms
 * (donor → recipient, qty, item) and a "View" link to the donor's
 * ledger where the Approve button lives. Clicking the whole card
 * also navigates there, since the whole point of the Overview card
 * is to take the user one tap closer to action.
 */
function TransferOpportunityCard({ suggestion }) {
  const { item, qty, fromLocation, toLocation } = suggestion
  return (
    <Link
      href={`/dashboard/ledger?locationId=${fromLocation.id}`}
      className="group block rounded-2xl border border-border bg-card p-4 hover:border-brand/40 hover:shadow-card transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-mono font-bold text-brand bg-brand-light px-2 py-0.5 rounded truncate max-w-[60%]">
          {item.sku}
        </span>
        <span className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider">
          {qty} units
        </span>
      </div>

      <p className="text-sm font-semibold text-ink truncate mb-2" title={item.name}>
        {item.name}
      </p>

      <div className="flex items-center gap-2 text-[11px] text-ink-2">
        <span className="truncate font-medium max-w-[40%]" title={fromLocation.name}>
          {fromLocation.name}
        </span>
        <ArrowRight className="w-3 h-3 text-brand shrink-0" />
        <span className="truncate font-medium max-w-[40%]" title={toLocation.name}>
          {toLocation.name}
        </span>
      </div>

      <div className="mt-3 pt-2 border-t border-slate/60 flex items-center justify-between">
        <span className="text-[10px] text-ink-3">Approve in {fromLocation.name}&rsquo;s ledger</span>
        <span className="text-[11px] font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </span>
      </div>
    </Link>
  )
}
