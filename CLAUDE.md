# AI Progress Tracker (molg)

Public repo. Live at aiprogresstracker.com (Cloudflare Pages project `molg`, auto-deploys on push to `main`).

## How scores change

- `.github/workflows/update-predictions.yml` runs every Monday: tests first, then `scripts/update-predictions.mjs`.
- The script reads the last 7 days from 8 RSS feeds, sends up to 80 numbered articles (taken one feed at a time) to Claude, and asks for changes under strict rules: up only with a direct AI role and solid evidence (peer-reviewed, regulatory, official data, live deployment); down on solid evidence of moving away.
- `scripts/scoring.mjs` decides what actually lands: the article must be one we sent (link and title come from the feed, never the model), not already used as evidence, at most 3 points per change, one change per prediction, 0–100. Rejected suggestions are listed in the audit log.
- Tests: `node --test scripts/*.test.mjs`.

## History

- Before 2026-10-19 the model scored freely: 123 of 132 changes were increases, some logged changes were never applied (wrong section), and 3 evidence links were broken (2 removed, 1 fixed). On 2026-10-18 every past change was re-judged under the new rules; only 2 (both decreases) held up, so scores were rebuilt from the 2026-02-26 starting values (average 26.9% → 18.1%). The replay script is not in the repo; the audit log entry for 2026-10-18 records the result.
