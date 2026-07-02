/**
 * Centralized query keys.
 *
 * Every cache entry in the app should be reachable through one of these
 * factories. That way an `invalidateQueries` call from a Supabase realtime
 * payload (or a mutation) hits the right slice without anyone having to
 * remember the literal key string at the call site.
 *
 * Pattern: each domain has a `all` factory, then `lists`, `details`, and
 * any other variant. Detail keys always start with the list key so we
 * can invalidate an entire table by passing `queryKeys.stock.all(orgId)`.
 */
export const queryKeys = {
  session: {
    all: () => ['session'],
    current: () => ['session', 'current'],
  },
  profile: {
    all: (userId) => ['profile', userId],
    org: (userId) => ['profile', userId, 'org'],
  },
  stock: {
    all: (orgId) => ['stock', orgId],
    locations: (orgId) => ['stock', orgId, 'locations'],
    items: (orgId) => ['stock', orgId, 'items'],
    levels: (orgId) => ['stock', orgId, 'levels'],
  },
  transfers: {
    all: (orgId) => ['transfers', orgId],
    list: (orgId) => ['transfers', orgId, 'list'],
  },
}
