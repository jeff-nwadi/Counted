'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/animate-ui/components/radix/alert-dialog'
import { TriangleAlert, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * OrgMissingDialog
 *
 * Auto-opens (no trigger) when the current user has no org profile linked.
 *
 * Two paths forward:
 *
 *  1. **Re-check** — calls the idempotent `ensure_my_org_and_profile()`
 *     RPC, which creates a fresh org + profile for the calling user if
 *     they're missing, or no-ops if they already exist. The dialog then
 *     invalidates the profile query, which forces `useOrg()` to refetch
 *     and (hopefully) flip to a valid `orgId`, dismissing the dialog.
 *     This is the path that fixes the common "I cleaned up the DB, why
 *     is this still showing" case.
 *
 *  2. **Sign out** — last resort. Re-registering a brand-new account is
 *     only necessary if the auth.users row itself is gone.
 */
export default function OrgMissingDialog({ open, onSignOut, userId }) {
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleRecheck() {
    setBusy(true)
    setError(null)
    try {
      // POST /api/org/ensure is idempotent: it returns the existing
      // orgId or creates a fresh org + profile for the caller.
      const res = await fetch('/api/org/ensure', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      // Invalidate the profile query so `useOrg()` re-runs and resolves
      // to a real org. invalidateQueries (not refetchQueries) lets the
      // dashboard re-render in a single pass with the fresh data.
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      // The dialog will close itself on the next render once orgId is
      // non-null, but if anything went sideways we reset busy so the
      // user can click again.
    } catch (err) {
      setError(err?.message ?? 'Failed to re-check organization profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        from="top"
        className="bg-white rounded-2xl border border-border shadow-[0_24px_80px_rgba(0,0,0,0.14)] p-0 overflow-hidden max-w-md"
      >
        {/* Gradient header strip */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-6 pt-6 pb-5 border-b border-amber-100">
          <AlertDialogHeader className="gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
              <TriangleAlert className="w-5 h-5 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-base font-semibold text-ink leading-snug">
              No Organization Profile Linked
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-ink-2 leading-relaxed font-sans">
              Your account is signed in but is not linked to any storefront
              organization. This usually means the database trigger that
              creates your profile on sign-up didn&apos;t run, or the profile
              was removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Steps — Re-check is the primary action now, not sign-out. */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">
            How to fix this
          </p>
          <ol className="flex flex-col gap-2">
            {[
              'Click "Re-check" — we\'ll create your organization profile automatically.',
              'If that doesn\'t work, sign out and sign back in to refresh the session.',
              'Last resort: register a new account with a different email address.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[13px] text-ink-2 leading-relaxed font-sans">{step}</span>
              </li>
            ))}
          </ol>

          {error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onSignOut}
            disabled={busy}
            className="text-sm font-medium text-ink-2 hover:text-ink px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            Sign out
          </button>
          <button
            type="button"
            onClick={handleRecheck}
            disabled={busy}
            aria-busy={busy || undefined}
            className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
            {busy ? 'Re-checking…' : 'Re-check'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
