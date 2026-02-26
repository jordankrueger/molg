# MOLG Roadmap

Audit completed 2026-02-26. Managed by Claude Code.

## High Priority

- [x] **Extract prediction data to JSON** — Moved to `data/predictions.json`. Component imports from there. (2026-02-26)
- [x] **Upgrade React to stable 19** — Upgraded to React 19.2.4, ReactDOM 19.2.4, @types/react@19, @types/react-dom@19. (2026-02-26)
- [x] **Fix accessibility** — Added `aria-expanded` on toggle buttons, `role="progressbar"` + `aria-valuenow/min/max/label` on progress bars, `aria-hidden` on decorative icons. (2026-02-26)

## Medium Priority

- [x] **Add SEO metadata** — OG tags, Twitter Card, canonical URL, robots.txt, sitemap.xml added. (2026-02-26)
- [ ] **Update dependencies** — ESLint 8→10, PostCSS, Tailwind, TypeScript to latest patches.
- [x] **Fix README** — Updated to reflect Next.js 15, Cloudflare Pages, current project structure. (2026-02-26)
- [x] **Fix ESLint config** — Removed global rule disabling. Lint passes clean without overrides. (2026-02-26)
- [x] **Fix HTML entity bug** — Moved to JSON data file with plain apostrophes. JSX now uses `&apos;` correctly. (2026-02-26)

## Low Priority

- [x] **Remove unused template assets** — Deleted 5 unused SVGs from public/. (2026-02-26)
- [ ] **Optimize Lucide bundle** — 4 icons imported but ~350KB in chunks. Verify tree-shaking or switch to inline SVGs.
- [ ] **Add "Last Updated" date** — Show visitors when predictions were last reviewed.
- [ ] **Add evidence/sources** — Link supporting articles or research to each prediction's progress claim.

## Update Process

- Prediction data lives in `data/predictions.json`
- Push to `main` auto-deploys via Cloudflare Pages
- Periodic reviews: update progress percentages when notable AI news drops
- Domain: aiprogresstracker.com | Cloudflare Pages project: `molg`
