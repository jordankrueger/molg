import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility — AI Progress Tracker',
  description: 'How accessibility is handled on the AI Progress Tracker and how to report a barrier.',
}

export default function AccessibilityPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Accessibility</h1>
      <p className="opacity-60 mb-8">Last updated: June 8, 2026</p>

      <p className="mb-6">
        I want the AI Progress Tracker to work for everyone, including people who use screen
        readers, keyboard navigation, or other assistive technology.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What I aim for</h2>
      <p className="mb-6">
        I build toward the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level:
        readable color contrast in both light and dark modes, controls you can operate by
        keyboard, real text alternatives for images, and a logical heading order.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Where it stands</h2>
      <p className="mb-6">
        This is a small project I maintain on my own, so treat it as a work in progress rather
        than a certified result. The tracker&apos;s interactive filters get the most attention;
        if any control is hard to reach or use without a mouse, I want to know.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Found a barrier?</h2>
      <p className="mb-6">
        If something here is hard to use with assistive technology, I&apos;d genuinely like to
        hear about it. Reach me through the contact form at{' '}
        <a className="underline" href="https://jordankrueger.com/#contact">jordankrueger.com</a>,
        tell me which page and what got in your way, and I&apos;ll fix what I can.
      </p>

      <p className="mt-10">
        <a className="underline" href="/">← Back to the tracker</a>
      </p>
    </main>
  )
}
