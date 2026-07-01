'use client'

import { motion, useReducedMotion } from 'motion/react'
import { usePrefersReducedMotion } from './useReducedMotion'

/**
 * Scroll-triggered reveal. The element fades in and slides up (or in
 * any of the four directions) the first time it enters the viewport.
 *
 * Designed as a drop-in replacement for `<div>` — all standard props
 * pass through, including `className`, `style`, and `children`.
 *
 * Props:
 *   delay       — seconds to wait after entering viewport (default 0)
 *   y, x        — starting offset in pixels (default y=24, x=0)
 *   duration    — animation length in seconds (default 0.6)
 *   once        — animate only once, then stay visible (default true)
 *   amount      — how much of the element must be in view, 0–1 (default 0.2)
 *   as          — element type to render (default 'div')
 *
 * The `viewport={{ once, amount }}` config is what makes this fire-and-forget:
 * once the element scrolls past the threshold, it stays visible.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  as = 'div',
  ...rest
}) {
  const prefersReduced = usePrefersReducedMotion()

  // When reduced motion is requested, render a plain element with no
  // transform / opacity tricks — just there, immediately visible.
  if (prefersReduced) {
    const Tag = as
    return <Tag {...rest}>{children}</Tag>
  }

  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
