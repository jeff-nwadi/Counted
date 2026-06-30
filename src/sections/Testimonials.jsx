const TESTIMONIALS = [
  {
    quote:
      "We were running 4 boutiques off a Google Sheet with 6 people editing it. The first week on Counted we caught a $2,000 overstock issue we wouldn't have noticed until the end-of-month count.",
    name: 'Priya K.',
    role: '4-location women\'s boutique',
    initials: 'PK',
    color: 'bg-brand-light text-brand-dark',
  },
  {
    quote:
      "My staff hated every app I tried before this. The mobile view just works — they open a link and tap plus or minus. That's actually it. No one complained once.",
    name: 'Marcus T.',
    role: 'GM, 3-restaurant group',
    initials: 'MT',
    color: 'bg-green-50 text-green-700',
  },
  {
    quote:
      "The transfer suggestion saved us a Saturday crisis. Downtown was almost out of our top seller and Westside had 18 sitting there. Counted caught it Thursday morning.",
    name: 'Diane L.',
    role: 'Owner, 2-location gift shop',
    initials: 'DL',
    color: 'bg-amber-50 text-amber-700',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-5 sm:px-8 bg-slate">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-3">
            What operators say
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            Real shops. Real{' '}
            <span className="italic text-brand">results.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 border border-border flex flex-col gap-4 hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="font-display text-4xl text-border leading-none" aria-hidden="true">
                "
              </div>
              <p className="text-sm text-ink-2 leading-relaxed flex-1 -mt-3">{t.quote}</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-3">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
