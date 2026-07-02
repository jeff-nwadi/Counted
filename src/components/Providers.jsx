'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Single QueryClient for the whole app.
 *
 * Defaults chosen for a Supabase-backed dashboard:
 *   - staleTime 30s: realtime channel + mutation invalidations are the
 *     primary "fresh data" signal; a 30s window keeps the cache warm
 *     across fast tab switches without hammering Supabase.
 *   - refetchOnWindowFocus: false — Supabase auth changes already
 *     invalidate the session query, and real-time channels keep the
 *     data streams fresh. Re-fetching every focus would be redundant
 *     and would cause a brief "loading" flash on every tab switch.
 *   - retry: 1 — Supabase returns specific error codes (RLS denial,
 *     missing profile, etc.) that should surface immediately, not
 *     thrash through three retries.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

let browserClient

/**
 * Browser singleton — React 19's strict mode (and dev's double-render)
 * would otherwise create a new QueryClient on every mount, throwing
 * away the cache. We keep one per browser tab.
 */
function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserClient) browserClient = makeQueryClient()
  return browserClient
}

export default function Providers({ children }) {
  // useState so the same client survives re-renders but is fresh per
  // browser session — matches React Query's recommended SSR pattern.
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
