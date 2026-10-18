import { readFileSync } from 'fs';
import { join } from 'path';

export type Move = { prediction: string; from: number; to: number; note: string };
export type LatestCheck = { date: string; text: string; moves: Move[]; noChanges: boolean };

// Split only where a sentence end is followed by a space and a capital, so "12.5%" stays whole.
const firstSentences = (s: string, n: number) =>
  s.trim().split(/(?<=[.!?])\s+(?=[A-Z"'(])/).slice(0, n).join(' ');

// Newest entry of AUDIT-LOG.md (entries are newest first), read at build time.
export function parseLatestCheck(log: string): LatestCheck | null {
  const m = log.match(/\n## (\d{4}-\d{2}-\d{2})\n([\s\S]*?)(?=\n## |$)/);
  if (!m) return null;
  const [, date, body] = m;
  const moves: Move[] = [];
  for (const line of body.split('\n')) {
    // Weekly changes carry a reason after an em dash; reset/bulk lines don't and aren't shown as moves.
    const c = line.match(/^- \*\*(.+?)\*\* \(\w+\): (\d+)% → (\d+)% — (.+)$/);
    if (c) moves.push({ prediction: c[1], from: Number(c[2]), to: Number(c[3]), note: firstSentences(c[4], 1) });
  }
  // Only weekly runs have a Summary; one-off entries (the 2026-10-18 re-check) show no text.
  const summary = body.match(/^\*\*Summary:\*\* (.+)$/m)?.[1] ?? '';
  return {
    date,
    text: firstSentences(summary, 2),
    moves: moves.slice(0, 3),
    noChanges: body.includes('**No changes this week.**'),
  };
}

export function readLatestCheck() {
  return parseLatestCheck(readFileSync(join(process.cwd(), 'AUDIT-LOG.md'), 'utf-8'));
}
