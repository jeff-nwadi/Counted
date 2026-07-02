'use client'

import { createAuthClient } from 'better-auth/react'

/**
 * Better Auth — browser client.
 *
 * Same base URL as the server. The client posts to /api/auth/* which
 * the catch-all route handler (`src/app/api/auth/[...all]/route.ts`)
 * routes into the Better Auth handler.
 *
 * Add plugins here as you add them to the server config (e.g. twoFactor,
 * organization, passkey).
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
