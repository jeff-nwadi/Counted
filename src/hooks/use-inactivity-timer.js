'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const IDLE_LIMIT_MS = 24 * 60 * 60 * 1000   // 24 hours
const DEBOUNCE_MS = 1000                     // throttle reset events to once per second

// Events that count as "user is doing something." passive: true so the
// listeners don't interfere with scrolling or other interactions.
const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

/**
 * Force-sign-out after 24h of inactivity.
 *
 * Mount this once at the top of any layout that should enforce the policy
 * (the dashboard layout). It does nothing when `session` is null, so a
 * signed-out user landing on a guarded route won't trigger a phantom
 * sign-out.
 *
 * Behavior:
 *   - Listens for user activity (mouse, keyboard, scroll, touch, click).
 *   - Resets a 24h timer on each activity event, debounced to once per
 *     second so a noisy mousemove stream doesn't pin the timer to 0.
 *   - When the timer fires, calls supabase.auth.signOut() and hard-
 *     navigates to /login?reason=inactivity so the login page can show
 *     a friendly banner.
 *
 * Note: this is a client-side policy. A user who closes the tab and
 * re-opens it 25h later will see the policy enforced on next page load
 * because the refresh-token window is finite; see AGENTS.md for the
 * server-side counterpart. If you want a warning before sign-out, layer
 * it on top of this hook — don't replace it.
 */
export function useInactivityTimer(session) {
  // Keep a ref to the latest session so the activity-listener callback
  // doesn't re-bind on every render. The listeners themselves only
  // ever need to reset the timer, never read session, so this is
  // mostly belt-and-braces.
  const sessionRef = useRef(session)
  sessionRef.current = session

  useEffect(() => {
    if (!session) return

    let lastReset = 0
    let timeoutId = null

    function resetTimer() {
      const now = Date.now()
      // Debounce: ignore bursts of events spaced < 1s apart.
      if (now - lastReset < DEBOUNCE_MS) return
      lastReset = now

      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleIdle, IDLE_LIMIT_MS)
    }

    async function handleIdle() {
      // Belt-and-braces: re-check the session right before signing out.
      // If the user has been signed out some other way in the meantime,
      // don't double-fire.
      if (!sessionRef.current) return

      await supabase.auth.signOut()
      // Hard navigate so the dashboard's use-user hook doesn't race us.
      window.location.href = '/login?reason=inactivity'
    }

    // Prime the timer on mount.
    resetTimer()

    // Listeners are passive so they don't block scroll/touch.
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true })
    )

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimer)
      )
    }
  }, [session])
}
