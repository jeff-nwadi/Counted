'use client'

import { useState } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/animate-ui/components/buttons/button'

export default function TransferBanner({ suggestions, onApprove, onDismiss }) {
  const [processingId, setProcessingId] = useState(null)

  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="flex flex-col gap-3 mb-6">
      {suggestions.map((s) => (
        <div
          key={s.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-brand-mid bg-brand-light"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                Stock Suggestion: {s.item.name}
              </p>
              <p className="text-xs text-ink-2 mt-0.5">
                This location is low or out on this item. Move <span className="font-semibold text-brand-dark">{s.qty} units</span> from <span className="font-semibold">{s.fromLocation.name}</span> to rebalance stock.
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
              Approve Transfer
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
