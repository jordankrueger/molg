# Machines of Loving Grace — AI Progress Tracker

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?style=flat&logo=cloudflare)](https://pages.cloudflare.com)
[![Reddit](https://img.shields.io/badge/Reddit-Community-FF4500?style=flat&logo=reddit)](https://www.reddit.com/r/MachinesofLovingGrace/)

**Live at [aiprogresstracker.com](https://aiprogresstracker.com)**

[Join our Reddit community](https://www.reddit.com/r/MachinesofLovingGrace/) to discuss updates and contribute to tracking progress!

## About This Project

This website tracks the predictions made in Dario Amodei's essay ["Machines of Loving Grace: How AI Could Transform the World for the Better"](https://darioamodei.com/machines-of-loving-grace) (October 2024). The essay outlines an optimistic vision for how artificial intelligence could dramatically improve human life across multiple domains within 5-10 years after the development of powerful AI.

## Purpose

Our goal is to create a living document that tracks progress toward these predictions in real-time. This helps:
- Provide transparency around AI development and its impacts
- Enable community discussion about progress and setbacks
- Create accountability for these optimistic predictions
- Foster hope and track positive developments in AI

## Key Prediction Categories

The tracker monitors predictions across four main categories:

1. **Biology and Physical Health** — Infectious disease, cancer, genetic disease, Alzheimer's, biological freedom, lifespan
2. **Neuroscience and Mental Health** — Mental illness treatment, structural conditions, genetic prevention, everyday enhancement
3. **Economic Development and Poverty** — Health distribution, economic growth, food security, climate change
4. **Peace and Governance** — Democratic advantage, information environment, legal systems, government services

## Tech Stack

- Next.js 15 (static export)
- React 19
- TypeScript
- Tailwind CSS
- Lucide Icons
- Cloudflare Pages

## Project Structure

```
molg/
├── app/                           # Next.js app directory
│   ├── page.tsx                   # Main page
│   ├── layout.tsx                 # Root layout with SEO metadata
│   └── globals.css                # Tailwind + theme variables
├── components/
│   └── PredictionTracker.tsx      # Main tracker component
├── data/
│   └── predictions.json           # All prediction data (edit this to update progress)
└── public/                        # Static assets
```

## Updating Predictions

Prediction data lives in `data/predictions.json`. To update progress percentages, edit the `progress` value (0-100) for the relevant prediction and push to main. Cloudflare Pages auto-deploys.

## Running Locally

1. Clone the repository: `git clone https://github.com/jordankrueger/molg`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

The project auto-deploys to Cloudflare Pages on push to `main`. The site is statically exported (`output: 'export'` in next.config.ts).

## How to Contribute

- **Suggest Updates:** Join the [Reddit community](https://www.reddit.com/r/MachinesofLovingGrace/) and share news, research, or developments related to any prediction
- **Report Issues:** Use GitHub Issues for bugs or feature suggestions
- **Code Changes:** Fork the repo, create a branch, and submit a pull request

## License

GPL-3.0 License - See LICENSE file for details
