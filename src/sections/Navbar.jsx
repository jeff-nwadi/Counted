'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Package } from 'lucide-react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Counted home">
          <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-sans font-semibold text-[15px] text-ink tracking-tight">
            Counted
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-sm text-ink-2 hover:text-ink rounded-lg hover:bg-slate transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-ink-2 hover:text-ink transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-brand-dark transition-colors"
          >
            Start free trial
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-border px-5 pb-5 pt-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2.5 text-sm text-ink-2 hover:text-ink rounded-lg hover:bg-slate transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center bg-white text-ink border border-border-2 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="w-full text-center bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
