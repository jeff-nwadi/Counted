export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2'

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark active:scale-[0.98] shadow-sm',
    secondary: 'bg-white text-ink border border-border-2 hover:bg-slate active:scale-[0.98]',
    ghost: 'text-ink-2 hover:text-ink hover:bg-slate',
  }

  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
