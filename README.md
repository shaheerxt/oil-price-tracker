# Oil Price Tracker

Real-time oil price tracker with war escalation highlights, timelapse visualization, and latest energy news.

## Features

- **Live Oil Prices** — Brent & WTI crude prices auto-refresh every 5 minutes via Yahoo Finance
- **War Escalation Highlights** — Shaded conflict zones (Russia-Ukraine, Hamas-Israel, Iran War 2026) with impact annotations
- **Timelapse** — Animated playback from 2020 to present with adjustable speed
- **Gasoline Prices** — Retail prices across 23 countries color-coded by region
- **Latest News** — Auto-refreshing energy headlines from Google News RSS
- **Dark/Light Mode** — System preference detection with manual toggle

## Tech Stack

- **Next.js 15** (App Router)
- **D3.js** for interactive charts
- **Tailwind CSS** for styling
- **Vercel** for deployment

## Data Sources

- Live prices: [Yahoo Finance](https://finance.yahoo.com/)
- Historical: [FRED](https://fred.stlouisfed.org/), [Trading Economics](https://tradingeconomics.com/)
- News: Google News RSS

## Development

```bash
npm install
npm run dev
```

## Deployment

Deployed on Vercel. Pushes to `main` trigger automatic deployments.
