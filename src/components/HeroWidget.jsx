'use client'

import { useState } from 'react'
import { ArrowRightLeft, TrendingDown, CheckCircle } from 'lucide-react'

const LOCATIONS = ['Downtown', 'Westside', 'Mall Kiosk']

const INITIAL_STOCK = [
  { name: 'Linen Blazer', sku: 'BLZ-001', stock: [2, 14, 6], threshold: 5 },
  { name: 'Canvas Tote', sku: 'TOT-004', stock: [8, 22, 3], threshold: 8 },
  { name: 'Merino Crew', sku: 'KNT-011', stock: [15, 7, 12], threshold: 10 },
  { name: 'Silk Scarf', sku: 'SCF-009', stock: [0, 18, 9], threshold: 6 },
]

function getStatus(qty, threshold) {
  if (qty === 0) return 'out'
  if (qty < threshold) return 'low'
  return 'ok'
}

const statusStyle = {
  ok: 'bg-green-50 text-green-700',
  low: 'bg-amber-50 text-amber-700',
  out: 'bg-red-50 text-red-600',
}

const statusLabel = { ok: '', low: ' · Low', out: ' · Out' }

export default function HeroWidget() {
  const [items, setItems] = useState(INITIAL_STOCK)
  const [activeLoc, setActiveLoc] = useState(0)
  const [transferred, setTransferred] = useState(false)

  function adjust(idx, delta) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              stock: item.stock.map((q, li) =>
                li === activeLoc ? Math.max(0, q + delta) : q
              ),
            }
          : item
      )
    )
  }

  function approveTransfer() {
    setItems((prev) =>
      prev.map((item, i) =>
        i === 0
          ? { ...item, stock: [item.stock[0] + 5, item.stock[1] - 5, item.stock[2]] }
          : item
      )
    )
    setTransferred(true)
  }

  const hasAlert = items[0].stock[0] < items[0].threshold && !transferred

  return (
    <div className="bg-white rounded-2xl border border-border shadow-hero overflow-hidden select-none w-full max-w-sm">
      {/* Header bar */}
      <div className="bg-brand px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold">C</span>
          </div>
          <span className="text-white text-sm font-medium">Counted</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
          <span className="text-white/80 text-xs">Live</span>
        </div>
      </div>

      {/* Location tabs */}
      <div className="flex border-b border-border bg-slate">
        {LOCATIONS.map((loc, i) => (
          <button
            key={loc}
            onClick={() => setActiveLoc(i)}
            className={`flex-1 text-xs font-medium py-2 transition-colors ${
              activeLoc === i
                ? 'bg-white text-brand border-b-2 border-brand'
                : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* Transfer suggestion alert */}
      {hasAlert && (
        <div className="mx-3 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
          <TrendingDown className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-800">Transfer suggestion</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Move 5× Linen Blazer from Westside</p>
          </div>
          <button
            onClick={approveTransfer}
            className="text-[11px] font-medium text-brand bg-white border border-brand-mid rounded-lg px-2 py-0.5 hover:bg-brand-light transition-colors flex-shrink-0"
          >
            Approve
          </button>
        </div>
      )}

      {transferred && (
        <div className="mx-3 mt-3 bg-green-50 border border-green-200 rounded-xl p-2.5 flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700 font-medium">
            Transfer approved — stock updated everywhere
          </p>
        </div>
      )}

      {/* Stock list */}
      <div className="px-3 py-2">
        {items.map((item, idx) => {
          const qty = item.stock[activeLoc]
          const status = getStatus(qty, item.threshold)
          return (
            <div
              key={item.sku}
              className="flex items-center py-2 border-b border-border last:border-0 gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink truncate">{item.name}</p>
                <p className="text-[11px] text-ink-3">{item.sku}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-md min-w-[28px] text-center ${statusStyle[status]}`}
                >
                  {qty}
                  {statusLabel[status]}
                </span>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => adjust(idx, -1)}
                    aria-label={`Decrease ${item.name}`}
                    className="w-5 h-5 rounded bg-slate border border-border text-ink-2 text-xs hover:bg-brand hover:text-white hover:border-brand transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <button
                    onClick={() => adjust(idx, 1)}
                    aria-label={`Increase ${item.name}`}
                    className="w-5 h-5 rounded bg-slate border border-border text-ink-2 text-xs hover:bg-brand hover:text-white hover:border-brand transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ArrowRightLeft className="w-3 h-3 text-ink-3" />
          <span className="text-[11px] text-ink-3">All 3 locations synced</span>
        </div>
        <span className="text-[10px] text-ink-3">2s ago</span>
      </div>
    </div>
  )
}
