import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Stripe Radar Copilot — Case Study | Ali Hasan',
  description:
    'A PM case study on Stripe Radar Copilot: the explainability gap in fraud tooling, the product decisions behind the build, success metrics, and roadmap.',
};

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 text-xs text-purple-300 font-medium">
              PM Case Study
            </span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-slate-400 font-medium">
              12 min read
            </span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-slate-400 font-medium">
              March 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-tight">
            Stripe Radar Copilot:{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              A Case Study in Fraud Explainability
            </span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            Why Stripe&apos;s most powerful fraud tool has a critical UX gap — and what I built to
            close it.
          </p>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
              AH
            </div>
            <div>
              <p className="text-sm font-medium text-white">Ali Hasan</p>
              <p className="text-xs text-slate-400">Stripe PM New Grad Accelerator applicant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* Table of Contents */}
        <nav className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-16">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Table of Contents
          </p>
          <ol className="space-y-2">
            {[
              { n: '1', label: 'Executive Summary', href: '#exec-summary' },
              { n: '2', label: 'The Problem', href: '#the-problem' },
              { n: '3', label: 'Who This Hurts Most', href: '#target-segment' },
              { n: '4', label: 'What I Built and Why These Decisions', href: '#decisions' },
              { n: '5', label: 'How I Would Measure Success', href: '#metrics' },
              { n: '6', label: 'What I Would Build Next', href: '#roadmap' },
              { n: '7', label: 'Appendix — Technical Implementation', href: '#appendix' },
            ].map((item) => (
              <li key={item.n} className="flex items-start gap-3">
                <span className="flex-shrink-0 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5">
                  {item.n}
                </span>
                <a
                  href={item.href}
                  className="text-sm text-purple-700 hover:text-purple-900 hover:underline transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Section 1: Executive Summary ── */}
        <section id="exec-summary" className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              1
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
          </div>

          <p className="text-gray-600 leading-relaxed text-base mb-6">
            Stripe Radar stops fraud. It does not explain itself. When a legitimate
            customer&apos;s payment is declined, the merchant gets a number between 0 and 100 and a
            color-coded label. The customer gets nothing. And the $847 sale — plus the customer
            relationship — is gone.
          </p>

          {/* Pull Quote */}
          <blockquote className="border-l-4 border-purple-500 pl-6 py-2 italic text-xl text-gray-700 my-8">
            False positives cost merchants 2 to 13 times more than the fraud they prevent.
          </blockquote>

          <p className="text-gray-600 leading-relaxed text-base mb-6">
            This is not a rare edge case. Industry research estimates that false positives cost
            merchants{' '}
            <strong className="text-gray-800">2 to 13 times more</strong> than the fraud they
            prevent. For a $1M GMV merchant running Stripe with default Radar settings, that is
            roughly{' '}
            <strong className="text-gray-800">$15,000–$30,000 per year</strong> in declined revenue
            from legitimate customers.
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-600 px-5 py-4 rounded-r-lg mb-6">
            <p className="text-3xl font-bold text-purple-700">$15K–$30K</p>
            <p className="text-sm text-purple-600 mt-1">
              Annual declined revenue from false positives for a $1M GMV merchant on default Radar
              settings
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed text-base">
            I built Stripe Radar Copilot to address three compounding failures in Stripe&apos;s
            current product: the explainability gap, the optimization gap, and the recovery gap.
            This document explains the problem, the product decisions I made, what I would measure,
            and what I would build next.
          </p>
        </section>

        {/* ── Section 2: The Problem ── */}
        <section id="the-problem" className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              2
            </span>
            <h2 className="text-2xl font-bold text-gray-900">The Problem</h2>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-3">
            2.1 The scale of false positives
          </h3>

          <p className="text-gray-600 leading-relaxed text-base mb-6">
            False declines — legitimate transactions blocked by fraud rules — are a structurally
            underreported problem. Unlike chargebacks (which generate explicit cost) or fraud (which
            shows up in loss rates), false positives are invisible. The sale just doesn&apos;t
            happen.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 my-8">
            <div className="bg-purple-50 border-l-4 border-purple-600 px-5 py-4 rounded-r-lg">
              <p className="text-3xl font-bold text-purple-700">0.9%–1.4%</p>
              <p className="text-sm text-purple-600 mt-1">
                False positive rate in card-not-present transactions for US merchants
                <span className="block mt-1 text-xs text-purple-500">
                  Javelin Strategy &amp; Research
                </span>
              </p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-600 px-5 py-4 rounded-r-lg">
              <p className="text-3xl font-bold text-purple-700">3%–5%</p>
              <p className="text-sm text-purple-600 mt-1">
                False positive rate for high-risk categories: digital goods, travel, international
                e-commerce
              </p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-600 px-5 py-4 rounded-r-lg">
              <p className="text-3xl font-bold text-purple-700">69%</p>
              <p className="text-sm text-purple-600 mt-1">
                Of developers spend more than 2 hours per week debugging payment failures they
                cannot explain
                <span className="block mt-1 text-xs text-purple-500">2023 Stripe survey</span>
              </p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-600 px-5 py-4 rounded-r-lg">
              <p className="text-3xl font-bold text-purple-700">$118B</p>
              <p className="text-sm text-purple-600 mt-1">
                Annual cost of false positives to US merchants — vs. ~$12B in card fraud losses
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-10 mb-3">
            2.2 The specific Stripe Radar UX failure
          </h3>

          <p className="text-gray-600 leading-relaxed text-base mb-4">
            Stripe Radar&apos;s output today:
          </p>

          <pre className="bg-gray-900 rounded-lg px-5 py-4 text-sm font-mono text-green-400 overflow-x-auto mb-6">
            <code>{`Risk score: 74 (elevated)\nOutcome: Blocked`}</code>
          </pre>

          <p className="text-gray-600 leading-relaxed text-base mb-4">
            This creates a three-party failure:
          </p>

          <ul className="space-y-3 mb-6">
            <li className="flex gap-3 text-gray-600 leading-relaxed text-base">
              <span className="flex-shrink-0 font-semibold text-gray-800">Developers</span>
              cannot debug which signal triggered the block without hours of cross-referencing API
              responses.
            </li>
            <li className="flex gap-3 text-gray-600 leading-relaxed text-base">
              <span className="flex-shrink-0 font-semibold text-gray-800">Merchants</span>
              cannot explain to legitimate customers why their card was declined, damaging trust and
              increasing churn.
            </li>
            <li className="flex gap-3 text-gray-600 leading-relaxed text-base">
              <span className="flex-shrink-0 font-semibold text-gray-800">
                Stripe&apos;s internal teams
              </span>
              face escalating support load from merchants who don&apos;t understand their own Radar
              configuration.
            </li>
          </ul>

          <p className="text-gray-600 leading-relaxed text-base">
            The current Radar Review feature addresses manual review queues — it does not address
            explainability for already-decided outcomes or rule optimization for false positives.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-10 mb-3">
            2.3 The rule optimization gap
          </h3>

          <p className="text-gray-600 leading-relaxed text-base mb-4">
            Stripe Radar Rules are powerful. They are also a DSL that requires technical fluency to
            write correctly:
          </p>

          <pre className="bg-gray-900 rounded-lg px-5 py-4 text-sm font-mono text-green-400 overflow-x-auto mb-6">
            <code>{`allow if :stripe_score: < 85 and :three_d_secure_result: = 'authenticated'`}</code>
          </pre>

          <div className="bg-purple-50 border-l-4 border-purple-600 px-5 py-4 rounded-r-lg">
            <p className="text-3xl font-bold text-purple-700">&lt;20%</p>
            <p className="text-sm text-purple-600 mt-1">
              Of Stripe merchants use custom Radar Rules. The rest use default rules calibrated for
              the median merchant — not their specific product, geography, or risk tolerance.
            </p>
          </div>
        </section>

        {/* ── Section 3: Target Segment ── */}
        <section id="target-segment" className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Who This Hurts Most</h2>
          </div>

          <p className="text-gray-600 leading-relaxed text-base mb-6">
            I chose to focus the product on one segment:{' '}
            <strong className="text-gray-800">
              international SaaS and digital goods merchants.
            </strong>
          </p>

          <p className="text-gray-600 leading-relaxed text-base mb-8">
            Here&apos;s why this segment, not others:
          </p>

          <div className="space-y-6">
            {[
              {
                label: 'High false positive exposure',
                body: 'Digital goods transactions (no physical shipping address to verify, instant delivery) trigger more Radar signals than average. International customers add card country / billing country mismatches — one of Radar\'s strongest risk signals. Combined, these merchants face false positive rates 3–5× higher than domestic physical goods merchants.',
              },
              {
                label: 'High customer lifetime value',
                body: 'A false decline for a $29/month SaaS customer is not a $29 loss — it is the full LTV of that customer, potentially $500–$5,000. The unit economics of false positive recovery are dramatically better in SaaS than in e-commerce.',
              },
              {
                label: 'Non-technical operators',
                body: 'The person who sees the payment failure is often a customer success manager or a founder, not an engineer. They cannot read Radar\'s API output. They need plain English.',
              },
              {
                label: 'Strongest case for the Rule Optimizer',
                body: 'SaaS merchants have predictable customer patterns (recurring email domains, consistent geographies, authenticated sessions) — exactly the conditions where a targeted Radar Rule can safely recover false positives without increasing fraud exposure.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{item.label}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Decisions ── */}
        <section id="decisions" className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              4
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              What I Built and Why These Decisions
            </h2>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-3">
            4.1 Why explainability is the core feature, not rule management
          </h3>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            I considered building a Radar Rule editor as the primary interface. I didn&apos;t,
            because: a rule editor requires the user to know which rule to write. An explainer
            surfaces the pattern first, then suggests the rule.
          </p>
          <blockquote className="border-l-4 border-purple-500 pl-6 py-2 italic text-lg text-gray-700 my-6">
            Users don&apos;t know what they don&apos;t know — they need diagnosis before
            prescription.
          </blockquote>

          <h3 className="text-lg font-semibold text-gray-800 mt-10 mb-3">
            4.2 Why three explanation views
          </h3>
          <p className="text-gray-600 leading-relaxed text-base mb-5">
            The same fraud decision means different things to three different people:
          </p>

          <div className="space-y-3 mb-6">
            {[
              {
                role: 'Developer',
                need: 'Which API field triggered which Radar heuristic, in language they can act on in code.',
              },
              {
                role: 'Merchant operator',
                need: 'Whether to fulfill the order, contact the customer, or let it go — in plain English, in 30 seconds.',
              },
              {
                role: 'Risk analyst',
                need: 'The pattern — not the individual case but whether this is one of many similar blocked transactions.',
              },
            ].map((item) => (
              <div key={item.role} className="flex gap-4 items-start bg-gray-50 rounded-lg p-4">
                <span className="flex-shrink-0 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full mt-0.5">
                  {item.role}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">{item.need}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 leading-relaxed text-base">
            Building one explanation for all three is building it for none. The three-tab
            architecture is not a UI choice; it is a product architecture choice about who the user
            is.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-10 mb-3">
            4.3 Why simulate before recommending a rule
          </h3>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            A Radar Rule that improves outcomes by 10% but accidentally blocks all new cards from
            Germany is worse than no rule at all. The simulation step forces quantification: before
            any recommendation reaches the user, the system shows exactly which transactions would
            change outcomes and in which direction. The Business Impact card — false positives
            recovered, estimated monthly revenue at 1,000 txn/month, legitimate transactions newly
            blocked — makes the tradeoff legible without requiring the user to do math.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-10 mb-3">
            4.4 Why the agentic loop over a single AI call
          </h3>
          <p className="text-gray-600 leading-relaxed text-base mb-4">
            A single prompt asking &ldquo;give me a Radar Rule to reduce false positives&rdquo;
            produces a plausible-sounding but ungrounded output — the AI invents patterns rather
            than discovering them. The five-step loop (fetch → identify false positive candidates →
            generate rule → simulate → analyze tradeoffs) forces each step to be grounded in actual
            transaction data. Step 3&apos;s rule is constrained by Step 2&apos;s identified
            patterns. Step 5&apos;s recommendation is constrained by Step 4&apos;s simulation
            results.
          </p>
          <blockquote className="border-l-4 border-purple-500 pl-6 py-2 italic text-lg text-gray-700 my-6">
            The final output is falsifiable: you can trace every recommendation back to specific
            transactions.
          </blockquote>
        </section>

        {/* ── Section 5: Metrics ── */}
        <section id="metrics" className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              5
            </span>
            <h2 className="text-2xl font-bold text-gray-900">How I Would Measure Success</h2>
          </div>

          <p className="text-gray-600 leading-relaxed text-base mb-8">
            If Radar Copilot shipped inside Stripe, I would track three metrics:
          </p>

          <div className="space-y-5">
            {/* Metric 1 */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Primary
                </span>
                <h4 className="font-bold text-gray-900">False positive rate reduction</h4>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-700 inline">Definition: </dt>
                  <dd className="text-gray-600 inline">
                    % reduction in blocked legitimate transactions, measured per merchant, 30-day
                    rolling window after rule deployment vs. 30-day baseline.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 inline">Target: </dt>
                  <dd className="text-gray-600 inline">
                    20% reduction for merchants who deploy an optimizer-generated rule.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 inline">Why this: </dt>
                  <dd className="text-gray-600 inline">
                    It is the outcome that matters to the user. Everything else is a leading
                    indicator.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Metric 2 */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Secondary
                </span>
                <h4 className="font-bold text-gray-900">Time-to-rule-deployment</h4>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-700 inline">Definition: </dt>
                  <dd className="text-gray-600 inline">
                    Hours from a merchant&apos;s first &ldquo;why was this blocked?&rdquo; query
                    to a custom Radar Rule being saved to their account.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 inline">Baseline: </dt>
                  <dd className="text-gray-600 inline">
                    Today this is unmeasured — the workflow doesn&apos;t exist. I would establish
                    baseline via merchant interviews (hypothesis: 8–40 hours currently).
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 inline">Target: </dt>
                  <dd className="text-gray-600 inline">Under 2 hours end-to-end.</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 inline">Why this: </dt>
                  <dd className="text-gray-600 inline">
                    It captures the tool&apos;s core leverage. A 20× speed improvement in rule
                    iteration is what makes the product defensible.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Metric 3 */}
            <div className="border border-red-100 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Counter-metric
                </span>
                <h4 className="font-bold text-gray-900">Rule-induced fraud rate</h4>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-700 inline">Definition: </dt>
                  <dd className="text-gray-600 inline">
                    % of transactions allowed by optimizer-generated rules that subsequently
                    generate chargebacks, measured 60 days post-deploy.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 inline">Target: </dt>
                  <dd className="text-gray-600 inline">
                    Less than 0.5% (below Stripe&apos;s average fraud rate), flagged immediately
                    if exceeded.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 inline">Why this: </dt>
                  <dd className="text-gray-600 inline">
                    The optimizer&apos;s recommendations need to be safe, not just effective. This
                    is the metric that tells us the AI is not trading fraud risk for false positive
                    recovery.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ── Section 6: Roadmap ── */}
        <section id="roadmap" className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              6
            </span>
            <h2 className="text-2xl font-bold text-gray-900">What I Would Build Next</h2>
          </div>

          <p className="text-gray-600 leading-relaxed text-base mb-8">
            The three features I considered but did not build, and why I would build them in this
            order:
          </p>

          <div className="space-y-8">
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div className="w-px flex-1 bg-purple-200 mt-1" style={{ minHeight: '60px' }} />
              </div>
              <div className="pb-8">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Next: Merchant-facing decline explanation emails
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  The optimizer helps the merchant recover future revenue. It does not help the
                  customer who was just declined. A Stripe-hosted explanation page (linked from the
                  payment failure notification) that explains in plain English what happened —
                  without revealing fraud signals — would recover the customer relationship, not
                  just the revenue. I would validate this with 5 merchant interviews asking:
                  &ldquo;What do you tell customers when their payment is declined?&rdquo; before
                  building.
                </p>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <div className="w-px flex-1 bg-purple-200 mt-1" style={{ minHeight: '60px' }} />
              </div>
              <div className="pb-8">
                <h4 className="font-semibold text-gray-900 mb-2">
                  After: Pattern clustering across merchant cohorts
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Individual merchants cannot know whether their false positive rate is high
                  relative to similar merchants. An aggregate view (&ldquo;merchants in your
                  category see a 1.2% false positive rate; yours is 3.4%&rdquo;) creates urgency
                  for adoption and gives Stripe&apos;s customer success team a data-driven playbook
                  for merchant outreach. This requires de-identified aggregation of Radar data — a
                  non-trivial privacy and data governance question that needs to be resolved before
                  building.
                </p>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Later: Proactive rule suggestions
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Today the optimizer is pull — the merchant has to run it. The higher-value version
                  is push: Stripe detects a false positive pattern emerging and surfaces a rule
                  suggestion in the Dashboard before the merchant has to ask. This requires
                  confidence thresholds I would not trust without first validating the
                  optimizer&apos;s accuracy on real merchant data. Build the pull version, measure
                  accuracy, then build the push version.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 7: Appendix ── */}
        <section id="appendix" className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              7
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              Appendix — Technical Implementation
            </h2>
          </div>

          <p className="text-gray-500 text-sm mb-5 italic">
            Brief technical note for completeness.
          </p>

          <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm space-y-2">
            {[
              { key: 'Framework', value: 'Next.js 14 App Router, TypeScript (strict), Tailwind CSS' },
              {
                key: 'AI',
                value:
                  'OpenRouter (nvidia/nemotron-3-super-120b-a12b:free) via OpenAI SDK — $0/query at demo volume',
              },
              {
                key: 'Data',
                value: 'Stripe Test API for transaction data; key baked server-side (no user setup required)',
              },
              { key: 'Streaming', value: 'SSE streaming for real-time AI output display' },
              {
                key: 'Rules engine',
                value:
                  'Radar Rules DSL parser built from scratch in TypeScript; simulates rule outcomes against transaction set without touching live Stripe config',
              },
              { key: 'Rate limiting', value: '20 AI analyses per IP per day' },
            ].map((item) => (
              <div key={item.key} className="flex gap-3 flex-wrap">
                <span className="text-purple-400 font-semibold">{item.key}:</span>
                <span className="text-green-400">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Footer ── */}
        <div className="border-t border-gray-200 pt-12 text-center">
          <p className="text-sm text-gray-400 mb-4">
            Built as a Stripe PM New Grad Accelerator portfolio project by Ali Hasan
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/transactions"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md text-sm"
            >
              Try the product demo →
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
