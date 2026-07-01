'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { usePrefersReducedMotion } from './useReducedMotion'

/**
 * Wraps content in a scroll-linked parallax. As the element travels
 * through the viewport, its inner content drifts at a different
 * speed, creating depth.
 *
 * Use it for background shapes, decorative gradients, large headings
 * that should feel "heavier" than the rest of the page.
 *
 * Props:
 *   speed       — how fast to drift. 0.3 = subtle, 0.6 = noticeable,
 *                 negative values move opposite to scroll (default 0.3)
 *   distance    — total pixel travel range. Multiplied internally by
 *                 speed to compute from/to values (default 100)
 *   as          — outer element type (default 'div')
 *
 * Implementation note: we use a tall outer element sized via the
 * `offset` prop's natural scroll length, then transform the inner
 * element. This keeps the layout size stable while the visual drifts.
 */
export function Parallax({
  children,
  speed = 0.3,
  distance = 100,
  as = 'div',
  ...rest
}) {
  const prefersReduced = usePrefersReducedMotion()
  const ref = useRef(null)

  // Track this element's progress through the viewport (0 = top
  // enters, 1 = bottom leaves). Multiply by distance to get pixel
  // travel; multiply by speed to make the drift gentle or strong.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const offset = distance * speed
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])

  if (prefersReduced) {
    const Tag = as
    return <Tag {...rest}>{children}</Tag>
  }

  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag ref={ref} {...rest}>
      <motion.div style={{ y, willChange: 'transform' }}>{children}</motion.div>
    </MotionTag>
  )
}
