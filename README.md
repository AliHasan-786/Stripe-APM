# Stripe Radar Copilot

[![Live Demo](https://img.shields.io/badge/Live%20Demo-stripe--radar--copilot.vercel.app-635BFF?style=for-the-badge&logo=vercel)](https://stripe-radar-copilot.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

An AI-powered tool that explains Stripe Radar fraud decisions in plain English — and helps merchants recover revenue lost to false positives.

## Why this matters for Stripe

Stripe Radar blocks ~1.6% of all payment volume as suspected fraud. A meaningful portion of those blocks are false positives — legitimate customers flagged by overly broad rules. For a merchant processing $500K/month, that's roughly $8,000/month in lost revenue from good customers who never get a second chance.

Radar Copilot solves three specific problems:

1. **"Why was this blocked?"** — Merchants and developers get an instant, structured AI explanation of every fraud decision, in both technical and plain-English formats.
2. **"How do I fix my rules?"** — A 5-step agentic optimizer identifies false positive patterns across a transaction set and generates targeted Stripe Radar DSL rules to recover that revenue.
3. **"What's the risk?"** — Every generated rule is simulated against real transaction history before being recommended, with a concrete business impact estimate (revenue recovered/month) and tradeoff analysis.

## Product Decisions

This section explains the *why* behind the design — the tradeoffs I made, not just the features I shipped.

### Why false positives, not fraud detection?

Stripe already detects fraud. The unsolved problem is that Radar's default rules block ~1-3% of legitimate transactions with no explanation. For a $1M GMV merchant, that's $10-30K/month in lost revenue from good customers. I framed the tool around **recovery**, not detection, because that's where merchant pain is actually concentrated and underserved.

### Why simulate before deploying a rule?

The worst outcome for a merchant isn't missing a fraudulent charge — it's deploying a Radar rule that accidentally blocks an entire customer segment (e.g., all 3DS-authenticated Gmail users from Canada). The simulation step forces impact assessment before any change goes live. It's the difference between "here is a rule" and "here is a rule that recovers $840/month and blocks 0 legitimate customers."

### Why three explanation views (Risk Signals / Developer / Merchant)?

The same fraud decision means different things to different people. A developer debugging an integration needs raw signal data. A merchant support rep needs language they can use with a customer. A risk analyst needs the pattern recognition rationale. Presenting one undifferentiated explanation serves no one well — so I split it into three views optimized for each audience.

### Why an agentic loop instead of a single AI call?

A single prompt asking "give me a better Radar rule" produces generic output. The 5-step loop — fetch data → identify candidates → generate rule → simulate → analyze tradeoffs — forces the AI to ground its recommendation in actual transaction data and quantify the impact. Each step's output feeds the next, so the final recommendation is falsifiable: you can see exactly which transactions it would change and why.

### What I'd measure

If this shipped inside Stripe, I'd track:
- **False positive rate reduction (%)** — per merchant, 30-day rolling average after rule deployment
- **Revenue recovered per merchant per month** ($) — the primary business outcome
- **Time from "blocked transaction alert" to rule deployed** (hours) — a proxy for how much work the tool removes
- **Rule deployment rate** — % of optimizer runs that result in a rule being saved to Radar, as a measure of recommendation quality

### What I'd build next (and why not yet)

The most valuable next step is **collaborative rule review** — letting multiple team members comment on a proposed rule before it goes live, with a clear approval workflow. I didn't build this because the core value (generating a good rule + quantifying its impact) needs to be validated first. Adding collaboration before the single-player experience is proven would be premature.

## Features

- **Transaction Explorer** — Browse and filter Stripe transactions by outcome, risk score, and false positive status
- **AI Explainer** — Streaming SSE-based explanations with separate Developer View, Merchant View, and Risk Signals tabs
- **Revenue Impact Calculator** — After rule simulation, shows false positives recovered, estimated monthly revenue recovered at 1,000 txn/mo, and legitimate transactions newly blocked
- **5-Step Rule Optimizer** — Agentic loop: fetch → analyze → generate rule → simulate → recommend
- **Demo Mode** — Works with pre-loaded Stripe test data; no setup required
- **Rate limiting** — 20 AI analyses per IP per day
- **Mobile responsive** — Full Tailwind CSS responsive design

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| AI | OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`) via OpenAI SDK |
| Payments | Stripe SDK v15 |
| Streaming | SSE via ReadableStream |
| Deploy | Vercel |

## Local Setup

```bash
git clone https://github.com/AliHasan-786/Stripe-APM
cd Stripe-APM
npm install
cp .env.local.example .env.local
# Add OPENROUTER_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Transactions

The dataset includes 10 Stripe test transactions covering the full risk spectrum:

| Type | Count | Description |
|------|-------|-------------|
| Clear fraud | 3 | Risk 80-95, blocked, card country mismatch, disposable emails |
| Legitimate | 3 | Risk 10-30, passed, 3DS authenticated, consistent geography |
| Ambiguous | 2 | Risk 55-70, some signals, review outcome |
| False positives | 2 | Risk 75-85 but 3DS authenticated + Gmail + returning card |

The false positive transactions are the key demo case: high risk scores but strong authenticity signals — exactly the pattern Radar Copilot is designed to catch.

---

Built by [Ali Hasan](https://github.com/AliHasan-786) as a Stripe PM portfolio project.

_Not affiliated with Stripe, Inc._
