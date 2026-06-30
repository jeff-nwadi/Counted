'use client'

import { Loader2 } from 'lucide-react'

/**
 * Brand-colored submit button with a spinner state for in-flight requests.
 * No external deps — uses only Tailwind classes already in the theme.
 */
export default function SubmitButton({
  children,
  loading = false,
  loadingText,
  disabled,
  className = '',
  type = 'submit',
  ...props
}) {
  const isDisabled = loading || disabled

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`relative w-full inline-flex items-center justify-center gap-2 bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-dark active:translate-y-px transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText || 'Please wait…'}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
