'use client'

import { AlertCircle } from 'lucide-react'

/**
 * Inline error/success banner for the auth forms.
 * Renders nothing when the message is empty, so the form can pass
 * `error={error || ''}` without an extra null check.
 */
export default function FormAlert({ error, tone = 'error' }) {
  if (!error) return null

  const palette =
    tone === 'success'
      ? 'bg-green-bg text-green border-green/20'
      : 'bg-red-50 text-red-700 border-red-200'

  const Icon = tone === 'success' ? null : AlertCircle

  return (
    <div
      role={tone === 'success' ? 'status' : 'alert'}
      className={`flex items-start gap-2.5 text-sm rounded-xl border px-3.5 py-2.5 ${palette}`}
    >
      {Icon && <Icon className="w-4 h-4 mt-0.5 shrink-0" />}
      <span className="leading-relaxed">{error}</span>
    </div>
  )
}
