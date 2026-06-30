import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Auth callback route.
 *
 * Supabase emails (signup confirmation, password reset) link here with
 * a one-time `?code=...` query parameter. We exchange that code for a
 * session cookie, then redirect to the next page (or /dashboard).
 *
 * The signup form sets `emailRedirectTo=${origin}/auth/callback`.
 * The forgot-password form sets
 *   `redirectTo=${origin}/auth/callback?next=/reset-password`
 * so a reset user lands on a page where they can enter a new password.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // `set` is unsupported in a Server Component context. This
              // route is a Route Handler, so it works — the try/catch is
              // a safety net for when someone refactors this later.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If the code is missing or invalid, send the user back to sign in
  // with a marker so the page can show a useful message.
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
