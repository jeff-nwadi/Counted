'use client'

import { useState } from 'react'
import { Check, X, ArrowRight, AlertTriangle, HandHeart } from 'lucide-react'
import { Button } from '@/components/animate-ui/components/buttons/button'

/**
 * One transfer suggestion as a banner.
 *
 * `direction` controls the framing:
 *   - `'incoming'`  — "this location is low, you could move X from Y"
 *   - `'outgoing'`  — "this location has spare, X is low at Y"
 *
 * Both render the same Approve/Dismiss controls; only the icon and
 * the copy change. Same DOM, same accessibility tree, just a label
 * flip — so screen readers and tab order don't shift between the two
 * directions.
 */
export default function TransferBanner({ suggestions, onApprove, onDismiss, direction = 'incoming' }) {
  const [processingId, setProcessingId] = useState(null)

  if (!suggestions || suggestions.length === 0) return null

  const isOutgoing = direction === 'outgoing'
  // Different accent colour so the two banners read as different
  // signals at a glance — incoming is a warning, outgoing is an
  // opportunity.
  const containerClass = isOutgoing
    ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-green-200 bg-green-50'
    : 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-brand-mid bg-brand-light'
  const iconClass = isOutgoing
    ? 'w-4 h-4 text-green-600'
    : 'w-4 h-4 text-brand'
  const Icon = isOutgoing ? HandHeart : AlertTriangle

  return (
    <div className="flex flex-col gap-3 mb-6">
      {suggestions.map((s) => (
        <div
          key={s.id}
          className={containerClass}
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isOutgoing ? 'bg-green-100 text-green-600' : 'bg-brand/10 text-brand'
            }`}>
              <Icon className={iconClass} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                {isOutgoing
                  ? `You can help: ${s.toLocation.name} is low on ${s.item.name}`
                  : `Stock Suggestion: ${s.item.name}`}
              </p>
              <p className="text-xs text-ink-2 mt-0.5">
                {isOutgoing ? (
                  <>
                    Move <span className="font-semibold text-green-700">{s.qty} units</span> from{' '}
                    <span className="font-semibold">this location</span> to{' '}
                    <span className="font-semibold">{s.toLocation.name}</span>.
                  </>
                ) : (
                  <>
                    This location is low or out on this item. Move <span className="font-semibold text-brand-dark">{s.qty} units</span> from <span className="font-semibold">{s.fromLocation.name}</span> to rebalance stock.
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDismiss(s.id)}
              disabled={processingId === s.id}
              className="text-xs font-medium"
            >
              <X className="w-3.5 h-3.5 text-ink-3" />
              Dismiss
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={async () => {
                setProcessingId(s.id)
                try {
                  await onApprove(s)
                } catch (err) {
                  console.error(err)
                } finally {
                  setProcessingId(null)
                }
              }}
              disabled={processingId === s.id}
              className="text-xs font-semibold"
            >
              {processingId === s.id ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {isOutgoing ? 'Approve Send' : 'Approve Transfer'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
