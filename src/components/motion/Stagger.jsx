'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from './useReducedMotion'

/**
 * Container that staggers its direct <StaggerItem> children on enter.
 * Use for grids of cards, lists of steps, sets of stats — anywhere
 * you'd like a wave-in feel rather than a single reveal.
 *
 * Items are picked up by the `data-stagger-item` attribute that
 * <StaggerItem> sets, so you can nest other elements between them
 * without breaking the timing.
 *
 * Props:
 *   stagger     — delay between items, seconds (default 0.08)
 *   delay       — initial wait before the first item animates (default 0)
 *   amount      — viewport threshold to trigger, 0–1 (default 0.2)
 *   once        — animate only the first time (default true)
 *   as          — wrapper element type (default 'div')
 */
export function Stagger({
  children,
  stagger = 0.08,
  delay = 0,
  amount = 0.2,
  once = true,
  as = 'div',
  ...rest
}) {
  const prefersReduced = usePrefersReducedMotion()

  if (prefersReduced) {
    const Tag = as
    return <Tag {...rest}>{children}</Tag>
  }

  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Child of <Stagger>. Animates fade + upward slide when its parent
 * stagger container enters the viewport. Add `y` to override the
 * starting offset.
 */
export function StaggerItem({ children, y = 20, ...rest }) {
  const prefersReduced = usePrefersReducedMotion()

  if (prefersReduced) {
    return <div {...rest}>{children}</div>
  }

  return (
    <motion.div
      data-stagger-item
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
