'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/hooks/useStockQuery'

/**
 * Returns the current session and a loading flag.
 *
 * - `loading: true` until the session probe has answered
 *   (typically <100ms after page load).
 * - `session: null` once the probe completes and there's no signed-in user.
 *
 * Callers that need to *guard* a route (redirect away if not signed in)
 * should use `useRequireUser` instead — this hook is for *display* only.
 *
 * The session shape mirrors Better Auth's response: `{ user: { id, email, name, image, ... }, session: { ... } }`.
 * The user object used to read `user.user_metadata?.full_name` (the
 * Supabase Auth shape) — that is now `user.name`.
 */
export function useUser() {
  const { session, isLoading } = useOrg()
  return { session, loading: isLoading }
}

/**
 * Same as `useUser`, but redirects to /login if no session is found.
 * Use this in dashboard layouts — the redirect is silent and the loading
 * state covers the gap.
 *
 * Also returns `orgId` so the dashboard layout can read the org's data
 * without making a second `useOrg()` call.
 */
export function useRequireUser() {
  const router = useRouter()
  const { session, isLoading, orgId } = useOrg()

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace('/login')
    }
  }, [isLoading, session, router])

  return { session, loading: isLoading, orgId }
}
