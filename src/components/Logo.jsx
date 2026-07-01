// Custom brand mark for Counted. Two variants share the same visual
// language (rounded square container, consistent stroke weight, brand
// color) so they can be swapped by size without losing recognition.
//
//   <Logo variant="mark" size={32} />    — navbar, footer, dashboard
//   <Logo variant="mono" size={40} />    — favicon, avatars, signup
//   <Logo variant="lockup" />            — wordmark + mark in a row
//
// `variant="lockup"` is the navbar default — it pairs the mark with
// the "Counted" wordmark so users see the brand name clearly.

import Link from 'next/link'

/**
 * The "stack" mark. Three horizontal bars of decreasing width, with
 * the bottom bar slightly offset right — reads as inventory on a shelf
 * being counted down. Uses an even stroke and a 1.5px grid.
 */
function MarkSVG({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-brand" />
      {/* Bar 1 — full width, top */}
      <rect x="8" y="9" width="16" height="3" rx="1.5" fill="white" />
      {/* Bar 2 — medium, middle */}
      <rect x="8" y="14.5" width="12" height="3" rx="1.5" fill="white" opacity="0.85" />
      {/* Bar 3 — short, bottom, offset right to imply flow */}
      <rect x="11" y="20" width="8" height="3" rx="1.5" fill="white" opacity="0.7" />
    </svg>
  )
}

/**
 * The monogram. A stylized "C" formed by a thick arc (3/4 of a ring)
 * with a single vertical tally line through the open gap. Combines
 * the brand initial with the "count" verb visually.
 */
function MonogramSVG({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" className="text-brand" />
      {/* The C — drawn as an arc path so it has a real curve, not a
          stroked ring that would have a seam at the gap. */}
      <path
        d="M 27 14 A 8 8 0 1 0 27 26"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tally line — a single vertical mark through the gap, the
          visual pun on "counting". */}
      <line
        x1="28"
        y1="11"
        x2="28"
        y2="29"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

/**
 * Drop-in brand logo. Renders one of three layouts:
 *
 *   variant="mark"   — just the stack mark, no wordmark
 *   variant="mono"   — just the monogram, no wordmark
 *   variant="lockup" — mark + "Counted" wordmark, side-by-side
 *
 * Props:
 *   variant  — one of 'mark' | 'mono' | 'lockup' (default 'lockup')
 *   size     — pixel size of the icon square (default 28 for lockup, 40 for solo)
 *   href     — if set, wraps the whole thing in a <Link>. Useful for nav.
 *   label    — aria-label for the link. Defaults to "Counted home".
 *   className — passthrough for the outer wrapper
 *   textClassName — passthrough for the wordmark text
 */
export default function Logo({
  variant = 'lockup',
  size,
  href,
  label = 'Counted home',
  className = '',
  textClassName = '',
}) {
  // Per-variant default sizes. The lockup uses a smaller mark so the
  // wordmark sits at a comfortable reading size next to it; solo
  // variants get the full size to fill their container.
  const defaultSize = variant === 'lockup' ? 28 : variant === 'mark' ? 32 : 40
  const iconSize = size ?? defaultSize

  const icon =
    variant === 'mono' ? (
      <MonogramSVG size={iconSize} />
    ) : variant === 'mark' ? (
      <MarkSVG size={iconSize} />
    ) : (
      <MarkSVG size={iconSize} />
    )

  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {icon}
      {variant === 'lockup' && (
        <span
          className={`font-sans font-semibold tracking-tight ${
            iconSize >= 36 ? 'text-[17px]' : 'text-[15px]'
          } text-current ${textClassName}`}
        >
          Counted
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} aria-label={label} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}

// Re-export the SVGs so other parts of the app can render just the
// icon (e.g. social share cards, OG images, the dashboard avatar slot).
export { MarkSVG, MonogramSVG }
