'use client'

import { useState, useEffect } from 'react'
import { useRequireUser } from '@/hooks/use-user'
import { useStock } from '@/hooks/useStock'
import { Plus, Minus, Search, Smartphone, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function MobileStaffPage() {
  useRequireUser()
  const { locations, items, stockLevels, loading, error, orgId, adjustStock } = useStock()

  const [selectedLocId, setSelectedLocId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Load last selected location from localStorage
  useEffect(() => {
    if (locations.length > 0) {
      const savedLoc = localStorage.getItem('counted_mobile_loc_id')
      if (savedLoc && locations.some((l) => l.id === savedLoc)) {
        setSelectedLocId(savedLoc)
      } else {
        setSelectedLocId(locations[0].id)
      }
    }
  }, [locations])

  const handleLocationChange = (e) => {
    const newId = e.target.value
    setSelectedLocId(newId)
    localStorage.setItem('counted_mobile_loc_id', newId)
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
          <span className="text-sm text-ink-3">Loading staff panel…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl mb-6">
        <h3 className="font-semibold text-sm">Database Load Error</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    )
  }

  if (!orgId) {
    return (
      <div className="p-5 bg-amber-50 text-amber-700 border border-brand-mid/50 rounded-2xl max-w-xl">
        <h3 className="font-semibold text-sm text-ink">No Organization Profile Linked</h3>
        <p className="text-xs text-ink-2 mt-1.5 leading-relaxed font-sans">
          Your user account is signed in, but is not linked to any storefront organization. This typically happens if your account was registered before the database triggers/schemas were applied.
        </p>
        <p className="text-xs text-ink-2 mt-2 leading-relaxed font-sans">
          To resolve this:
        </p>
        <ul className="list-disc list-inside text-xs text-ink-2 mt-1.5 flex flex-col gap-1 font-sans">
          <li>Sign out of this session.</li>
          <li>Register a new account (using a new email address) so the Postgres trigger runs and completes the automated storefront organization link.</li>
        </ul>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl text-ink mb-2">Staff View</h1>
        <p className="text-sm text-ink-2 mb-6">Quick-tap adjustments for active floor staff.</p>
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">No Locations Setup</h3>
            <p className="text-xs text-ink-3 mt-1 max-w-sm">
              Please ask your manager to set up locations and import items before logging inventory.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Filter items based on selected location and search query
  const locStocks = stockLevels
    .filter((s) => s.locationId === selectedLocId)
    .map((s) => ({
      ...s,
      item: items.find((i) => i.id === s.itemId),
    }))
    .filter((s) => s.item)
    .filter((s) => {
      const query = searchQuery.toLowerCase()
      return s.item.name.toLowerCase().includes(query) || s.item.sku.toLowerCase().includes(query)
    })
    .sort((a, b) => a.item.name.localeCompare(b.item.name))

  return (
    <div className="max-w-md mx-auto px-1 py-2">
      {/* Title & Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ink leading-tight">
          Staff Counter
        </h1>
        <p className="text-xs text-ink-3 mt-0.5">
          Tap items to update stock on the floor. Updates sync instantly.
        </p>
      </div>

      {/* Selector & Search Toolbar */}
      <div className="flex flex-col gap-3 mb-6 bg-slate p-3 rounded-2xl border border-border">
        {/* Selector */}
        <div className="flex flex-col gap-1">
          <label htmlFor="mobileLocSelect" className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">
            Current Work Location
          </label>
          <select
            id="mobileLocSelect"
            value={selectedLocId}
            onChange={handleLocationChange}
            className="w-full bg-white border border-border rounded-xl text-base px-3 py-2.5 text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-ink-3" />
          <input
            type="text"
            placeholder="Search items or SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Simple Large-Target List */}
      <div className="flex flex-col gap-3.5">
        {locStocks.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
            <ShoppingBag className="w-8 h-8 text-ink-3 mx-auto mb-2" />
            <p className="text-sm font-semibold text-ink">No items found</p>
            <p className="text-xs text-ink-3 mt-0.5">
              No products found in this location matching your criteria.
            </p>
          </div>
        ) : (
          locStocks.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4"
            >
              {/* Item Info */}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-brand bg-brand-light px-2 py-0.5 rounded">
                  {s.item.sku}
                </span>
                <h3 className="font-semibold text-ink text-base mt-1.5 truncate">
                  {s.item.name}
                </h3>
              </div>

              {/* Adjusters - Touch Target optimized */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => adjustStock(s.locationId, s.itemId, s.qty - 1)}
                  className="w-12 h-12 rounded-xl border border-border bg-slate/40 flex items-center justify-center text-ink hover:bg-slate active:bg-border-2 transition-colors touch-manipulation"
                  aria-label="Decrement quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-8 text-center text-lg font-bold text-ink font-mono">
                  {s.qty}
                </span>

                <button
                  onClick={() => adjustStock(s.locationId, s.itemId, s.qty + 1)}
                  className="w-12 h-12 rounded-xl border border-border bg-slate/40 flex items-center justify-center text-ink hover:bg-slate active:bg-border-2 transition-colors touch-manipulation"
                  aria-label="Increment quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
