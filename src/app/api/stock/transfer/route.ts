import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { items, locations, stockLevels, transfers } from '@/lib/db/schema'
import { getOrgId } from '@/lib/org'

/**
 * POST /api/stock/transfer
 *   { itemId, qty, fromLocationId, toLocationId }
 *
 * Atomically: insert a transfers row, decrement the from-location
 * stock_level, increment the to-location stock_level. Replaces the
 * old `transfer_stock` Postgres RPC.
 *
 * The whole thing runs in a single Drizzle transaction (`db.transaction`)
 * so a partial transfer is never visible.
 */
export async function POST(request: NextRequest) {
  const ctx = await getOrgId(request)
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json()
  const { itemId, qty, fromLocationId, toLocationId } = body

  if (!itemId || !qty || !fromLocationId || !toLocationId) {
    return NextResponse.json(
      { error: 'itemId, qty, fromLocationId, toLocationId required' },
      { status: 400 }
    )
  }
  if (fromLocationId === toLocationId) {
    return NextResponse.json(
      { error: 'from and to locations must differ' },
      { status: 400 }
    )
  }
  if (qty <= 0) {
    return NextResponse.json({ error: 'qty must be positive' }, { status: 400 })
  }

  // Verify the item and both locations belong to the caller's org
  // *before* opening the transaction — saves a wasted round-trip on
  // a forbidden request.
  const [item] = await db
    .select({ orgId: items.orgId })
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1)
  if (!item || item.orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const fromLoc = await db
    .select({ orgId: locations.orgId })
    .from(locations)
    .where(eq(locations.id, fromLocationId))
    .limit(1)
  if (!fromLoc[0] || fromLoc[0].orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const toLoc = await db
    .select({ orgId: locations.orgId })
    .from(locations)
    .where(eq(locations.id, toLocationId))
    .limit(1)
  if (!toLoc[0] || toLoc[0].orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Record the transfer (append-only history).
      const [tr] = await tx
        .insert(transfers)
        .values({
          orgId: ctx.orgId,
          itemId,
          fromLocationId,
          toLocationId,
          qty,
        })
        .returning()

      // Decrement the from-location row. `FOR UPDATE`-equivalent in
      // Drizzle is `for("update")`; we use a single UPDATE with a
      // RETURNING and check the returned qty. If the row doesn't
      // exist, this throws — caller sees a 400.
      const fromUpdate = await tx
        .update(stockLevels)
        .set({ qty: sql`${stockLevels.qty} - ${qty}`, updatedAt: new Date() })
        .where(
          sql`${stockLevels.locationId} = ${fromLocationId}
              and ${stockLevels.itemId} = ${itemId}
              and ${stockLevels.orgId} = ${ctx.orgId}
              and ${stockLevels.qty} >= ${qty}`
        )
        .returning({ id: stockLevels.id })

      if (fromUpdate.length === 0) {
        // Either the from-row doesn't exist or it has insufficient
        // stock. Throw to roll back the transfer insert.
        throw new Error('insufficient stock at source location')
      }

      // Increment the to-location row, creating it if missing.
      await tx
        .insert(stockLevels)
        .values({
          orgId: ctx.orgId,
          locationId: toLocationId,
          itemId,
          qty,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [stockLevels.locationId, stockLevels.itemId],
          set: {
            qty: sql`${stockLevels.qty} + ${qty}`,
            updatedAt: new Date(),
          },
        })

      return tr
    })

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'transfer failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
