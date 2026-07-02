import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Counted — Inventory that keeps up with you',
  description:
    'Real-time multi-location inventory for small retail and restaurant operators. $25–40 per location. No per-user fees. Start free in minutes.',
  keywords: 'inventory management, multi-location, retail, restaurant, small business, stock tracking',
  openGraph: {
    title: 'Counted — Inventory that keeps up with you',
    description:
      'Real-time multi-location inventory for small retail and restaurant operators. $25–40 per location.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Counted — Inventory that keeps up with you',
    description: 'Real-time multi-location inventory. $25–40 per location. No per-user fees.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-ink" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
