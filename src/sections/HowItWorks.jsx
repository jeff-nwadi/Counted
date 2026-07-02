'use client'

import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'

const STEPS = [
  {
    n: '1',
    title: 'Import your existing data',
    body: 'Drop your spreadsheet as a CSV. We show you a preview before touching anything. Done in under 5 minutes.',
    detail: 'Supports Google Sheets export, Excel CSV, or any comma-separated file.',
  },
  {
    n: '2',
    title: 'Add your locations',
    body: "Name each shop. Assign staff logins with a link — no app store download required.",
    detail: 'Per-location pricing — add a 4th shop, pay for 4 shops. Simple.',
  },
  {
    n: '3',
    title: "Staff open the link, start counting",
    body: "Mobile view loads in any browser. Plus and minus. That's it. Counts update live for the owner.",
    detail: 'No training needed. No app installation. Works on any smartphone.',
  },
  {
    n: '4',
    title: 'Counted watches the gaps for you',
    body: "When one location is low and another has surplus, you get a nudge — with a one-tap approval to move stock.",
    detail: 'This is the feature that paid for itself for most operators within the first week.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-5 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: sticky header — single reveal. The stat callout
              scales in slightly for emphasis. */}
          <Reveal className="lg:sticky lg:top-24" amount={0.3}>
            <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-6">
              From spreadsheet to{' '}
              <span className="text-brand">live in a day.</span>
            </h2>
            <p className="text-ink-2 text-lg leading-relaxed mb-8">
              Most inventory platforms involve a sales call, an onboarding project, and staff
              training. Counted is the opposite — you sign up, import your data, and send your
              team a link.
            </p>
            <div className="bg-slate rounded-2xl p-5 border border-border">
              <p className="text-sm font-medium text-ink mb-1">
                Average time to first live count
              </p>
              <div className="font-display text-4xl text-brand">47 minutes</div>
              <p className="text-xs text-ink-3 mt-1">
                From sign-up to staff using the mobile view
              </p>
            </div>
          </Reveal>

          {/* Right: steps. Each step staggers in; the connecting line
              between the numbered bubbles draws on as the steps scroll
              into view. */}
          <StepsColumn />
        </div>
      </div>
    </section>
  )
}

/**
 * Right column of the HowItWorks section. Owns its own scroll progress
 * for the line-draw effect, which is why it lives outside the main
 * component.
 */
function StepsColumn() {
  const containerRef = useRef(null)
  const prefersReduced = useReducedMotion()

  // Track scroll progress of THIS column — start when the top enters
  // the viewport, end when the bottom leaves. The line's `scaleY` is
  // driven by this so it draws down as the user scrolls.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.6', 'end 0.4'],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div ref={containerRef} className="flex flex-col gap-0 relative">
      {/* Connector line — full-height track (very faint), with a
          brand-colored overlay that scales down from 1→0 as you scroll
          past, creating a "drawing" effect. Only renders if motion is
          allowed. */}
      <div
        className="absolute left-4 top-9 bottom-0 w-px bg-border"
        aria-hidden="true"
      />
      {!prefersReduced && (
        <motion.div
          aria-hidden="true"
          style={{ scaleY: lineScale, transformOrigin: 'top' }}
          className="absolute left-4 top-9 bottom-0 w-px bg-brand"
        />
      )}

      <Stagger
        className="flex flex-col"
        stagger={0.15}
        amount={0.15}
        as="div"
      >
        {STEPS.map((step, i) => (
          <StaggerItem
            key={step.n}
            className="relative flex gap-5 pb-8 last:pb-0"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand text-white text-sm font-semibold flex items-center justify-center z-10">
              {step.n}
            </div>
            <div className="pt-0.5 pb-2">
              <h3 className="font-sans font-semibold text-base text-ink mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed mb-1.5">{step.body}</p>
              <p className="text-xs text-ink-3">{step.detail}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
