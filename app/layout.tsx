import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://aiprogresstracker.com'),
  title: 'Machines of Loving Grace — AI Progress Tracker',
  description: 'Tracking progress toward the predictions in Dario Amodei\'s essay on how AI could transform the world for the better.',
  openGraph: {
    title: 'Machines of Loving Grace — AI Progress Tracker',
    description: 'Tracking progress toward the predictions in Dario Amodei\'s essay on how AI could transform the world for the better.',
    url: 'https://aiprogresstracker.com',
    siteName: 'AI Progress Tracker',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Machines of Loving Grace — AI Progress Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Machines of Loving Grace — AI Progress Tracker',
    description: 'Tracking progress toward the predictions in Dario Amodei\'s essay on how AI could transform the world for the better.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://aiprogresstracker.com',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="px-6 py-10 mt-12 border-t border-black/10 dark:border-white/10 text-sm opacity-60 flex flex-wrap gap-4 justify-center">
          <Link className="underline" href="/privacy">Privacy</Link>
          <Link className="underline" href="/terms">Terms</Link>
          <Link className="underline" href="/accessibility">Accessibility</Link>
        </footer>
      </body>
    </html>
  )
}
