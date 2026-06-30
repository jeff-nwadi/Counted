export default function Badge({ children, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-light text-brand-dark border-brand-mid',
    green: 'bg-green-bg text-green border-green/20',
    amber: 'bg-amber-bg text-amber border-amber/20',
    gray: 'bg-slate text-ink-2 border-border',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium font-sans px-2.5 py-1 rounded-full border ${colors[color]}`}
    >
      {children}
    </span>
  )
}
