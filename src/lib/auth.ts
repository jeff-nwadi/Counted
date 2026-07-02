import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from './db/client'
import * as schema from './db/schema'

/**
 * Better Auth — server-side configuration.
 *
 * - `drizzleAdapter` connects Better Auth's user/session/account/
 *   verification tables to our Drizzle instance.
 * - `emailAndPassword` is on, with `autoSignIn: true` so a successful
 *   signup immediately establishes a session (no email verification in
 *   this pass — the user can flip that on later by adding the
 *   `emailVerification.sendVerificationEmail` handler).
 * - `databaseHooks.user.create.after` replaces the old Postgres
 *   `handle_new_user` trigger: on every new user we create a fresh
 *   `orgs` row and a `profiles` row in the same transaction. The user
 *   lands on /dashboard with a valid orgId, so the application-layer
 *   `where eq(orgId, …)` scoping works from the first request.
 * - `nextCookies` is required so Better Auth's set/clear cookie
 *   helpers work inside Next.js route handlers and server actions.
 */
export const auth = betterAuth({
  appName: 'Counted',
  // Use the public URL the browser actually talks to. We set this
  // explicitly so Better Auth's CSRF/origin check matches the Origin
  // header on requests. Without it, Better Auth falls back to the
  // request's Host header, which can disagree with NEXT_PUBLIC_BETTER_AUTH_URL
  // when the env var and the actual dev URL differ (e.g. http vs https).
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  // Origins the browser is allowed to call /api/auth/* from. Anything
  // not in this list gets rejected with "Invalid origin" before the
  // auth handler runs. We list both http and https localhost so the
  // dev URL can switch between them without a config change.
  trustedOrigins: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Best-effort org name from the user's display name; falls
          // back to "My Store" if signUp didn't pass a name.
          const orgName = (user.name && user.name.trim()) || 'My Store'

          // Insert org then profile. Using a sub-transaction isn't
          // necessary because Better Auth's adapter wraps the hook in
          // the same transaction as the user insert — a throw here
          // rolls back the user too.
          const [org] = await db
            .insert(schema.orgs)
            .values({ name: orgName })
            .returning({ id: schema.orgs.id })

          await db.insert(schema.profiles).values({
            userId: user.id,
            orgId: org.id,
            fullName: user.name ?? null,
            role: 'owner',
          })
        },
      },
    },
  },
  advanced: {
    // Same cookie name across dev/prod so proxy.js can check for a
    // single, well-known name.
    cookiePrefix: 'counted',
  },
  plugins: [nextCookies()],
})

export type Auth = typeof auth
