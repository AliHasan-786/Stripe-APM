import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Stripe Radar Copilot — AI-Powered Fraud Decision Explainer',
  description:
    'Understand why Stripe Radar blocked, flagged, or passed a payment. Get plain-English explanations and AI-generated rules to reduce false positives.',
};

const features = [
  {
    icon: '🔍',
    title: 'Transaction Explainer',
    description:
      'Get a detailed AI breakdown of why any transaction was blocked or flagged — with separate views for developers and merchants.',
  },
  {
    icon: '⚙️',
    title: 'Rule Optimizer',
    description:
      'A 5-step AI agent identifies false positives in your transaction history and generates targeted Stripe Radar rules to recover lost revenue.',
  },
  {
    icon: '📊',
    title: 'Transaction Explorer',
    description:
      'Browse and filter your recent Stripe transactions. Color-coded risk scores, 3DS status, country mismatch flags, and potential false positive detection.',
  },
];

const stats = [
  { value: '0.6%', label: 'Average false positive rate for online merchants' },
  { value: '$443B', label: 'Global card fraud losses annually' },
  { value: '72%', label: 'Of merchants report false positives as a top challenge' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-6">
            <span>⚡</span>
            <span>Stripe PM Portfolio Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Stripe Radar,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Explained.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Every time Stripe Radar blocks a payment, your team loses time decoding risk scores and
            rule logic. Radar Copilot explains every decision in plain English — and uses AI to
            recover the legitimate customers you&apos;re turning away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/transactions"
              className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/50"
            >
              Explore Transactions →
            </Link>
            <Link
              href="/optimize"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
            >
              Run Rule Optimizer
            </Link>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            No setup required · Powered by Stripe test data · AI runs at $0/query
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.value}>
              <p className="text-3xl font-bold text-purple-400 tabular-nums">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Three tools. One mission.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Stop losing good customers to overzealous fraud rules. Understand every decision,
              then optimize with confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-gray-500 mb-12">
            No setup required. Just click and explore.
          </p>

          <div className="space-y-6 text-left">
            {[
              {
                step: '01',
                title: 'Browse transactions',
                desc: 'Open the Transaction Explorer to see a curated set of Stripe test transactions with color-coded risk scores and outcome badges.',
              },
              {
                step: '02',
                title: 'Browse your transactions',
                desc: 'See all recent transactions with color-coded risk scores, outcome badges, and false positive flags.',
              },
              {
                step: '03',
                title: 'Click any transaction to explain it',
                desc: 'AI streams a real-time explanation of why Radar made its decision, with signals, developer notes, and merchant-friendly language.',
              },
              {
                step: '04',
                title: 'Run the Rule Optimizer',
                desc: 'A 5-step AI agent scans your history, identifies false positives, generates a Radar rule, simulates its impact, and gives you a clear recommendation.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/transactions"
              className="inline-block px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              Get started →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>
          Built by{' '}
          <a
            href="https://github.com/AliHasan-786"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors underline"
          >
            Ali Hasan
          </a>{' '}
          as a Stripe PM portfolio project
        </p>
        <p className="mt-1 text-gray-600">
          <a
            href="https://github.com/AliHasan-786"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            github.com/AliHasan-786
          </a>
        </p>
        <p className="mt-3 text-xs text-gray-700">
          Not affiliated with Stripe, Inc. This is an independent portfolio project.
        </p>
      </footer>
    </div>
  );
}
