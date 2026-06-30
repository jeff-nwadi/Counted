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

          {/* Left: sticky header */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-6">
              From spreadsheet to{' '}
              <span className="italic text-brand">live in a day.</span>
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
              <div className="font-display text-4xl text-brand italic">47 minutes</div>
              <p className="text-xs text-ink-3 mt-1">
                From sign-up to staff using the mobile view
              </p>
            </div>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex gap-5 pb-8 last:pb-0">
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-4 top-9 bottom-0 w-px bg-border"
                    aria-hidden="true"
                  />
                )}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
