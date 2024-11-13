import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Progress Tracker',
  description: 'Tracking predictions from Machines of Loving Grace',
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