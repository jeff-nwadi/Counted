'use client'

import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Stagger, StaggerItem } from '@/components/motion'

export default function FinalCTA() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-ink overflow-hidden relative">
      {/* Glow — slow gentle pulse to give the section some life. */}
      <FinalCTAGlow />

      <div className="max-w-4xl mx-auto text-center relative">
        <Stagger
          className="relative"
          stagger={0.1}
          amount={0.3}
        >
          <StaggerItem>
            <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-5">
              Get started today
            </p>
          </StaggerItem>

          <StaggerItem>
            <h2 className="font-display text-5xl sm:text-6xl text-white leading-tight mb-6">
              Stop managing stock
              <br />
              from a shared notebook.
            </h2>
          </StaggerItem>

          <StaggerItem>
            <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Sign up in 2 minutes, import your spreadsheet, and send your team a link.
              You'll have live, synced inventory before lunch.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-white text-ink text-base font-medium px-7 py-3.5 rounded-xl hover:bg-slate active:scale-[0.98] transition-all"
              >
                Start 14-day free trial
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 text-base font-medium px-7 py-3.5 rounded-xl transition-all"
              >
                See all features
              </a>
            </div>
          </StaggerItem>

          <StaggerItem>
            <p className="text-white/30 text-sm mt-6">
              No credit card. $25–40 per location per month. Cancel anytime.
            </p>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}

/**
 * Decorative brand-colored glow behind the CTA copy. Pulses softly
 * so the dark section doesn't feel static. Skipped under reduced
 * motion — just renders a static glow in that case.
 */
function FinalCTAGlow() {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return (
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1a56f5, transparent 70%)' }}
        aria-hidden="true"
      />
    )
  }

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
      style={{ background: 'radial-gradient(circle, #1a56f5, transparent 70%)' }}
      aria-hidden="true"
      animate={{ opacity: [0.08, 0.16, 0.08], scale: [1, 1.05, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
