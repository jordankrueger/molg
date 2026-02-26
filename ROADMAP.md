# MOLG Roadmap

Audit completed 2026-02-26. Managed by Claude Code.

## High Priority

- [ ] **Extract prediction data to JSON** — Move all 18 predictions from PredictionTracker.tsx to `data/predictions.json`. Enables updates without touching component code.
- [ ] **Upgrade React to stable 19** — Currently on `19.0.0-rc-66855b96-20241106` (pre-release). Upgrade React + ReactDOM to stable, update @types/react and @types/react-dom to v19.
- [ ] **Fix accessibility** — Add `aria-expanded` to section toggle buttons, `role="progressbar"` + `aria-valuenow/min/max` to progress bars, `aria-label` on icon-only elements.

## Medium Priority

- [ ] **Add SEO metadata** — Open Graph tags, Twitter Card tags, canonical URL, robots.txt, sitemap.xml. Important for Reddit/social sharing.
- [ ] **Update dependencies** — ESLint 8→10, PostCSS, Tailwind, TypeScript to latest patches.
- [ ] **Fix README** — Says Next.js 13.5 and Vercel. Actually Next.js 15 on Cloudflare Pages at aiprogresstracker.com.
- [ ] **Fix ESLint config** — Remove global rule disabling (`no-unused-vars`, `no-unescaped-entities`). Use per-line ignores where needed.
- [ ] **Fix HTML entity bug** — Line 35 of PredictionTracker.tsx uses `&apos;` in a JS string literal. Should be a plain apostrophe.

## Low Priority

- [ ] **Remove unused template assets** — `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` in public/.
- [ ] **Optimize Lucide bundle** — 4 icons imported but ~350KB in chunks. Verify tree-shaking or switch to inline SVGs.
- [ ] **Add "Last Updated" date** — Show visitors when predictions were last reviewed.
- [ ] **Add evidence/sources** — Link supporting articles or research to each prediction's progress claim.

## Update Process

- Prediction data lives in `data/predictions.json` (once extracted)
- Push to `main` auto-deploys via Cloudflare Pages
- Periodic reviews: update progress percentages when notable AI news drops
- Domain: aiprogresstracker.com | Cloudflare Pages project: `molg`
