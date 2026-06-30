/**
 * Translate Supabase auth errors into messages that are honest and useful
 * for a non-technical small-business owner.
 *
 * The default branch is the raw error message — Supabase already gives
 * reasonable English on its own. The overrides are for cases where the
 * default message is either too technical or actively misleading.
 */
export function friendlyAuthError(error) {
  if (!error) return ''

  const msg = (error.message || '').toLowerCase()

  // Sign-in failures
  if (msg.includes('invalid login credentials')) {
    return 'That email and password don’t match. Try again, or reset your password below.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Your account is created but you haven’t confirmed the email yet. Check your inbox for the link from us.'
  }
  if (msg.includes('user not found')) {
    return 'We can’t find an account with that email.'
  }

  // Sign-up failures
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'An account with that email already exists. Try signing in instead.'
  }
  if (msg.includes('password should be at least')) {
    return 'Your password is too short. Use at least 8 characters.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts in a short window. Wait a minute and try again.'
  }

  // Reset-password failures
  if (msg.includes('for security purposes')) {
    return 'For security, please wait a moment before requesting another link.'
  }

  // Network / generic
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network problem — check your connection and try again.'
  }

  return error.message
}
