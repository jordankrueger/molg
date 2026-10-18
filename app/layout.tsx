import type { Metadata } from 'next'
import Link from 'next/link'
import localFont from 'next/font/local'
import predictions from '../data/predictions.json'
import { formatDate } from '../components/format'
import { LINKS, external } from '../components/links'
import './globals.css'

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://aiprogresstracker.com'),
  title: 'Machines of Loving Grace Tracker: Dario Amodei\'s AI Predictions',
  description: 'Tracking progress toward the predictions in Dario Amodei\'s essay Machines of Loving Grace on how AI could transform the world for the better.',
  openGraph: {
    title: 'Machines of Loving Grace Tracker: Dario Amodei\'s AI Predictions',
    description: 'Tracking progress toward the predictions in Dario Amodei\'s essay Machines of Loving Grace on how AI could transform the world for the better.',
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
    site: '@AIProgressTrkr',
    title: 'Machines of Loving Grace Tracker: Dario Amodei\'s AI Predictions',
    description: 'Tracking progress toward the predictions in Dario Amodei\'s essay Machines of Loving Grace on how AI could transform the world for the better.',
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

function Wordmark() {
  return (
    <Link className="wordmark" href="/">
      <span className="mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
          <rect x="1" y="9" width="3" height="6" rx="1" />
          <rect x="6.5" y="5" width="3" height="10" rx="1" />
          <rect x="12" y="1" width="3" height="14" rx="1" />
        </svg>
      </span>
      AI Progress Tracker
    </Link>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="wrap bar">
          <Wordmark />
          <nav aria-label="Primary">
            <Link href="/#how" className="hide-sm">How scoring works</Link>
            <a href={LINKS.essay} {...external}>Read the essay</a>
          </nav>
        </header>

        <div id="main">{children}</div>

        <footer>
          <div className="wrap foot">
            <div>
              <Wordmark />
              <p>An independent project tracking the predictions in Machines of Loving Grace. Not affiliated with Anthropic or Dario Amodei.</p>
            </div>
            <nav aria-label="Footer">
              <a href={LINKS.essay} {...external}>Read the essay</a>
              <a href={LINKS.bluesky} {...external}>Bluesky</a>
              <a href={LINKS.x} {...external}>X (Twitter)</a>
              <a href={LINKS.reddit} {...external}>Reddit community</a>
              <a href={LINKS.github} {...external}>Source on GitHub</a>
              <a href={LINKS.changeLog} {...external}>Full change log</a>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/accessibility">Accessibility</Link>
            </nav>
          </div>
          <div className="wrap fine">
            <span>Scores updated {formatDate(predictions.lastUpdated)}</span>
            <span>Code licensed GPL-3.0</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
