# MOLG Roadmap

Audit completed 2026-02-26. Managed by Claude Code.

## High Priority

- [x] **Extract prediction data to JSON** — Moved to `data/predictions.json`. Component imports from there. (2026-02-26)
- [x] **Upgrade React to stable 19** — Upgraded to React 19.2.4, ReactDOM 19.2.4, @types/react@19, @types/react-dom@19. (2026-02-26)
- [x] **Fix accessibility** — Added `aria-expanded` on toggle buttons, `role="progressbar"` + `aria-valuenow/min/max/label` on progress bars, `aria-hidden` on decorative icons. (2026-02-26)

## Medium Priority

- [x] **Add SEO metadata** — OG tags, Twitter Card, canonical URL, robots.txt, sitemap.xml added. (2026-02-26)
- [x] **Update dependencies** — PostCSS, Tailwind 3, TypeScript updated to latest patches. ESLint 8→10 deferred (requires flat config migration). (2026-02-26)
- [x] **Fix README** — Updated to reflect Next.js 15, Cloudflare Pages, current project structure. (2026-02-26)
- [x] **Fix ESLint config** — Removed global rule disabling. Lint passes clean without overrides. (2026-02-26)
- [x] **Fix HTML entity bug** — Moved to JSON data file with plain apostrophes. JSX now uses `&apos;` correctly. (2026-02-26)

## Low Priority

- [x] **Remove unused template assets** — Deleted 5 unused SVGs from public/. (2026-02-26)
- [x] **Optimize Lucide bundle** — Verified tree-shaking is working correctly. Remaining chunk size is mostly React framework, not icons. Not worth replacing. (2026-02-26)
- [x] **Add "Last Updated" date** — Shows formatted date from `lastUpdated` field in predictions.json. (2026-02-26)
- [x] **Add evidence/sources** — Added `evidence` array to each prediction in JSON. Component renders evidence links when present. (2026-02-26)

## Update Process

- Prediction data lives in `data/predictions.json`
- Push to `main` auto-deploys via Cloudflare Pages
- Periodic reviews: update progress percentages when notable AI news drops
- Domain: aiprogresstracker.com | Cloudflare Pages project: `molg`
