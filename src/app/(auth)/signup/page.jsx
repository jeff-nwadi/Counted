'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { TextField, PasswordField } from '@/components/TextField'
import SubmitButton from '@/components/SubmitButton'
import { Button } from '@/components/animate-ui/components/buttons/button'
import FormAlert from '@/components/FormAlert'
import { supabase } from '@/lib/supabase'
import { friendlyAuthError } from '@/lib/auth-errors'

// Returns a score 0–4 and the meta describing it.
function passwordStrength(pwd) {
  if (!pwd) return { score: 0, label: 'Too short', tone: 'bg-border' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (pwd.length >= 12) score++

  if (score <= 1) return { score, label: 'Weak', tone: 'bg-red-400' }
  if (score === 2) return { score, label: 'Fair', tone: 'bg-amber-400' }
  if (score === 3) return { score, label: 'Good', tone: 'bg-lime-500' }
  return { score, label: 'Strong', tone: 'bg-green-500' }
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const strength = useMemo(() => passwordStrength(password), [password])

  function validate() {
    const next = {}
    if (!name.trim()) next.name = 'Tell us your name.'
    if (!email) next.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'That email doesn’t look right.'
    if (!password) next.password = 'Pick a password.'
    else if (password.length < 8) next.password = 'Use at least 8 characters.'
    if (!terms) next.terms = 'Please accept the terms to continue.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setServerError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        // Where Supabase sends the user after they click the confirmation link.
        // Must be added to Supabase Auth → URL Configuration's allow-list.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setServerError(friendlyAuthError(error))
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-start gap-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-bg flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-ink leading-tight mb-2">
              Your account is ready.
            </h1>
            <p className="text-sm text-ink-2 leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="font-medium text-ink">{email}</span>. Click it any time
              in the next 30 minutes to finish setup. (We won’t keep emailing — promise.)
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Button asChild>
              <Link
                href="/login"
                className="inline-flex items-center justify-center"
              >
                Back to sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-ink-3 hover:text-ink-2 py-2 h-auto"
              onClick={() => {
                setSubmitted(false)
                setPassword('')
              }}
            >
              Use a different email
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
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
            Start your{' '}
            <span className="italic text-brand">14&#8209;day</span>{' '}
            free trial.
          </h1>
          <p className="text-sm text-ink-2 mb-8">
            No credit card. Set up your first shop in under five minutes.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormAlert error={serverError} />

            <TextField
              label="Your name"
              name="name"
              icon="user"
              placeholder="Sam Patel"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (serverError) setServerError('')
              }}
              error={errors.name}
            />
            <TextField
              label="Work email"
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
            <div>
              <PasswordField
                label="Password"
                name="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (serverError) setServerError('')
                }}
                error={errors.password}
              />
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${strength.tone}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.score / 4) * 100}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-ink-3 min-w-[44px] text-right">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border text-brand focus:ring-2 focus:ring-brand/30 accent-brand"
                aria-invalid={!!errors.terms}
              />
              <span className="text-xs text-ink-2 leading-relaxed">
                I agree to the{' '}
                <Link href="#" className="text-brand font-medium hover:text-brand-dark">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-brand font-medium hover:text-brand-dark">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-red-600 -mt-2">{errors.terms}</p>
            )}

            <SubmitButton loading={loading} loadingText="Creating your account…">
              Create account
            </SubmitButton>
          </form>

          <p className="text-sm text-ink-2 text-center mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-brand font-medium hover:text-brand-dark transition-colors"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-ink-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cancel any time. Your data exports as CSV.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
