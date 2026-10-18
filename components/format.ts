// "2026-10-18" -> "October 18, 2026" (or "Oct 18, 2026" with short: true), read as a calendar date.
export function formatDate(iso: string, short = false) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
