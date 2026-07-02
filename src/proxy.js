import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Server-side session check for the dashboard.
 *
 * Replaces the old Supabase cookie-name string match. We now call
 * Better Auth's `getSession` helper, which reads the session cookie,
 * looks up the session in the DB, and returns the full session object
 * (or null). A round-trip per dashboard request is fine on the v1
 * scale; if it becomes a bottleneck we can switch to a cookie-only
 * check (Better Auth signs the cookie).
 *
 * The dashboard subtree is the only thing this proxy protects. The
 * landing page, auth routes, and API routes are all public.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('reason', 'session-ended')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

/**
 * Only run middleware on the dashboard subtree. Running it on every
 * request would add unnecessary overhead and could break Stripe
 * callbacks, OAuth providers, etc. that need their own cookie
 * handling.
 */
export const config = {
  matcher: ['/dashboard/:path*'],
}
