'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Inbox, CheckCircle2 } from 'lucide-react'
import { TextField } from '@/components/TextField'
import SubmitButton from '@/components/SubmitButton'
import FormAlert from '@/components/FormAlert'
import { supabase } from '@/lib/supabase'
import { friendlyAuthError } from '@/lib/auth-errors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate() {
    if (!email) return 'Enter the email tied to your account.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'That email doesn’t look right.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    setServerError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      }
    )

    if (authError) {
      setServerError(friendlyAuthError(authError))
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
          key="sent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-start gap-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-bg flex items-center justify-center">
            <Inbox className="w-6 h-6 text-green" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-ink leading-tight mb-2">
              Check your inbox.
            </h1>
            <p className="text-sm text-ink-2 leading-relaxed">
              If an account exists for{' '}
              <span className="font-medium text-ink">{email}</span>, we just sent a
              reset link. It expires in 30 minutes.
            </p>
          </div>

          <ul className="text-xs text-ink-3 leading-relaxed flex flex-col gap-1.5 bg-slate rounded-xl p-4 w-full">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green mt-0.5 shrink-0" />
              <span>Open the link on the same device you use to sign in.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green mt-0.5 shrink-0" />
              <span>Didn’t get it? Check spam, or wait a minute and try again.</span>
            </li>
          </ul>

          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false)
                setEmail('')
              }}
              className="text-sm text-brand font-medium hover:text-brand-dark py-2 text-center"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white border border-border text-ink text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
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
            Forgot your{' '}
            <span className="italic text-brand">password?</span>
          </h1>
          <p className="text-sm text-ink-2 mb-8">
            Enter your email and we’ll send a reset link. Takes about 30 seconds.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                if (error) setError('')
                if (serverError) setServerError('')
              }}
              error={error}
            />

            <SubmitButton loading={loading} loadingText="Sending link…">
              Send reset link
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
      )}
    </AnimatePresence>
  )
}
