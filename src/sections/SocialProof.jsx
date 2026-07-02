'use client'

import { Stagger, StaggerItem, Reveal } from '@/components/motion'

const STATS = [
  { value: '200+', label: 'operators live today' },
  { value: '$0', label: 'per-user fees, ever' },
  { value: '< 1 day', label: 'average setup time' },
  { value: '99.9%', label: 'sync uptime' },
]

const CATEGORIES = [
  'Multi-location retail',
  'Restaurant groups',
  'Salon chains',
  'Boutique clothing',
  'Gift shops',
  'Specialty food',
]

export default function SocialProof() {
  return (
    <section className="py-14 border-y border-border bg-slate">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Stat grid — count-up-style fade. Each stat rises with a small
            delay, so the eye sweeps across the row. */}
        <Stagger
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10"
          stagger={0.1}
          amount={0.4}
        >
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl text-ink mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-ink-3 font-medium uppercase tracking-wide">
                {stat.label}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* "Used by" pills — a single reveal of the label, then the pills
            stagger in. Feels like a tag cloud assembling itself. */}
        <Reveal
          className="flex flex-wrap justify-center gap-2"
          amount={0.3}
          delay={0.1}
        >
          <span className="text-xs text-ink-3 self-center mr-1">Used by:</span>
          <Stagger
            className="flex flex-wrap justify-center gap-2"
            stagger={0.04}
            amount={0.2}
            delay={0.15}
          >
            {CATEGORIES.map((cat) => (
              <StaggerItem key={cat}>
                <span className="text-xs font-medium text-ink-2 bg-white border border-border rounded-full px-3 py-1">
                  {cat}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>
      </div>
    </section>
  )
}
