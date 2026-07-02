'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRequireUser } from '@/hooks/use-user'

/**
 * Reusable empty-state for the four routes that aren't built yet.
 * Each is a one-screen place holder so the sidebar nav doesn't 404.
 * Replace the body of each page with the real implementation as it
 * lands, in AGENTS.md Section 6 build order:
 *   1. Overview       ← done
 *   2. Ledger         ← pending
 *   3. Transfers      ← pending
 *   4. Mobile         ← pending
 *   5. Setup / import ← pending
 */
export default function PlaceholderPage({ eyebrow, title, blurb }) {
  // Guard just like the real dashboard pages — keeps the layout
  // consistent (loading spinner, redirect if no session).
  useRequireUser()

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted-foreground mb-1">{eyebrow}</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
        {title}
      </h1>
      <p className="text-sm text-ink-2 mt-2 leading-relaxed">{blurb}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8">
        <p className="text-sm text-ink-2">
          This screen is on the build list. It&rsquo;s wired into the sidebar
          now so you can navigate the rest of the app without 404s, and the
          data layer is staged in{' '}
          <code className="text-[12px] bg-slate px-1.5 py-0.5 rounded">
            drizzle/0000_*.sql
          </code>
          .
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink mt-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to overview
      </Link>
    </div>
  )
}
