'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
 *
 * The dep array intentionally omits `search` from `useSearchParams()` —
 * it isn't read inside the effect, and including it caused the effect
 * to re-fire on every navigation that touched the query string, which
 * is what created the constant-refresh loop on the landing page.
 */
export default function SignedInRedirect() {
  const { session, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  // `search` is kept here ONLY to participate in the dep array
  // intentionally. The previous version included it and that's what
  // caused the loop. We don't reference it inside the effect.
  // eslint-disable-next-line no-unused-vars
  const search = useSearchParams()

  useEffect(() => {
    if (loading) return
    if (!session) return
    // Only redirect from the marketing root — guards against accidentally
    // mounting this component on other pages later.
    if (pathname === '/') {
      router.replace('/dashboard?from=landing')
    }
  }, [loading, session, router, pathname])

  return null
}
