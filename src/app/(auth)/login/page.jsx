'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { TextField, PasswordField } from '@/components/TextField'
import SubmitButton from '@/components/SubmitButton'
import FormAlert from '@/components/FormAlert'
import { supabase } from '@/lib/supabase'
import { friendlyAuthError } from '@/lib/auth-errors'
import Logo from '@/components/Logo'

// Map `?reason=...` query values to user-facing messages. Shown above
// the form when the user arrives at /login via a redirect from elsewhere
// (inactivity, server-side sign-out, etc.).
const REASON_MESSAGES = {
  inactivity:
    'You were signed out after 24 hours of inactivity. Sign in again to continue.',
  'session-ended':
    'Your session ended. Sign in again to continue.',
}

/**
 * Default export — thin wrapper that satisfies the useSearchParams()
 * Suspense requirement for static prerendering. The actual form is in
 * <LoginForm />, which is the only piece that touches the URL query.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  )
}

// Skeleton shown while the URL params are being read. Mirrors the form's
// vertical rhythm so there's no layout shift when the real form mounts.
function LoginFormFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-2 mb-8 md:hidden">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-sans font-bold text-sm">
          C
        </div>
        <span className="font-sans font-semibold text-[17px] tracking-tight text-ink">
          Counted
        </span>
      </div>
      <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-2">
        Welcome{' '}
        <span className="italic text-brand">back.</span>
      </h1>
      <p className="text-sm text-ink-2 mb-8">Loading sign-in…</p>
    </motion.div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const search = useSearchParams()
  const reason = search.get('reason')
  const reasonMessage = reason ? REASON_MESSAGES[reason] : null

  function validate() {
    const next = {}
    if (!email) next.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'That email doesn’t look right.'
    if (!password) next.password = 'Enter your password.'
    else if (password.length < 6) next.password = 'At least 6 characters, please.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setServerError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setServerError(friendlyAuthError(error))
      setLoading(false)
      return
    }

    // Hard navigate so the server layout re-reads the new session cookie
    // before the dashboard's first render — otherwise a guarded redirect
    // can flash through to /dashboard and bounce back to /login.
    window.location.href = '/dashboard'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Mobile-only logo (desktop brand panel already shows it) */}
      <div className="mb-8 md:hidden">
        <Logo href="/" size={32} />
      </div>

      <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-2">
        Welcome{' '}
        <span className="italic text-brand">back.</span>
      </h1>
      <p className="text-sm text-ink-2 mb-8">
        Sign in to manage live inventory across your shops.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {reasonMessage && (
          <div
            role="status"
            className="flex items-start gap-2.5 text-sm rounded-xl border px-3.5 py-2.5 bg-amber-50 text-amber-800 border-amber-200"
          >
            <span className="leading-relaxed">{reasonMessage}</span>
          </div>
        )}
        <FormAlert error={serverError} />

        <TextField
          label="Email"
          type="email"
          name="email"
          icon="mail"
          placeholder="you@yourshop.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (serverError) setServerError('')
          }}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (serverError) setServerError('')
          }}
          error={errors.password}
        />

        <div className="flex items-center justify-between -mt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-border text-brand focus:ring-2 focus:ring-brand/30 focus:ring-offset-0 accent-brand"
            />
            <span className="text-sm text-ink-2">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-brand font-medium hover:text-brand-dark transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading} loadingText="Signing you in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="text-sm text-ink-2 text-center mt-6">
        New to Counted?{' '}
        <Link
          href="/signup"
          className="text-brand font-medium hover:text-brand-dark transition-colors"
        >
          Create an account
        </Link>
      </p>

      <p className="text-[11px] text-ink-3 text-center mt-8 leading-relaxed">
        By signing in you agree to our{' '}
        <Link href="#" className="underline hover:text-ink-2">Terms</Link> and{' '}
        <Link href="#" className="underline hover:text-ink-2">Privacy Policy</Link>.
      </p>
    </motion.div>
  )
}
