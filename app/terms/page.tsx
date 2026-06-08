import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms — AI Progress Tracker',
  description: 'The common-sense terms for using the AI Progress Tracker.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Terms</h1>
      <p className="opacity-60 mb-8">Last updated: June 8, 2026</p>

      <p className="mb-6">
        The AI Progress Tracker is a free, read-only project. A few common-sense notes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">The content</h2>
      <p className="mb-6">
        This is an independent scorecard tracking the predictions in Dario Amodei&apos;s essay
        &ldquo;Machines of Loving Grace.&rdquo; It isn&apos;t affiliated with or endorsed by
        Anthropic or Dario Amodei. I assess progress as best I can from public sources, so treat
        it as informed opinion, not authoritative fact.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">No warranty</h2>
      <p className="mb-6">
        I maintain this on my own, as-is. Statuses and evidence can be incomplete or out of date,
        and links to other sites are their authors&apos; responsibility, not mine.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p className="mb-6">
        Reach me through the contact form at{' '}
        <a className="underline" href="https://jordankrueger.com/#contact">jordankrueger.com</a>.
      </p>
    </main>
  )
}
