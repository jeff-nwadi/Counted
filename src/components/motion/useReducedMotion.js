'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks the OS-level `prefers-reduced-motion` setting. Returns `true`
 * when the user has requested reduced motion — all motion primitives
 * in this folder use this to short-circuit to instant values.
 *
 * SSR-safe: starts with `false` (motion allowed) and corrects on mount.
 * The few-millisecond mismatch during hydration is invisible because
 * we also set `initial={false}` on motion components when this is true.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
