'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/animate-ui/components/buttons/button'

/**
 * Brand-colored submit button with a spinner state for in-flight requests.
 * Wraps the animate-ui Button so the rest of the project's surface area
 * (variants, sizes, focus ring, hover color) is shared.
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
    <Button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`w-full ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>{loadingText || 'Please wait…'}</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
