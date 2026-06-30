'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * Returns the current Supabase session and a loading flag.
 *
 * - `loading: true` until Supabase has answered the first session probe
 *   (typically <100ms after page load).
 * - `session: null` once the probe completes and there's no signed-in user.
 *
 * Callers that need to *guard* a route (redirect away if not signed in)
 * should use `useRequireUser` instead — this hook is for *display* only.
 */
export function useUser() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!mounted) return
      setSession(next ?? null)

      // If the session was ended server-side (token expired and the refresh
      // token also failed, or our own inactivity timer fired signOut), kick
      // the user to the login screen right away. Without this, a stale
      // session would sit in memory until the next render.
      if (event === 'SIGNED_OUT') {
        // Only redirect if we're not already on an auth route — otherwise
        // the callback route's sign-out during the code exchange would loop.
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/signup') &&
          !window.location.pathname.startsWith('/forgot-password') &&
          !window.location.pathname.startsWith('/auth/')
        ) {
          window.location.href = '/login?reason=session-ended'
        }
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}

/**
 * Same as `useUser`, but redirects to /login if no session is found.
 * Use this in dashboard layouts — the redirect is silent and the loading
 * state covers the gap.
 */
export function useRequireUser() {
  const router = useRouter()
  const { session, loading } = useUser()

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login')
    }
  }, [loading, session, router])

  return { session, loading }
}
