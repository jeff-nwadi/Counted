'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/use-user'

/**
 * Renders nothing on the page. If a signed-in user lands on /, hard-
 * navigate them to /dashboard. If they came from a redirect off the
 * dashboard (e.g. they typed / in the URL bar while signed in), the
 * dashboard shows a brief toast via the `?from=landing` query param.
 *
 * Mount this once at the top of the root page. Keeping it client-side
 * means the marketing page itself stays a server component for fast
 * first paint to signed-out visitors.
 */
export default function SignedInRedirect() {
  const { session, loading } = useUser()
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    if (loading) return
    if (!session) return

    // Only redirect from the marketing root — guards against accidentally
    // mounting this component on other pages later.
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      router.replace('/dashboard?from=landing')
    }
  }, [loading, session, router, search])

  return null
}
