# SP500 Intelligence — Frontend

Next.js 14 · TypeScript · Tailwind CSS · Deployed on AWS Amplify

## Project structure

```
src/
├── app/
│   ├── layout.tsx                  Root layout (fonts, auth provider)
│   ├── page.tsx                    Root redirect (→ /dashboard or /login)
│   ├── globals.css                 Design tokens, base styles
│   ├── login/page.tsx              Login page (Cognito)
│   └── dashboard/
│       ├── layout.tsx              Sidebar nav + top bar
│       ├── page.tsx                Tab 1 — Signal transitions
│       ├── monthly/page.tsx        Tab 2 — Monthly trend
│       └── watchlist/page.tsx      Tab 3 — Barchart watchlist
├── components/
│   ├── auth/AuthProvider.tsx       Cognito Amplify auth context
│   ├── dashboard/
│   │   ├── GrokReasoningCard.tsx   Shared Grok AI reasoning display
│   │   └── TickerSearch.tsx        Searchable ticker dropdown (Tab 2)
│   └── ui/
│       ├── index.tsx               All shared UI components
│       ├── SignalPill.tsx          Bull/Bear/Neutral badge
│       ├── MetricCard.tsx          Dashboard metric tile
│       ├── ConfidenceBar.tsx       Grok confidence progress bar
│       ├── Spinner.tsx             Loading spinner
│       ├── EmptyState.tsx          Empty list state
│       └── LoadingScreen.tsx       Full-screen loading
├── hooks/
│   ├── useAuth.ts                  Auth context hook
│   ├── useSignalTransitions.ts     Tab 1 data + SWR
│   ├── useMonthlyTrend.ts          Tab 2 data + SWR
│   └── useWatchlist.ts             Tab 3 data + SWR
└── lib/                            Utilities (add as needed)
```

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your Cognito pool ID and client ID
```

### 3. Start the Java microservices (in sp500-intelligence/)

```bash
docker-compose up -d postgres redis localstack
# Then start each service or run docker-compose up
```

### 4. Run the Next.js dev server

```bash
npm run dev
# Open http://localhost:3000
```

## How mock data works

All three hooks (`useSignalTransitions`, `useMonthlyTrend`, `useWatchlist`) try to call
the real Java APIs first. If the API is unreachable (during development), they automatically
fall back to rich mock data so the UI always renders correctly.

This means you can develop and test the frontend before the backend services are running.

## Deployment (AWS Amplify)

1. Push this folder to GitHub (inside sp500-intelligence/ or as a separate repo)
2. In AWS Amplify Console → New app → Host web app → Connect GitHub repo
3. Set environment variables in Amplify console (same as .env.example)
4. Amplify auto-detects Next.js and deploys on every push to main

## API routing

All `/api/*` requests are proxied to the Java microservices via `next.config.js` rewrites:

| Frontend route            | Java service      | Port |
|---------------------------|-------------------|------|
| `/api/signals/*`          | Signal Service    | 8082 |
| `/api/sentiment/*`        | Sentiment Service | 8084 |
| `/api/watchlists/*`       | Watchlist Service | 8085 |
| `/api/prices/*`           | Price Service     | 8083 |
| `/api/users/*`            | User Service      | 8086 |
