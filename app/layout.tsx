import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Machines of Loving Grace — AI Progress Tracker',
  description: 'Tracking progress toward the predictions in Dario Amodei\'s essay on how AI could transform the world for the better.',
  openGraph: {
    title: 'Machines of Loving Grace — AI Progress Tracker',
    description: 'Tracking progress toward the predictions in Dario Amodei\'s essay on how AI could transform the world for the better.',
    url: 'https://aiprogresstracker.com',
    siteName: 'AI Progress Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Machines of Loving Grace — AI Progress Tracker',
    description: 'Tracking progress toward the predictions in Dario Amodei\'s essay on how AI could transform the world for the better.',
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
