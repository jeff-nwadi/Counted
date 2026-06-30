'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@/components/animate-ui/components/radix/alert-dialog'
import { TriangleAlert } from 'lucide-react'

/**
 * OrgMissingDialog
 *
 * Auto-opens (no trigger) when the current user has no org profile linked.
 * Uses animate-ui's AlertDialog with its animated entry/exit.
 *
 * Props:
 *   open      boolean   – whether to show the dialog (pass `!orgId && !loading`)
 *   onSignOut fn        – called when the user clicks "Sign Out & Re-register"
 */
export default function OrgMissingDialog({ open, onSignOut }) {
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
              Your account is signed in but is not linked to any storefront organization.
              This happens when an account was created before the database schema/triggers
              were fully applied.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Steps */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">
            How to fix this
          </p>
          <ol className="flex flex-col gap-2">
            {[
              'Sign out of this session.',
              'Register a new account with a different email address.',
              'The Postgres trigger will automatically create your organization profile.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[13px] text-ink-2 leading-relaxed font-sans">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <AlertDialogFooter className="px-6 pb-6 pt-2 flex justify-end gap-2">
          <AlertDialogAction
            onClick={onSignOut}
            className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            Sign Out &amp; Re-register
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
