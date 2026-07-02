'use client'

import { useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { queryKeys } from '@/lib/query-keys'

/* -------------------------------------------------------------------------- */
/*  Internal helpers — fetch from the /api/stock/* routes.                    */
/* -------------------------------------------------------------------------- */

/**
 * Single fetch wrapper that throws on non-2xx so TanStack Query's
 * `error` state populates. The previous Supabase `{ data, error }`
 * pattern is gone — Drizzle routes throw on failure.
 */
async function getJson(url) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || `${res.status} ${res.statusText}`)
    // @ts-expect-error — attaching the status code for callers that care
    err.status = res.status
    throw err
  }
  return res.json()
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    const err = new Error(errBody.error || `${res.status} ${res.statusText}`)
    // @ts-expect-error — attach status for callers
    err.status = res.status
    throw err
  }
  return res.json()
}

async function patchJson(url, body) {
  const res = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    const err = new Error(errBody.error || `${res.status} ${res.statusText}`)
    // @ts-expect-error
    err.status = res.status
    throw err
  }
  return res.json()
}

async function fetchProfileAndOrg() {
  // OrgMissingDialog's "Re-check" button hits /api/org/ensure and
  // invalidates the profile query. The profile query itself is loaded
  // from /api/org/ensure too, so a fresh GET is always authoritative.
  return getJson('/api/org/ensure')
}

async function fetchLocations(orgId) {
  return getJson(`/api/stock?kind=locations`)
}

async function fetchItems(orgId) {
  return getJson(`/api/stock?kind=items`)
}

async function fetchStockLevels(orgId) {
  return getJson(`/api/stock?kind=levels`)
}

async function fetchTransfers(orgId) {
  return getJson(`/api/stock?kind=transfers`)
}

// Shared polling interval for dashboard data. Replaces the old
// Supabase `postgres_changes` realtime. 15s is the sweet spot —
// snappy enough for a "did that transfer land yet?" check, cheap
// enough that 100 concurrent operators won't blow out Neon.
const POLL_INTERVAL_MS = 15_000


/* -------------------------------------------------------------------------- */
/*  Org / session shape                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Returns the org_id and profile for the currently signed-in user, or
 * `null` if no user / no profile.
 *
 * `useUser` is the canonical "who am I, what org am I in" query. Every
 * other data hook in the app depends on orgId, so it lives at the top
 * of the dependency graph.
 *
 * The profile is fetched from the `/api/org/ensure` endpoint, which
 * is idempotent: it returns the existing org_id or creates one. The
 * same code path runs on signup (via Better Auth's database hook) so
 * a fresh user always has a profile.
 */
export function useOrg() {
  const sessionQuery = useQuery({
    queryKey: queryKeys.session.current(),
    queryFn: async () => {
      // Better Auth's getSession hits the cookie → server route → DB.
      // Returns the full session (with user) or null.
      const data = await authClient.getSession()
      return data?.data ?? null
    },
    staleTime: 60 * 1000,
  })

  const session = sessionQuery.data
  const userId = session?.user?.id ?? null

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.org(userId ?? '_anon'),
    queryFn: () => fetchProfileAndOrg(),
    enabled: !!userId,
    // No staleTime: the "no profile" result is the OrgMissingDialog state,
    // and we need the next click of the dialog's Re-check button (or any
    // sign-in/sign-out cycle) to hit the network, not serve a 60s-old
    // "no org" result. The cost is one tiny SELECT per dashboard mount,
    // which is negligible vs. the UX cost of the dialog sticking.
    staleTime: 0,
  })

  // No realtime listener — Better Auth's useSession polls on mount and
  // our explicit `authClient.signOut` calls invalidate the session
  // query at call sites. Caches below are cleared on sign-out via the
  // `signOut` wrappers in the dashboard layout.
  return {
    session,
    userId,
    orgId: profileQuery.data?.orgId ?? null,
    profile: profileQuery.data ?? null,
    isLoading: sessionQuery.isLoading || (!!userId && profileQuery.isLoading),
    error: sessionQuery.error ?? profileQuery.error ?? null,
  }
}


