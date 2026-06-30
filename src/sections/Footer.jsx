import { Package } from 'lucide-react'
import Link from 'next/link'

const FOOTER_LINKS = {
  Product: ['Features', 'How it works', 'Pricing', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy policy', 'Terms of service', 'Cookie policy'],
  Support: ['Documentation', 'Status', 'Help center'],
}

export default function Footer() {
  return (
    <footer className="bg-ink text-white/60 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-sans font-semibold text-[15px] text-white tracking-tight">
                Counted
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-5">
              Affordable multi-location inventory for small retail and restaurant operators.
              Real-time. Mobile-first. No enterprise contract.
            </p>
            <p className="text-xs text-white/30">Priced per location. Never per user.</p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-medium text-white uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Counted. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Built for the 2–8 location operator who doesn't need an enterprise platform.
          </p>
        </div>
      </div>
    </footer>
  )
}
