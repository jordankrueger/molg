# MOLG Roadmap

Audit completed 2026-02-26. Managed by Claude Code.

## High Priority

- [x] **Extract prediction data to JSON** — Moved to `data/predictions.json`. Component imports from there. (2026-02-26)
- [x] **Upgrade React to stable 19** — Upgraded to React 19.2.4, ReactDOM 19.2.4, @types/react@19, @types/react-dom@19. (2026-02-26)
- [x] **Fix accessibility** — Added `aria-expanded` on toggle buttons, `role="progressbar"` + `aria-valuenow/min/max/label` on progress bars, `aria-hidden` on decorative icons. (2026-02-26)

## Medium Priority

- [ ] **Add SEO metadata** — Open Graph tags, Twitter Card tags, canonical URL, robots.txt, sitemap.xml. Important for Reddit/social sharing.
- [ ] **Update dependencies** — ESLint 8→10, PostCSS, Tailwind, TypeScript to latest patches.
- [ ] **Fix README** — Says Next.js 13.5 and Vercel. Actually Next.js 15 on Cloudflare Pages at aiprogresstracker.com.
- [ ] **Fix ESLint config** — Remove global rule disabling (`no-unused-vars`, `no-unescaped-entities`). Use per-line ignores where needed.
- [x] **Fix HTML entity bug** — Moved to JSON data file with plain apostrophes. JSX now uses `&apos;` correctly. (2026-02-26)

## Low Priority

- [ ] **Remove unused template assets** — `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` in public/.
- [ ] **Optimize Lucide bundle** — 4 icons imported but ~350KB in chunks. Verify tree-shaking or switch to inline SVGs.
- [ ] **Add "Last Updated" date** — Show visitors when predictions were last reviewed.
- [ ] **Add evidence/sources** — Link supporting articles or research to each prediction's progress claim.

## Update Process

- Prediction data lives in `data/predictions.json`
- Push to `main` auto-deploys via Cloudflare Pages
- Periodic reviews: update progress percentages when notable AI news drops
- Domain: aiprogresstracker.com | Cloudflare Pages project: `molg`
