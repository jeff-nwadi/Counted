import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from './auth'
import { db } from './db/client'
import { orgs, profiles } from './db/schema'

/**
 * Reads the Better Auth session cookie from the request and returns
 * the user's `orgId`, creating one idempotently if a user somehow
 * signed up before the `databaseHooks.user.create.after` ran.
 *
 * Returns `null` when there is no valid session — the caller should
 * respond with 401 in that case.
 *
 * Why not just `auth.api.getSession`? That tells us *who* the user is
 * but not what org they belong to. We need both: a missing profile is
 * the trigger for the `OrgMissingDialog` UI, not a hard 401.
 */
export async function getOrgId(request: NextRequest): Promise<{
  userId: string
  orgId: string
} | null> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.id) return null

  // Fast path: profile already exists.
  const [profile] = await db
    .select({ orgId: profiles.orgId })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1)

  if (profile?.orgId) {
    return { userId: session.user.id, orgId: profile.orgId }
  }

  // Backfill path: the signup hook didn't run (e.g. partial deploy).
  // Create org + profile here so the user's next request has a valid
  // orgId. This replaces the old `ensure_my_org_and_profile` RPC.
  const [org] = await db
    .insert(orgs)
    .values({ name: session.user.name?.trim() || 'My Store' })
    .returning({ id: orgs.id })

  await db.insert(profiles).values({
    userId: session.user.id,
    orgId: org.id,
    fullName: session.user.name ?? null,
    role: 'owner',
  })

  return { userId: session.user.id, orgId: org.id }
}
