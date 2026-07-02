'use client'

import { useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'

const FEATURES_COMPARE = [
  { label: 'Real-time stock sync', starter: true, pro: true },
  { label: 'Locations', starter: 'Up to 4', pro: 'Up to 8' },
  { label: 'Staff logins', starter: 'Unlimited', pro: 'Unlimited' },
  { label: 'Transfer suggestions', starter: true, pro: true },
  { label: 'Transfer history log', starter: true, pro: true },
  { label: 'Mobile staff view', starter: true, pro: true },
  { label: 'CSV import', starter: true, pro: true },
  { label: 'Priority support', starter: false, pro: true },
  { label: 'Accounting integrations (coming soon)', starter: false, pro: true },
  { label: 'API access', starter: false, pro: true },
]

function FeatureValue({ value, dark = false }) {
  if (value === true)
    return (
      <Check
        className={`w-4 h-4 mx-auto ${dark ? 'text-white' : 'text-green-600'}`}
        strokeWidth={2.5}
      />
    )
  if (value === false)
    return <Minus className={`w-4 h-4 mx-auto ${dark ? 'text-white/30' : 'text-border-2'}`} />
  return (
    <span className={`text-xs font-medium ${dark ? 'text-white' : 'text-ink-2'}`}>{value}</span>
  )
}

export default function Pricing() {
  const [locs, setLocs] = useState(3)

  const starterPrice = locs * 25
  const proPrice = locs * 40

  return (
    <section id="pricing" className="py-20 px-5 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-xl mx-auto mb-14" amount={0.3}>
          <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-4">
            Pay per location.{' '}
            <span className="text-brand">Never per user.</span>
          </h2>
          <p className="text-ink-2 text-lg">
            Add a new team member? Free. Open another shop? $25–40/month more. That's the
            whole model.
          </p>
        </Reveal>

        <Reveal
          className="max-w-sm mx-auto mb-10 text-center"
          amount={0.3}
          delay={0.1}
        >
          <label className="block text-sm font-medium text-ink-2 mb-3">
            How many locations?{' '}
            <span className="text-brand font-semibold">{locs}</span>
          </label>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={locs}
            onChange={(e) => setLocs(Number(e.target.value))}
            className="w-full accent-brand"
            aria-label="Number of locations"
          />
          <div className="flex justify-between text-xs text-ink-3 mt-1">
            <span>2</span>
            <span>8</span>
          </div>
        </Reveal>

        {/* Plan cards — both stagger in together, but the Pro card
            gets a slight extra scale-up so it reads as "the featured
            option" once it lands. */}
        <Stagger
          className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-12"
          stagger={0.18}
          amount={0.2}
        >
          {/* Starter */}
          <StaggerItem className="bg-slate rounded-2xl p-7 border border-border hover:-translate-y-1 transition-all duration-200">
            <div className="mb-4">
              <p className="text-xs font-medium text-ink-3 uppercase tracking-wide mb-1">
                Starter
              </p>
              <PriceCounter value={starterPrice} />
              <p className="text-xs text-ink-3 mt-1">
                $25 × {locs} locations
              </p>
            </div>
            <a
              href="#"
              className="block w-full text-center bg-white text-ink border border-border-2 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate transition-colors mb-6"
            >
              Start free trial
            </a>
            <ul className="flex flex-col gap-2.5">
              {FEATURES_COMPARE.slice(0, 8).map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <div className="w-4 flex-shrink-0">
                    <FeatureValue value={f.starter} />
                  </div>
                  <span
                    className={`text-sm ${
                      f.starter === false ? 'text-ink-3 line-through' : 'text-ink-2'
                    }`}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Pro — same stagger, but with an extra "lift" feel via
              a scale-in. The "Most popular" badge fades in last. */}
          <StaggerItem className="bg-brand rounded-2xl p-7 border border-brand relative overflow-hidden hover:-translate-y-1 transition-all duration-200">
            <ProBadge />
            <div className="mb-4">
              <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-1">Pro</p>
              <PriceCounter value={proPrice} dark />
              <p className="text-xs text-white/50 mt-1">$40 × {locs} locations</p>
            </div>
            <a
              href="#"
              className="block w-full text-center bg-white text-brand text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-light transition-colors mb-6"
            >
              Start free trial
            </a>
            <ul className="flex flex-col gap-2.5">
              {FEATURES_COMPARE.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <div className="w-4 flex-shrink-0">
                    <FeatureValue value={f.pro} dark />
                  </div>
                  <span
                    className={`text-sm ${
                      f.pro === false ? 'text-white/30 line-through' : 'text-white/80'
                    }`}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>

        <Reveal className="text-center" amount={0.3}>
          <p className="text-sm text-ink-3">
            14-day free trial on both plans. No credit card required. Cancel any time — your
            data exports as CSV.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/**
 * Animated price display. When `locs` changes via the slider, the
 * price animates from the old value to the new one. Disabled when
 * the user prefers reduced motion.
 */
function PriceCounter({ value, dark = false }) {
  const prefersReduced = useReducedMotion()
  const colorClass = dark ? 'text-white' : 'text-ink'

  if (prefersReduced) {
    return (
      <div className="flex items-baseline gap-1">
        <span className={`font-display text-4xl ${colorClass}`}>${value}</span>
        <span className={`${dark ? 'text-white/60' : 'text-ink-3'} text-sm`}>/month</span>
      </div>
    )
  }

  return (
    <div className="flex items-baseline gap-1">
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`font-display text-4xl inline-block ${colorClass}`}
      >
        ${value}
      </motion.span>
      <span className={`${dark ? 'text-white/60' : 'text-ink-3'} text-sm`}>/month</span>
    </div>
  )
}

/**
 * "Most popular" pill. Fades in after the card lands, so the eye is
 * drawn to the card first and the label second.
 */
function ProBadge() {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) {
    return (
      <div className="absolute top-4 right-4 bg-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
        Most popular
      </div>
    )
  }
  return (
    <motion.div
      className="absolute top-4 right-4 bg-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      Most popular
    </motion.div>
  )
}
