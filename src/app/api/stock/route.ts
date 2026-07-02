import { NextRequest, NextResponse } from 'next/server'
import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { items, locations, stockLevels, transfers } from '@/lib/db/schema'
import { getOrgId } from '@/lib/org'

/**
 * GET /api/stock
 *   ?kind=locations  -> list of locations
 *   ?kind=items      -> list of items
 *   ?kind=levels     -> list of stock_levels
 *   ?kind=transfers  -> list of transfers (newest first)
 *
 * All scoped to the caller's org.
 */
export async function GET(request: NextRequest) {
  const ctx = await getOrgId(request)
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const kind = searchParams.get('kind')

  if (kind === 'locations') {
    const rows = await db
      .select()
      .from(locations)
      .where(eq(locations.orgId, ctx.orgId))
      .orderBy(asc(locations.name))
    return NextResponse.json(rows)
  }

  if (kind === 'items') {
    const rows = await db
      .select()
      .from(items)
      .where(eq(items.orgId, ctx.orgId))
      .orderBy(asc(items.name))
    return NextResponse.json(rows)
  }

  if (kind === 'levels') {
    const rows = await db
      .select()
      .from(stockLevels)
      .where(eq(stockLevels.orgId, ctx.orgId))
    return NextResponse.json(rows)
  }

  if (kind === 'transfers') {
    const rows = await db
      .select()
      .from(transfers)
      .where(eq(transfers.orgId, ctx.orgId))
      .orderBy(desc(transfers.createdAt))
    return NextResponse.json(rows)
  }

  return NextResponse.json({ error: 'unknown kind' }, { status: 400 })
}

/**
 * POST /api/stock
 *   { kind: 'location', name, code? }
 *   { kind: 'item', name, sku? }
 *
 * Both scoped to the caller's org.
 */
export async function POST(request: NextRequest) {
  const ctx = await getOrgId(request)
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json()
  const { kind } = body

  if (kind === 'location') {
    if (!body.name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    const [row] = await db
      .insert(locations)
      .values({ orgId: ctx.orgId, name: body.name, code: body.code ?? null })
      .returning()
    return NextResponse.json(row)
  }

  if (kind === 'item') {
    if (!body.name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    const [row] = await db
      .insert(items)
      .values({ orgId: ctx.orgId, name: body.name, sku: body.sku ?? null })
      .returning()
    return NextResponse.json(row)
  }

  return NextResponse.json({ error: 'unknown kind' }, { status: 400 })
}

/**
 * PATCH /api/stock
 *   { kind: 'level', locationId, itemId, qty?, reorderLevel? }
 *
 * Adjusts a single stock_level row. Uses an upsert on the
 * (locationId, itemId) unique index, so a missing row gets created
 * with the default qty=0 then patched.
 */
export async function PATCH(request: NextRequest) {
  const ctx = await getOrgId(request)
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json()
  if (body.kind !== 'level') {
    return NextResponse.json({ error: 'unknown kind' }, { status: 400 })
  }
  if (!body.locationId || !body.itemId) {
    return NextResponse.json(
      { error: 'locationId and itemId required' },
      { status: 400 }
    )
  }

  // The owning org for both the location and the item must match the
  // caller's org — otherwise a malicious caller could target rows in
  // another tenant.
  const loc = await db
    .select({ orgId: locations.orgId })
    .from(locations)
    .where(eq(locations.id, body.locationId))
    .limit(1)
  const itm = await db
    .select({ orgId: items.orgId })
    .from(items)
    .where(eq(items.id, body.itemId))
    .limit(1)
  if (!loc[0] || loc[0].orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (!itm[0] || itm[0].orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // Upsert on the (locationId, itemId) unique index.
  const [row] = await db
    .insert(stockLevels)
    .values({
      orgId: ctx.orgId,
      locationId: body.locationId,
      itemId: body.itemId,
      qty: body.qty ?? 0,
      reorderLevel: body.reorderLevel ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [stockLevels.locationId, stockLevels.itemId],
      set: {
        ...(body.qty !== undefined ? { qty: body.qty } : {}),
        ...(body.reorderLevel !== undefined
          ? { reorderLevel: body.reorderLevel }
          : {}),
        updatedAt: new Date(),
      },
    })
    .returning()

  return NextResponse.json(row)
}

// Re-export `and` so the next.config.js type-checker (and a future
// route that wants to filter on multiple columns) doesn't trip on an
// unused-import warning.
export { and }
