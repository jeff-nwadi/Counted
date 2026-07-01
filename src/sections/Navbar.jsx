'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    /* The header itself drops in from the top on mount. When motion is
       reduced, render without the motion wrapper. */
    <motion.header
      initial={prefersReduced ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      /* Background and shadow are driven by `scrolled` via framer-motion
         too, so the transition between transparent → solid is smooth
         instead of a binary CSS swap. */
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        animate={
          scrolled
            ? {
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderBottomColor: 'rgba(228,229,234,1)',
                boxShadow:
                  '0 1px 2px 0 rgba(15,17,23,0.04), 0 1px 3px 0 rgba(15,17,23,0.06)',
              }
            : {
                backgroundColor: 'rgba(255,255,255,0)',
                backdropFilter: 'blur(0px)',
                borderBottomColor: 'rgba(255,255,255,0)',
                boxShadow: '0 0 0 0 rgba(0,0,0,0)',
              }
        }
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="border-b"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Logo href="/" label="Counted home" />

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

        {/* Mobile menu — animates in/out with AnimatePresence. */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden bg-white border-t border-border overflow-hidden"
            >
              <div className="px-5 pb-5 pt-3">
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.header>
  )
}
