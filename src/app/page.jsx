import { Suspense } from 'react'
import Navbar from '@/sections/Navbar'
import Hero from '@/sections/Hero'
import SocialProof from '@/sections/SocialProof'
import Problem from '@/sections/Problem'
import Features from '@/sections/Features'
import HowItWorks from '@/sections/HowItWorks'
import Testimonials from '@/sections/Testimonials'
import Pricing from '@/sections/Pricing'
import FinalCTA from '@/sections/FinalCTA'
import Footer from '@/sections/Footer'
import SignedInRedirect from '@/components/SignedInRedirect'

export default function Home() {
  return (
    <main>
      {/* Suspense so useSearchParams() inside the client island doesn't
          force the whole landing page to opt out of static prerendering. */}
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>
      <Navbar />
      <Hero />
      <SocialProof />
      <Problem />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}
