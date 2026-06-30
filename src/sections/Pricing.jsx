'use client'

import { useState } from 'react'
import { Check, Minus } from 'lucide-react'

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
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-4">
            Pay per location.{' '}
            <span className="italic text-brand">Never per user.</span>
          </h2>
          <p className="text-ink-2 text-lg">
            Add a new team member? Free. Open another shop? $25–40/month more. That's the
            whole model.
          </p>
        </div>

        {/* Location slider */}
        <div className="max-w-sm mx-auto mb-10 text-center">
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
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-12">
          {/* Starter */}
          <div className="bg-slate rounded-2xl p-7 border border-border">
            <div className="mb-4">
              <p className="text-xs font-medium text-ink-3 uppercase tracking-wide mb-1">
                Starter
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl text-ink italic">${starterPrice}</span>
                <span className="text-ink-3 text-sm">/month</span>
              </div>
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
          </div>

          {/* Pro */}
          <div className="bg-brand rounded-2xl p-7 border border-brand relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              Most popular
            </div>
            <div className="mb-4">
              <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-1">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl text-white italic">${proPrice}</span>
                <span className="text-white/60 text-sm">/month</span>
              </div>
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
          </div>
        </div>

        <p className="text-center text-sm text-ink-3">
          14-day free trial on both plans. No credit card required. Cancel any time — your
          data exports as CSV.
        </p>
      </div>
    </section>
  )
}
