import { ArrowRight } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-ink overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative">
        {/* Decorative background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1a56f5, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-5">
            Get started today
          </p>

          <h2 className="font-display text-5xl sm:text-6xl text-white leading-tight mb-6 italic">
            Stop managing stock
            <br />
            from a shared notebook.
          </h2>

          <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Sign up in 2 minutes, import your spreadsheet, and send your team a link.
            You'll have live, synced inventory before lunch.
          </p>

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

          <p className="text-white/30 text-sm mt-6">
            No credit card. $25–40 per location per month. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
