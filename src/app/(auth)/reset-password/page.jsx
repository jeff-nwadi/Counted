'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { PasswordField } from '@/components/TextField'
import SubmitButton from '@/components/SubmitButton'
import FormAlert from '@/components/FormAlert'
import { authClient } from '@/lib/auth-client'
import { friendlyAuthError } from '@/lib/auth-errors'

/**
 * Password reset — destination for the link emailed by /forgot-password.
 *
 * Better Auth's reset link includes a `?token=…` query parameter.
 * The client posts `{ newPassword, token }` to /api/auth/reset-password.
 * On success, the user is signed in and redirected to /dashboard.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const search = useSearchParams()
  const token = search.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="font-display text-3xl text-ink">Link expired</h1>
        <p className="text-sm text-ink-2">
          This reset link is missing or has been used. Request a new one from
          the forgot-password page.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-sm text-brand font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Request a new link
        </Link>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setServerError('')

    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords don’t match.')
      return
    }

    setLoading(true)
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    })

    if (resetError) {
      setServerError(friendlyAuthError(resetError))
      setLoading(false)
      return
    }

    // Better Auth signs the user in as part of the reset. Hard
    // navigate so the dashboard layout re-reads the session cookie.
    setLoading(false)
    window.location.href = '/dashboard'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6">
        <KeyRound className="w-6 h-6 text-brand" />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-2">
        Choose a new{' '}
        <span className="italic text-brand">password.</span>
      </h1>
      <p className="text-sm text-ink-2 mb-8">
        Pick something you haven’t used before. At least 8 characters.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormAlert error={serverError} />

        <PasswordField
          label="New password"
          name="new-password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (error) setError('')
            if (serverError) setServerError('')
          }}
        />
        <PasswordField
          label="Confirm new password"
          name="confirm-password"
          placeholder="Type it again"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            if (error) setError('')
            if (serverError) setServerError('')
          }}
          error={error}
        />

        <SubmitButton loading={loading} loadingText="Updating password…">
          Update password
        </SubmitButton>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink mt-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to sign in
      </Link>
    </motion.div>
  )
}
