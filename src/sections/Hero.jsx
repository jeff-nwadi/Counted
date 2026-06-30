'use client'

import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { HoleBackground } from '@/components/animate-ui/components/backgrounds/hole'
import HeroWidget from '@/components/HeroWidget'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-5 sm:px-8 bg-white overflow-hidden isolate">
      {/* Background layer — sits behind the content, clipped to this section. */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <HoleBackground
          strokeColor="#cdd3e0"
          numberOfLines={36}
          numberOfDiscs={36}
        />
      </div>

      {/* Soft brand tint over the background to keep the white space readable
          and tie the iridescent animation back to the brand palette. */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.6),rgba(255,255,255,0.3)_55%,rgba(255,255,255,0.8)_100%)]"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: copy */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-brand-light border border-brand-mid text-brand-dark text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
              Built for 2–8 location operators
            </div>

            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] tracking-tight text-ink mb-5">
              Stock that stays{' '}
              <span className="italic text-brand">in sync.</span>
            </h1>

            <p className="text-ink-2 text-lg leading-relaxed mb-8 text-balance">
              Counted gives your shops a shared source of truth — real-time stock counts,
              smart transfer suggestions, and a mobile view your staff will actually use.
              No spreadsheet chaos. No $1,500/month platforms.
            </p>

            {/* Social proof micro-line */}
            <div className="flex items-center gap-1.5 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-ink-3 ml-1">
                Loved by 200+ multi-location operators
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-brand text-white text-base font-medium px-7 py-3.5 rounded-xl hover:bg-brand-dark active:scale-[0.98] transition-all shadow-sm"
              >
                Start free — 14 days
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-ink text-base font-medium px-7 py-3.5 rounded-xl border border-border-2 hover:bg-slate active:scale-[0.98] transition-all"
              >
                Sign in
              </Link>
            </div>

            <p className="text-xs text-ink-3 mt-4">
              No credit card needed. Cancel anytime. $25–40 per location.
            </p>
          </div>

          {/* Right: live interactive widget */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow */}
              <div
                className="absolute inset-0 scale-90 blur-3xl opacity-20 rounded-full bg-brand"
                aria-hidden="true"
              />
              <HeroWidget />
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-white border border-border rounded-xl px-3 py-1.5 shadow-card flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
                <span className="text-xs font-medium text-ink">Updates instantly</span>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white border border-border rounded-xl px-3 py-1.5 shadow-card">
                <span className="text-xs font-medium text-ink">
                  Try it — adjust the stock counts above ↑
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
