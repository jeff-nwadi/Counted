import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

/**
 * Drizzle client over the Neon serverless driver.
 *
 * ## Why neon-serverless (Pool) and not neon-http
 *
 * The first iteration of this file used `drizzle-orm/neon-http` (the
 * one-statement-per-request HTTP fetcher). It worked for reads and
 * single-row writes, but the **transfer route needs a real
 * transaction** — the insert into `transfers` and the two updates
 * to `stock_levels` must be atomic, or a partial failure leaves
 * inventory and the audit log out of sync. The neon-http driver
 * explicitly does not support `db.transaction(...)`:
 *
 *   > "No transactions support in neon-http driver"
 *
 * (Runtime error, surfaced from `/api/stock/transfer`.)
 *
 * The `neon-serverless` Drizzle driver wraps a `Pool` from
 * `@neondatabase/serverless`. The Pool supports transactions. We
 * configure it to run queries over HTTP (via `poolQueryViaFetch`)
 * rather than WebSockets, so we get transactional semantics without
 * keeping a long-lived WS connection per server instance — same
 * cold-start-friendly behavior as neon-http, just with transactions.
 *
 * ## Vercel / serverless notes
 *
 * `fetchConnectionCache` is always on in `@neondatabase/serverless`
 * 1.x; the previous setting here is a no-op. The Pool reuses a
 * single HTTPS connection across the requests in a serverless
 * invocation, then drops it when the function ends. No state
 * bleeds between users.
 *
 * ## This module is SERVER-ONLY
 *
 * Importing it from a client component would try to read
 * `process.env.DATABASE_URL` in the browser and fail.
 */

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add it to .env.local before starting the app.'
  )
}

// Run all Pool queries through the same HTTP fetcher neon-http uses,
// instead of opening a WebSocket per server instance. This is the
// mode that makes the Pool behave like neon-http for connection
// management, but with full SQL transaction support underneath.
neonConfig.poolQueryViaFetch = true

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })

export type Db = typeof db
