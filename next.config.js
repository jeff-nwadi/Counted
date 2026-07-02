/** @type {import('next').NextConfig} */

/**
 * Counted — security headers (see I-3 in the security audit).
 *
 * Headers applied:
 *   - Content-Security-Policy: default-deny everything, then allow
 *     only the origins we actually use. Inline styles + scripts are
 *     needed because of Tailwind, Next.js devtools, and Framer
 *     Motion's runtime styles. If we can move to a fully nonce-
 *     based CSP later, the `'unsafe-inline'` on script-src can go.
 *   - X-Frame-Options: DENY — the app must never be embedded in an
 *     iframe (clickjacking).
 *   - X-Content-Type-Options: nosniff — prevents MIME-type sniffing,
 *     blocks JSON responses from being interpreted as HTML/JS.
 *   - Referrer-Policy: strict-origin-when-cross-origin — sends the
 *     full referrer to same-origin, just the origin to cross-origin,
 *     nothing to downgraded HTTP.
 *   - Permissions-Policy: deny camera/mic/geolocation/etc. The app
 *     doesn't need any of these; explicitly denying them prevents
 *     a future feature from accidentally requesting them.
 *   - Strict-Transport-Security: only over HTTPS, max-age 2 years,
 *     include subdomains, eligible for preload. (Browsers ignore
 *     this over HTTP, which is fine.)
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js dev tools and Framer Motion need inline scripts in
      // dev. In prod, `next/script` with the nonce strategy is the
      // way to drop 'unsafe-inline' here.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      // Better Auth (same-origin /api/auth/*) and Neon (server-side
      // only — the browser never talks to it directly). No realtime
      // gateways anymore.
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
    ].join(', '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes. The /api routes are inherited from app
        // dir, but the catch-all `/:path*` here covers the marketing
        // page and the auth routes too.
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
