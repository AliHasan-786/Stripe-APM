# Stripe Radar Copilot

[![Live Demo](https://img.shields.io/badge/Live%20Demo-stripe--radar--copilot.vercel.app-635BFF?style=for-the-badge&logo=vercel)](https://stripe-radar-copilot.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

An AI-powered tool that explains Stripe Radar fraud decisions in plain English — and helps merchants recover revenue lost to false positives.

## Why this matters for Stripe

Stripe Radar blocks ~1.6% of all payment volume as suspected fraud. A meaningful portion of those blocks are false positives — legitimate customers flagged by overly broad rules. The result: lost revenue, frustrated customers, and overwhelmed support teams who can't explain _why_ a payment was blocked.

Radar Copilot solves three specific problems:

1. **"Why was this blocked?"** — Merchants and developers get an instant, structured AI explanation of every fraud decision, in both technical and plain-English formats.
2. **"How do I fix my rules?"** — A 5-step agentic optimizer identifies false positive patterns across a transaction set and generates targeted Radar DSL rules to recover that revenue.
3. **"What's the risk?"** — Every generated rule is simulated against real transaction history before being recommended, with a clear tradeoff analysis.

## Features

- **Transaction Explorer** — Browse and filter Stripe transactions by outcome, risk score, and false positive status
- **AI Explainer** — Streaming SSE-based explanations with separate Developer View, Merchant View, and Risk Signals tabs
- **Confidence Meter** — Visual 0-100% fraud confidence score with verdict label
- **5-Step Rule Optimizer** — Agentic loop: fetch → analyze → generate rule → simulate → recommend
- **Demo Mode** — Works completely without any API keys using 10 synthetic transactions (3 fraud, 3 legitimate, 2 ambiguous, 2 false positives)
- **Rate limiting** — 20 AI analyses per IP per day
- **Mobile responsive** — Full Tailwind CSS responsive design

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| AI | OpenRouter (nvidia/nemotron-super-49b-v1:free) via OpenAI SDK |
| Payments | Stripe SDK v15 |
| Streaming | SSE via ReadableStream |
| Deploy | Vercel |

## Local Setup

### Prerequisites

- Node.js 18+
- A free [OpenRouter](https://openrouter.ai/keys) account (for AI features)
- A free [Stripe](https://dashboard.stripe.com/register) account (optional — demo mode works without it)

### Install and run

```bash
# Clone the repository
git clone https://github.com/AliHasan-786/stripe-radar-copilot
cd stripe-radar-copilot

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```bash
# .env.local

# Required for AI features
OPENROUTER_API_KEY=sk-or-v1-...

# Optional — app works in demo mode without this
STRIPE_SECRET_KEY=sk_test_...
```

> The app runs fully in demo mode without any environment variables configured.

## Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AliHasan-786/stripe-radar-copilot)

### Manual deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# OPENROUTER_API_KEY — required
# STRIPE_SECRET_KEY — optional
```

## Project Structure

```
stripe-radar-copilot/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Landing page
│   ├── transactions/page.tsx   # Transaction Explorer
│   ├── transaction/[id]/       # Transaction Explainer
│   ├── optimize/page.tsx       # Rule Optimizer
│   ├── settings/page.tsx       # API key settings
│   └── api/
│       ├── transactions/       # GET: fetch & normalize transactions
│       ├── analyze/            # POST: stream SSE AI analysis
│       └── optimize/           # POST: stream SSE 5-step optimizer
├── components/                 # All UI components (Tailwind only)
├── lib/                        # Stripe client, OpenRouter client, rate limiter, demo data
├── prompts/                    # AI prompt templates
└── vercel.json                 # Vercel deployment config
```

## Demo Transactions

The demo dataset includes 10 synthetic transactions covering the full risk spectrum:

| Type | Count | Description |
|------|-------|-------------|
| Clear fraud | 3 | Risk 80-95, blocked, card country mismatch, disposable emails |
| Legitimate | 3 | Risk 10-30, passed, 3DS authenticated, consistent geography |
| Ambiguous | 2 | Risk 55-70, some signals, review outcome |
| False positives | 2 | Risk 75-85 but 3DS authenticated + Gmail + returning card |

---

Built by [Ali Hasan](https://github.com/AliHasan-786) as a Stripe PM portfolio project.

_Not affiliated with Stripe, Inc._
