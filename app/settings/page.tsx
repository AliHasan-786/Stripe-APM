import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">About</h1>
        <p className="text-gray-500 text-sm mt-1">
          How this was built, and why it was built this way.
        </p>
      </div>

      <div className="space-y-4">
        {/* AI-native builder narrative — leads */}
        <div className="bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Built with AI, end to end</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            This entire app — from the product spec to the deployed prototype — was built using
            AI-native development tools:
          </p>
          <ul className="space-y-2.5 text-sm text-gray-700">
            {[
              {
                tool: 'Claude Code',
                role: 'Primary development environment. Wrote, debugged, and iterated on all code through conversation — no IDE.',
              },
              {
                tool: 'Solopreneur plugin',
                role: 'PM-focused agent workflow for product spec, case study writing, competitive research, and QA review.',
              },
              {
                tool: 'claude-flow / ruflo',
                role: 'Multi-agent orchestration for parallel code review — caught broken URLs, missing demo params, and UX dead-ends across the codebase simultaneously.',
              },
            ].map(({ tool, role }) => (
              <li key={tool} className="flex gap-3">
                <span className="font-semibold text-purple-700 w-36 flex-shrink-0">{tool}</span>
                <span className="text-gray-600">{role}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-purple-100">
            The whole project — PRD to production — was built and iterated in under 48 hours. This
            is the development workflow I&apos;d bring to Stripe: AI as a collaborator for product
            thinking, architecture, debugging, and shipping, not just autocomplete.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">What this is</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            An AI-native tool that explains Stripe Radar fraud decisions in plain English, surfaces
            false-positive patterns across transaction history, and proposes targeted Stripe Radar
            Rules using a 5-step agentic reasoning loop — with simulation and business impact
            quantification before any rule touches production.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            Built around a real gap: Radar blocks ~1–3% of legitimate transactions with no
            explanation. Merchants can&apos;t tell which blocks are false positives, and have no
            structured way to write recovery rules without risking new fraud exposure.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Tech stack</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              ['Framework', 'Next.js 14 App Router + TypeScript (strict)'],
              ['AI', 'OpenRouter — nvidia/nemotron-3-super-120b-a12b:free ($0/query)'],
              ['Payments', 'Stripe Test API'],
              ['Streaming', 'Server-Sent Events (SSE) via Next.js Route Handlers'],
              ['Deployment', 'Vercel (60s function timeout for agentic pipeline)'],
            ].map(([label, value]) => (
              <li key={label} className="flex gap-2">
                <span className="font-medium text-gray-700 w-28 flex-shrink-0">{label}</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Links</h2>
          <div className="space-y-2">
            <div>
              <a
                href="https://github.com/AliHasan-786/Stripe-APM"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-700 underline underline-offset-2"
              >
                github.com/AliHasan-786/Stripe-APM →
              </a>
            </div>
            <div>
              <Link
                href="/case-study"
                className="text-sm text-purple-600 hover:text-purple-700 underline underline-offset-2"
              >
                Product case study →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/transactions?demo=true"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-lg transition-colors"
        >
          Try the demo →
        </Link>
        <Link
          href="/"
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
