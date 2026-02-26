# MOLG Roadmap

Audit completed 2026-02-26. Managed by Claude Code.

## Completed

- [x] Extract prediction data to JSON (2026-02-26)
- [x] Upgrade React to stable 19.2.4 (2026-02-26)
- [x] Fix accessibility — ARIA attributes on all interactive elements (2026-02-26)
- [x] Add SEO metadata — OG, Twitter Card, canonical, robots.txt, sitemap.xml (2026-02-26)
- [x] Update dependencies — PostCSS, Tailwind, TypeScript to latest (2026-02-26)
- [x] Fix README — correct versions, Cloudflare Pages, project structure (2026-02-26)
- [x] Fix ESLint config — removed global rule overrides (2026-02-26)
- [x] Fix HTML entity bug (2026-02-26)
- [x] Remove unused template assets (2026-02-26)
- [x] Add "Last Updated" date to page (2026-02-26)
- [x] Add evidence/sources structure to predictions (2026-02-26)
- [x] Automated weekly prediction updates via GitHub Actions (2026-02-26)

## Deferred

- [ ] **ESLint 8 → 10 migration** — Requires flat config rewrite. Not urgent since lint passes clean.

## Automation

- **GitHub Actions workflow** runs every Monday at 9am UTC (4am ET)
- Scans 8 RSS feeds (Nature, STAT News, MIT Tech Review, WHO, UN News, etc.)
- Sends recent articles to Claude Haiku for evaluation against predictions
- Updates `data/predictions.json` and `AUDIT-LOG.md` automatically
- Commits and pushes if changes are found
- Can also be triggered manually via workflow_dispatch
- **Requires:** `ANTHROPIC_API_KEY` GitHub secret on the repo

## Update Process

- Prediction data lives in `data/predictions.json`
- Push to `main` auto-deploys via Cloudflare Pages
- Audit log at `AUDIT-LOG.md` (newest entries first)
- Domain: aiprogresstracker.com | Cloudflare Pages project: `molg`
