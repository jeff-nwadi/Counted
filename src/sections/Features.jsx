import { Zap, Smartphone, ArrowRightLeft, History, Upload } from 'lucide-react'

const FEATURES = [
  {
    Icon: Zap,
    color: 'bg-brand text-white',
    title: 'Real-time across every location',
    body: 'The second stock changes anywhere — a sale, an adjustment, a transfer — every screen at every location reflects it. No refresh, no sync button.',
    tag: 'Core',
  },
  {
    Icon: ArrowRightLeft,
    color: 'bg-green-50 text-green-600',
    title: 'Smart transfer suggestions',
    body: "Counted watches for the pattern that costs you money: one location running low while another has surplus. It tells you, and a two-tap approval moves it.",
    tag: 'Differentiator',
  },
  {
    Icon: Smartphone,
    color: 'bg-brand-light text-brand',
    title: 'Mobile view built for staff',
    body: 'One location, big tap targets, plus and minus. No dashboard, no menus. Staff open a link on their phone and keep the count honest — no training required.',
    tag: 'Staff-ready',
  },
  {
    Icon: History,
    color: 'bg-slate text-ink-2',
    title: 'Every transfer logged automatically',
    body: '"What happened to those 12 scarves?" — answered in seconds. Every approved transfer is recorded with who moved what, from where, to where, and when.',
    tag: 'Accountability',
  },
  {
    Icon: Upload,
    color: 'bg-amber-50 text-amber-600',
    title: 'Import your spreadsheet on day one',
    body: 'Drop your CSV, see a preview, confirm. You can be using Counted the same day you sign up — no setup call, no implementation project, no consultant.',
    tag: 'Same-day',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-5 sm:px-8 bg-slate">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            One thing, done{' '}
            <span className="italic text-brand">extremely well.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              className={`bg-white rounded-2xl p-6 border border-border hover:border-border-2 hover:shadow-card-hover transition-all duration-200 ${
                i === 4 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${feat.color}`}
                >
                  <feat.Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-sans font-semibold text-base text-ink">{feat.title}</h3>
                    <span className="text-[11px] font-medium text-ink-3 bg-slate border border-border rounded-full px-2 py-0.5 hidden sm:inline">
                      {feat.tag}
                    </span>
                  </div>
                  <p className="text-sm text-ink-2 leading-relaxed">{feat.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
