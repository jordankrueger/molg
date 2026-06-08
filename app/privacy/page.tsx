import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy — AI Progress Tracker',
  description: 'What the AI Progress Tracker collects (almost nothing).',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Privacy</h1>
      <p className="opacity-60 mb-8">Last updated: June 8, 2026</p>

      <p className="mb-6">
        The AI Progress Tracker is a static site. It doesn&apos;t ask for your information, and
        there&apos;s nothing to sign up for here.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What I collect</h2>
      <p className="mb-6">
        Almost nothing. There&apos;s no account, no newsletter, and no contact form on this site.
        For traffic numbers I use Cloudflare Web Analytics, which is privacy-first: it&apos;s
        aggregate, doesn&apos;t use cookies, and doesn&apos;t build a profile of you. My host
        (Cloudflare) also keeps standard server logs for security and performance.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">No ad networks</h2>
      <p className="mb-6">
        I don&apos;t run ads, and I don&apos;t sell or share data about visitors. There isn&apos;t
        any to sell.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Links out</h2>
      <p className="mb-6">
        The tracker links to source material — essays, news, and reports. Those sites have their
        own privacy policies.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p className="mb-6">
        Questions? Reach me through the contact form at{' '}
        <a className="underline" href="https://jordankrueger.com/#contact">jordankrueger.com</a>.
      </p>
    </main>
  )
}
