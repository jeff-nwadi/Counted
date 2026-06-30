'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

/**
 * Shows a brief "you're already signed in" banner at the top of the
 * dashboard when the user arrives via `?from=landing` (i.e. they tried
 * to open the marketing root and were redirected). Auto-dismisses after
 * 4s and strips the query so a refresh doesn't re-show it.
 *
 * Extracted from the dashboard page so the page itself can stay out of
 * `useSearchParams` (which requires a Suspense boundary for static
 * prerendering).
 */
export default function FromLandingBanner() {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const fromLanding = search.get('from') === 'landing'
  const [show, setShow] = useState(fromLanding)

  useEffect(() => {
    if (!fromLanding) return
    const t = setTimeout(() => {
      setShow(false)
      // Strip the ?from=landing param so reloads don't re-show it.
      router.replace(pathname, { scroll: false })
    }, 4000)
    return () => clearTimeout(t)
  }, [fromLanding, router, pathname])

  if (!show) return null

  return (
    <div className="mb-6 p-4 bg-brand-light border border-brand-mid/40 text-brand-dark rounded-xl flex items-center gap-3">
      <span className="text-sm font-medium">
        You&rsquo;re already signed in — this is your dashboard.
      </span>
      <button
        type="button"
        onClick={() => {
          setShow(false)
          router.replace(pathname, { scroll: false })
        }}
        className="ml-auto text-brand-dark/60 hover:text-brand-dark transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
