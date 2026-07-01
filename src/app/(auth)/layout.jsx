import { CheckCircle2, MapPin, ArrowRightLeft } from 'lucide-react'
import Logo from '@/components/Logo'

/**
 * Route group layout for /login, /signup, /forgot-password.
 * Intentionally does NOT inherit the marketing Navbar/Footer from the
 * landing page — auth flows want a focused, chrome-less surface.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-svh bg-white flex">
      {/* Left brand panel — visible md+ only */}
      <aside
        className="hidden md:flex md:w-[44%] lg:w-[46%] relative overflow-hidden bg-ink text-white p-10 lg:p-14 flex-col"
        aria-hidden="true"
      >
        {/* Subtle radial brand glow */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1a56f5, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1a56f5, transparent 70%)' }}
        />

        <div className="relative flex items-center gap-2.5">
          <Logo href="/" size={32} />
        </div>

        <div className="relative flex-1 flex flex-col justify-center max-w-md mt-10">
          <h1 className="font-display text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-5">
            Stock that stays{' '}
            <span className="italic text-brand">in&nbsp;sync</span>
            {' '}— across every shop you run.
          </h1>
          <p className="text-white/60 text-base lg:text-lg leading-relaxed">
            Sign in to manage live inventory across 2–8 locations. Real-time stock, smart
            transfer suggestions, and a mobile view your staff will actually use.
          </p>

          {/* Mini live inventory preview — same visual language as landing */}
          <div className="mt-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
                <span className="text-xs text-white/70 font-medium">Live · synced 2s ago</span>
              </div>
              <span className="text-[10px] text-white/40">3 locations</span>
            </div>
            {[
              { name: 'Linen Blazer', count: 2, loc: 'Downtown', low: true },
              { name: 'Canvas Tote', count: 22, loc: 'Westside', low: false },
              { name: 'Merino Crew', count: 15, loc: 'Mall Kiosk', low: false },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-2 border-t border-white/10 first:border-0 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center">
                    <ArrowRightLeft className="w-3 h-3 text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white truncate text-xs font-medium">{item.name}</p>
                    <p className="text-[10px] text-white/40 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {item.loc}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                    item.low ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'
                  }`}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <ul className="mt-8 flex flex-col gap-2.5">
            {[
              'Real-time across every location',
              'Smart transfer suggestions',
              'No per-user fees, ever',
            ].map((line) => (
              <li key={line} className="flex items-center gap-2.5 text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/30">
          Trusted by 200+ multi-location operators
        </p>
      </aside>

      {/* Right form column */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  )
}
