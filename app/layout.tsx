import type { Metadata } from 'next'
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
      <body>{children}</body>
    </html>
  )
}
