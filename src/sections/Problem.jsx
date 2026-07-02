'use client'

import { AlertTriangle, DollarSign, Clock } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'

const PROBLEMS = [
  {
    Icon: AlertTriangle,
    color: 'text-red-500 bg-red-50',
    title: "Overselling stock that's already gone",
    body: "Three people editing one spreadsheet means someone always sells the last item before the sheet updates — and a customer drives across town for nothing.",
  },
  {
    Icon: DollarSign,
    color: 'text-amber-500 bg-amber-50',
    title: 'Paying $400–5,000/month for 3 locations',
    body: "Lightspeed, Cin7, and their peers are priced for retailers with ops teams. A boutique with 3 shops shouldn't need a 6-month enterprise contract.",
  },
  {
    Icon: Clock,
    color: 'text-brand bg-brand-light',
    title: 'Onboarding that takes weeks',
    body: "Most platforms need a setup call, an implementation project, and staff training. You want to switch tools — not hire a consultant to do it.",
  },
]

export default function Problem() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header — single reveal so the section feels grounded. The
            accent word uses a slight scale for emphasis. */}
        <Reveal className="max-w-2xl mb-14" amount={0.3}>
          <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-3">
            The problem
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-4">
            Running 3 shops off one spreadsheet{' '}
            <span className="text-red-500">costs you money.</span>
          </h2>
          <p className="text-ink-2 text-lg leading-relaxed">
            A real operator lost $8,000 of product in a single month because the shared sheet
            wasn't updated in time. This isn't a rare edge case — it's Tuesday.
          </p>
        </Reveal>

        {/* Problem cards stagger in from the bottom. Each card also has
            a hover lift via CSS for tactile feedback. */}
        <Stagger
          className="grid md:grid-cols-3 gap-5"
          stagger={0.12}
          amount={0.2}
        >
          {PROBLEMS.map((prob) => (
            <StaggerItem
              key={prob.title}
              className="bg-slate rounded-2xl p-6 border border-border hover:border-border-2 hover:shadow-card hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${prob.color}`}>
                <prob.Icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-sans font-semibold text-base text-ink mb-2 leading-snug">
                {prob.title}
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed">{prob.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Closing pull-quote — single reveal with a small horizontal
            line that draws in via width animation. */}
        <Reveal
          className="mt-14 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-4"
          amount={0.3}
          delay={0.1}
        >
          <div className="flex-1">
            <p className="font-display text-2xl text-ink">
              "The spreadsheet was free. The mistakes weren't."
            </p>
            <p className="text-sm text-ink-3 mt-1">
              — Recurring theme across 3 years of r/smallbusiness threads
            </p>
          </div>
          <div className="flex-shrink-0 bg-brand-light border border-brand-mid rounded-xl px-5 py-3 text-center">
            <div className="font-display text-3xl text-brand">$25</div>
            <div className="text-xs text-brand-dark font-medium mt-0.5">per location / month</div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
