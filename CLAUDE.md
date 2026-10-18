# AI Progress Tracker (molg)

Public repo. Live at aiprogresstracker.com (Cloudflare Pages project `molg`, auto-deploys on push to `main`).

## How scores change

- `.github/workflows/update-predictions.yml` runs every Monday: tests first, then `scripts/update-predictions.mjs`.
- The script reads the last 7 days from 8 RSS feeds, sends up to 80 numbered articles (taken one feed at a time) to Claude, and asks for changes under strict rules: up only with a direct AI role and solid evidence (peer-reviewed, regulatory, official data, live deployment); down on solid evidence of moving away.
- `scripts/scoring.mjs` decides what actually lands: the article must be one we sent (link and title come from the feed, never the model), not already used as evidence, at most 3 points per change, one change per prediction, 0–100. Rejected suggestions are listed in the audit log.
- Tests: `node --test scripts/*.test.mjs`.

## History

- Before 2026-10-19 the model scored freely: 123 of 132 changes were increases, some logged changes were never applied (wrong section), and 3 evidence links were broken (2 removed, 1 fixed). On 2026-10-18 every past change was re-judged under the new rules; only 2 (both decreases) held up, so scores were rebuilt from the 2026-02-26 starting values (average 26.9% → 18.1%). The replay script is not in the repo; the audit log entry for 2026-10-18 records the result.

## Site and model

- Model: Claude Opus 5.5 (`claude-opus-5-5`, effort medium) with the scoring rubric in `scripts/update-predictions.mjs`. Workflow runs Node 24.
- Homepage (redesign 2026-10-18): headline average + per-prediction bars, all 18 predictions visible, "How a score moves" section with the latest weekly check (parsed from `AUDIT-LOG.md` at build) and the rules. Header and footer live in `app/layout.tsx`. Shared links in `components/links.ts`.
- Weekly workflow verified end to end on GitHub 2026-10-18 (manual run, 8/8 feeds, 214 articles, no changes). First scheduled Monday run under the new rules: 2026-10-19 09:00 UTC.
- Social: Bluesky @aiprogresstracker.com, X @AIProgressTrkr (X handles max 15 chars), Reddit copy/paste via social-week. Brag video and profile art live in `~/ClaudeCode/brag-videos/molg/`. hello@ forwards to Jordan via Cloudflare Email Routing.
- Dependencies: Next.js 15.5.28 + postcss override. One Dependabot alert left (postcss-selector-parser via Tailwind 3, build-time only).

## Backlog

- Write the latest check as JSON instead of re-parsing `AUDIT-LOG.md` markdown.
- One source for the scoring rules text (page, prompt and MAX_STEP each carry a copy).
- Upgrade to Tailwind 4 to clear the last Dependabot alert.
- Replace regex RSS parsing with an XML parser.
- Re-score the hand-set 2024 starting values (Jordan declined for now; the 18% headline is mostly those).
- social-week: filter manual channels in `scope()`, per-card mode object.
