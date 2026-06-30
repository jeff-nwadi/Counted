'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Single Supabase client instance for the browser.
 *
 * Source of truth per AGENTS.md Section 7 — never re-instantiate elsewhere.
 * We read the publishable key (not the legacy anon key) because that's what
 * your Supabase project is configured for. The new-format key still works
 * with `createBrowserClient` because the SDK treats it as an anon-tier key.
 *
 * Server-side operations (admin writes, RLS-bypassing reads) belong in a
 * separate `createServerClient` instance under `src/lib/supabase-server.js`
 * — out of scope for this step.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)
