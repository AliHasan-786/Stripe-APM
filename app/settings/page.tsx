import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">About this project</h1>
        <p className="text-gray-500 text-sm mt-1">
          Stripe Radar Copilot — built as a PM portfolio project.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">What this is</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            An AI-native dashboard that explains Stripe Radar fraud decisions in plain English,
            surfaces false-positive patterns, and proposes Stripe Radar Rule changes using an
            agentic reasoning loop.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            Built to demonstrate how Stripe could improve the explainability of Radar outputs for
            both technical and non-technical users — a real gap in Stripe&apos;s product surface today.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Tech stack</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              ['Frontend', 'Next.js 14 App Router + TypeScript'],
              ['AI', 'OpenRouter — nvidia/nemotron-3-super-120b-a12b:free ($0/query)'],
              ['Payments', 'Stripe Test API'],
              ['Streaming', 'Server-Sent Events (SSE) via Next.js Route Handlers'],
              ['Deployment', 'Vercel'],
            ].map(([label, value]) => (
              <li key={label} className="flex gap-2">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">{label}</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Source code</h2>
          <a
            href="https://github.com/AliHasan-786/Stripe-APM"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:text-purple-700 underline underline-offset-2"
          >
            github.com/AliHasan-786/Stripe-APM →
          </a>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/transactions?demo=true"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-lg transition-colors"
        >
          View transactions →
        </Link>
      </div>
    </div>
  );
}
