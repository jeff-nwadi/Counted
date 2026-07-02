import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import { orgs, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/org/ensure
 *
 * Returns the caller's existing `orgId`, or `null` if the user is
 * signed in but has no profile yet. **Does not create** a profile —
 * that's the signup-hook's job (see `databaseHooks.user.create.after`
 * in `src/lib/auth.ts`). A pure read for the dashboard's initial
 * mount; using GET means it caches naturally and won't trip a 405
 * from the TanStack Query fetcher that calls it without a method.
 *
 * Returns `null` (not a 404) for "no profile" so the client can
 * distinguish "signed out" (401) from "signed in, no org" (200 + null)
 * without parsing error codes.
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [profile] = await db
    .select({ orgId: profiles.orgId })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1)

  if (profile?.orgId) {
    return NextResponse.json({ orgId: profile.orgId })
  }
  return NextResponse.json({ orgId: null })
}

/**
 * POST /api/org/ensure
 *
 * Idempotent: if the caller already has a profile, returns the
 * existing org_id. Otherwise creates an org and a profile row.
 *
 * Replaces the old `ensure_my_org_and_profile` Supabase RPC. Unlike
 * the RPC, we don't need SECURITY DEFINER because the Better Auth
 * session cookie tells us who the caller is — there's no way to
 * forge a session.
 *
 * Kept as POST because it has a side effect (creating rows on
 * cache-miss). The OrgMissingDialog's "Re-check" button uses this
 * endpoint; the initial dashboard load uses GET.
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  const [existing] = await db
    .select({ orgId: profiles.orgId })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (existing?.orgId) {
    return NextResponse.json({ orgId: existing.orgId })
  }

  const [org] = await db
    .insert(orgs)
    .values({ name: session.user.name?.trim() || 'My Store' })
    .returning({ id: orgs.id })

  await db.insert(profiles).values({
    userId,
    orgId: org.id,
    fullName: session.user.name ?? null,
    role: 'owner',
  })

  return NextResponse.json({ orgId: org.id })
}