/* -------------------------------------------------------------------------- */
/*  Stock data — locations, items, levels                                     */
/* -------------------------------------------------------------------------- */

export function useLocations(orgId) {
  return useQuery({
    queryKey: queryKeys.stock.locations(orgId ?? '_none'),
    queryFn: () => fetchLocations(orgId),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
    refetchInterval: orgId ? POLL_INTERVAL_MS : false,
  })
}

export function useItems(orgId) {
  return useQuery({
    queryKey: queryKeys.stock.items(orgId ?? '_none'),
    queryFn: () => fetchItems(orgId),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
    refetchInterval: orgId ? POLL_INTERVAL_MS : false,
  })
}

export function useStockLevels(orgId) {
  return useQuery({
    queryKey: queryKeys.stock.levels(orgId ?? '_none'),
    queryFn: () => fetchStockLevels(orgId),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
    refetchInterval: orgId ? POLL_INTERVAL_MS : false,
  })
}


/* -------------------------------------------------------------------------- */
/*  Stock mutations                                                           */
/* -------------------------------------------------------------------------- */

export function useAdjustStock(orgId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ locationId, itemId, newQty }) => {
      if (!orgId) throw new Error('No organization profile found.')
      const safeQty = Math.max(0, newQty)
      return patchJson('/api/stock', {
        kind: 'level',
        locationId,
        itemId,
        qty: safeQty,
      })
    },
    // Optimistic update so the +/- button feels instant.
    onMutate: async ({ locationId, itemId, newQty }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stock.levels(orgId) })
      const prev = queryClient.getQueryData(queryKeys.stock.levels(orgId))
      queryClient.setQueryData(queryKeys.stock.levels(orgId), (old = []) =>
        old.map((s) =>
          s.locationId === locationId && s.itemId === itemId
            ? { ...s, qty: Math.max(0, newQty) }
            : s
        )
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKeys.stock.levels(orgId), ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.levels(orgId) })
    },
  })
}

export function useAddLocation(orgId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, code }) => {
      if (!orgId) throw new Error('No organization profile found.')
      return postJson('/api/stock', { kind: 'location', name, code })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.locations(orgId) })
    },
  })
}

export function useAddItem(orgId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, sku }) => {
      if (!orgId) throw new Error('No organization profile found.')
      return postJson('/api/stock', { kind: 'item', name, sku })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.items(orgId) })
    },
  })
}

export function useUpsertStockSettings(orgId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ locationId, itemId, qty, reorderLevel }) => {
      if (!orgId) throw new Error('No organization profile found.')
      return patchJson('/api/stock', {
        kind: 'level',
        locationId,
        itemId,
        qty,
        reorderLevel,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.levels(orgId) })
    },
  })
}


/* -------------------------------------------------------------------------- */
/*  Transfers                                                                 */
/* -------------------------------------------------------------------------- */

export function useTransfersList(orgId) {
  return useQuery({
    queryKey: queryKeys.transfers.list(orgId ?? '_none'),
    queryFn: () => fetchTransfers(orgId),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
    refetchInterval: orgId ? POLL_INTERVAL_MS : false,
  })
}

export function useExecuteTransfer(orgId) {
  const queryClient = useQueryClient()
  return useMutation({
    // Server-side atomic transfer: see /api/stock/transfer/route.ts.
    // The previous client-side RPC approach (3 separate Supabase
    // calls) ran the insert and the two updates without a transaction;
    // a failure between them left inventory and audit-log state
    // inconsistent. The new handler runs the insert + two updates in a
    // single Drizzle transaction (see /api/stock/transfer/route.ts).
    mutationFn: async ({ itemId, qty, fromLocation, toLocation }) => {
      if (!orgId) throw new Error('No organization profile found.')
      return postJson('/api/stock/transfer', {
        itemId,
        qty,
        fromLocationId: fromLocation,
        toLocationId: toLocation,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.list(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.levels(orgId) })
    },
  })
}
