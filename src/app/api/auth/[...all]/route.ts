import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

/**
 * Better Auth catch-all route handler.
 *
 * Mounting at `/api/auth/[...all]` lets Better Auth answer every
 * `/api/auth/sign-in/email`, `/api/auth/sign-up/email`,
 * `/api/auth/get-session`, etc. without us writing per-endpoint routes.
 */
export const { GET, POST } = toNextJsHandler(auth)
