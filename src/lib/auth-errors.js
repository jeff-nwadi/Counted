/**
 * Translate Better Auth errors into messages that are honest and useful
 * for a non-technical small-business owner.
 *
 * Better Auth errors have a stable `code` (e.g. `USER_ALREADY_EXISTS`)
 * and a human-readable `message`. We branch on the code where it's
 * stable, and fall back to message-substring matching for the codes
 * that vary between Better Auth versions.
 */
export function friendlyAuthError(error) {
  if (!error) return ''

  // Better Auth's `code` is the stable identifier. `message` is
  // user-readable but subject to change between versions.
  const code = (error.code || '').toString().toUpperCase()
  const msg = (error.message || '').toLowerCase()

  // Sign-in failures
  if (code === 'INVALID_EMAIL_OR_PASSWORD' || msg.includes('invalid email or password')) {
    return 'That email and password don’t match. Try again, or reset your password below.'
  }
  if (code === 'USER_NOT_FOUND' || msg.includes('user not found')) {
    return 'We can’t find an account with that email.'
  }
  if (code === 'EMAIL_NOT_VERIFIED' || msg.includes('email not verified')) {
    return 'Your account is created but you haven’t confirmed the email yet. Check your inbox for the link from us.'
  }

  // Sign-up failures
  if (code === 'USER_ALREADY_EXISTS' || msg.includes('already exists') || msg.includes('already registered')) {
    return 'An account with that email already exists. Try signing in instead.'
  }
  if (code === 'PASSWORD_TOO_SHORT' || msg.includes('password is too short') || msg.includes('at least')) {
    return 'Your password is too short. Use at least 8 characters.'
  }
  if (code === 'INVALID_EMAIL' || msg.includes('invalid email')) {
    return 'That email doesn’t look right. Check the spelling and try again.'
  }

  // Rate limiting
  if (code === 'RATE_LIMITED' || msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts in a short window. Wait a minute and try again.'
  }
  if (msg.includes('for security purposes')) {
    return 'For security, please wait a moment before requesting another link.'
  }

  // Network / generic
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Network problem — check your connection and try again.'
  }

  return error.message
}
