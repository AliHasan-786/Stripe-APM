import { NextRequest } from 'next/server';
import { getOpenRouterClient, FREE_MODEL } from '@/lib/openrouter';
import { demoTransactions } from '@/lib/demo-transactions';
import { getStripeClient } from '@/lib/stripe';
import { checkRateLimit, getIpFromRequest } from '@/lib/rate-limit';
import { simulateRule } from '@/lib/radar-rules';
import { OPTIMIZER_STEP2_SYSTEM, buildOptimizerStep2Prompt } from '@/prompts/optimizer-step2';
import { OPTIMIZER_STEP3_SYSTEM, buildOptimizerStep3Prompt } from '@/prompts/optimizer-step3';
import { OPTIMIZER_STEP5_SYSTEM, buildOptimizerStep5Prompt } from '@/prompts/optimizer-step5';
import type { DemoTransaction } from '@/lib/demo-transactions';

interface OptimizeRequestBody {
  isDemoMode: boolean;
}

function sseData(payload: Record<string, unknown>): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

async function nonStreamCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await getOpenRouterClient().chat.completions.create({
    model: FREE_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: false,
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content ?? '';
}

export async function POST(request: NextRequest) {
  const ip = getIpFromRequest(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Maximum 20 AI analyses per day.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: OptimizeRequestBody;
  try {
    body = await request.json() as OptimizeRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { isDemoMode } = body;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const enqueue = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(sseData(payload)));
      };

      try {
        // --- Step 1: Fetch transactions ---
        enqueue({ type: 'step', step: 1, label: 'Fetching recent transactions...' });

        let transactions: DemoTransaction[] = demoTransactions;

        if (!isDemoMode) {
          const stripe = getStripeClient();
          if (stripe) {
            try {
              const charges = await stripe.charges.list({ limit: 20, expand: ['data.outcome'] });
              transactions = charges.data.map((charge) => {
                const outcome = charge.outcome;
                let outcomeType: 'pass' | 'block' | 'review' = 'pass';
                if (outcome?.type === 'blocked') outcomeType = 'block';
                else if (outcome?.type === 'manual_review') outcomeType = 'review';

                const riskScore = typeof outcome?.risk_score === 'number' ? outcome.risk_score : 0;
                const billingCountry = charge.billing_details?.address?.country ?? 'US';
                const cardCountry = charge.payment_method_details?.card?.country ?? billingCountry;
                const email = charge.billing_details?.email ?? 'unknown@unknown.com';
                const emailDomain = email.includes('@') ? email.split('@')[1] : 'unknown';

                return {
                  id: charge.id,
                  amount: charge.amount,
                  currency: charge.currency,
                  outcome: outcomeType,
                  risk_score: riskScore,
                  card_country: cardCountry,
                  billing_country: billingCountry,
                  email,
                  email_domain: emailDomain,
                  ip_country: billingCountry,
                  three_d_secure_result:
                    (charge.payment_method_details?.card?.three_d_secure?.result as
                      | 'authenticated'
                      | 'attempted'
                      | 'not_supported'
                      | null) ?? null,
                  is_new_card: false,
                  created_at: new Date(charge.created * 1000).toISOString(),
                  merchant_category: 'general',
                  description: charge.description ?? 'Stripe charge',
                };
              });
            } catch {
              transactions = demoTransactions;
            }
          }
        }

        enqueue({ type: 'transactions', count: transactions.length });

        // If no OpenRouter key, run a mock 5-step analysis
        if (!process.env.OPENROUTER_API_KEY) {
          await runMockOptimizer(transactions, enqueue);
          controller.close();
          return;
        }

        // --- Step 2: Identify false positive candidates ---
        enqueue({ type: 'step', step: 2, label: 'Identifying false-positive candidates...' });

        const step2Prompt = buildOptimizerStep2Prompt(transactions);
        let step2Raw = '';
        for await (const chunk of await getOpenRouterClient().chat.completions.create({
          model: FREE_MODEL,
          messages: [
            { role: 'system', content: OPTIMIZER_STEP2_SYSTEM },
            { role: 'user', content: step2Prompt },
          ],
          stream: true,
          max_tokens: 2000,
        })) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            step2Raw += delta;
            enqueue({ type: 'text', content: delta });
          }
        }

        let step2Data: {
          false_positive_candidates: Array<{ transaction_id: string; fp_confidence: number; reasoning: string; legitimacy_signals: string[] }>;
          pattern: string;
          total_revenue_at_risk: number;
        } = {
          false_positive_candidates: [],
          pattern: 'Transactions with 3DS authenticated but high risk scores',
          total_revenue_at_risk: 52950,
        };

        try {
          const jsonMatch = step2Raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            step2Data = JSON.parse(jsonMatch[0]) as typeof step2Data;
          }
        } catch {
          // Use defaults
        }

        // --- Step 3: Generate Radar Rule ---
        enqueue({ type: 'step', step: 3, label: 'Generating Radar Rule...' });

        const step3Prompt = buildOptimizerStep3Prompt(
          step2Data.pattern,
          step2Data.false_positive_candidates.length,
          step2Data.total_revenue_at_risk
        );

        const step3Raw = await nonStreamCompletion(OPTIMIZER_STEP3_SYSTEM, step3Prompt);

        let step3Data: { rule: string; explanation: string; tradeoffs: string } = {
          rule: `allow if :three_d_secure_result: = 'authenticated' and :email_domain: in ('gmail.com', 'outlook.com') and :risk_score: < 85`,
          explanation: 'Allow transactions that completed 3DS authentication with trusted email domains, even if risk score is elevated.',
          tradeoffs: 'May allow some medium-risk transactions through, but 3DS authentication significantly reduces chargeback liability.',
        };

        try {
          const jsonMatch = step3Raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            step3Data = JSON.parse(jsonMatch[0]) as typeof step3Data;
          }
        } catch {
          // Use defaults
        }

        enqueue({ type: 'rule', content: step3Data.rule, explanation: step3Data.explanation });

        // --- Step 4: Simulate rule ---
        enqueue({ type: 'step', step: 4, label: 'Simulating rule against transactions...' });

        const { results, summary } = simulateRule(step3Data.rule, transactions);

        const beforeCounts = {
          pass: transactions.filter((t) => t.outcome === 'pass').length,
          block: transactions.filter((t) => t.outcome === 'block').length,
          review: transactions.filter((t) => t.outcome === 'review').length,
        };

        const afterCounts = {
          pass: results.filter((r) => r.newOutcome === 'pass').length,
          block: results.filter((r) => r.newOutcome === 'block').length,
          review: results.filter((r) => r.newOutcome === 'review').length,
        };

        const revenueRecovered = results
          .filter((r) => r.changed && r.newOutcome === 'pass' && r.originalOutcome !== 'pass')
          .reduce((sum, r) => {
            const tx = transactions.find((t) => t.id === r.transactionId);
            return sum + (tx?.amount ?? 0);
          }, 0);

        enqueue({
          type: 'simulation',
          before: beforeCounts,
          after: afterCounts,
          changes: results.filter((r) => r.changed).map((r) => ({
            transactionId: r.transactionId,
            from: r.originalOutcome,
            to: r.newOutcome,
            reason: r.reason,
          })),
          summary: {
            ...summary,
            revenueRecovered,
          },
        });

        // --- Step 5: Analyze tradeoffs ---
        enqueue({ type: 'step', step: 5, label: 'Analyzing tradeoffs...' });

        const step5Prompt = buildOptimizerStep5Prompt(
          step3Data.rule,
          step3Data.explanation,
          beforeCounts,
          afterCounts,
          summary.changed,
          summary.falsePositivesRecovered,
          summary.legitBlockedByMistake,
          revenueRecovered
        );

        for await (const chunk of await getOpenRouterClient().chat.completions.create({
          model: FREE_MODEL,
          messages: [
            { role: 'system', content: OPTIMIZER_STEP5_SYSTEM },
            { role: 'user', content: step5Prompt },
          ],
          stream: true,
          max_tokens: 2000,
        })) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            enqueue({ type: 'text', content: delta });
          }
        }

        enqueue({ type: 'done' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Optimization failed';
        enqueue({ type: 'error', message });
        enqueue({ type: 'done' });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

async function runMockOptimizer(
  transactions: DemoTransaction[],
  enqueue: (payload: Record<string, unknown>) => void
): Promise<void> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Step 2
  enqueue({ type: 'step', step: 2, label: 'Identifying false-positive candidates...' });
  await sleep(500);

  const fps = transactions.filter(
    (t) =>
      (t.outcome === 'review' || t.outcome === 'block') &&
      t.three_d_secure_result === 'authenticated' &&
      !t.is_new_card
  );

  const analysis = `Found ${fps.length} potential false positives. These transactions were ${fps.length > 0 ? fps.map((t) => t.id).join(', ') : 'none identified'} — all completed 3DS authentication despite elevated risk scores, suggesting legitimate cardholders traveling abroad or making cross-border purchases.`;

  for (const char of analysis) {
    enqueue({ type: 'text', content: char });
    await sleep(10);
  }

  // Step 3
  enqueue({ type: 'step', step: 3, label: 'Generating Radar Rule...' });
  await sleep(300);

  const rule = `allow if :three_d_secure_result: = 'authenticated' and :email_domain: in ('gmail.com', 'outlook.com') and :is_new_card: = false and :risk_score: < 85`;

  enqueue({
    type: 'rule',
    content: rule,
    explanation:
      'Allow transactions where the cardholder completed 3D Secure authentication with a trusted email domain and is a returning customer — even if the risk score is elevated.',
  });

  // Step 4
  enqueue({ type: 'step', step: 4, label: 'Simulating rule against transactions...' });
  await sleep(300);

  const { results, summary } = simulateRule(rule, transactions);

  const beforeCounts = {
    pass: transactions.filter((t) => t.outcome === 'pass').length,
    block: transactions.filter((t) => t.outcome === 'block').length,
    review: transactions.filter((t) => t.outcome === 'review').length,
  };

  const afterCounts = {
    pass: results.filter((r) => r.newOutcome === 'pass').length,
    block: results.filter((r) => r.newOutcome === 'block').length,
    review: results.filter((r) => r.newOutcome === 'review').length,
  };

  const revenueRecovered = results
    .filter((r) => r.changed && r.newOutcome === 'pass' && r.originalOutcome !== 'pass')
    .reduce((sum, r) => {
      const tx = transactions.find((t) => t.id === r.transactionId);
      return sum + (tx?.amount ?? 0);
    }, 0);

  enqueue({
    type: 'simulation',
    before: beforeCounts,
    after: afterCounts,
    changes: results.filter((r) => r.changed).map((r) => ({
      transactionId: r.transactionId,
      from: r.originalOutcome,
      to: r.newOutcome,
      reason: r.reason,
    })),
    summary: { ...summary, revenueRecovered },
  });

  // Step 5
  enqueue({ type: 'step', step: 5, label: 'Analyzing tradeoffs...' });
  await sleep(300);

  const tradeoff = `## Tradeoff Analysis

**Revenue Impact**: This rule would recover $${(revenueRecovered / 100).toFixed(2)} from ${summary.falsePositivesRecovered} transactions previously blocked or sent to review. These are likely legitimate customers who simply authenticate via 3DS.

**Risk Exposure**: By requiring both 3DS authentication AND a trusted email domain AND returning card status, this rule maintains strong fraud protection. The triple condition means fraud actors would need to simultaneously bypass 3DS, use a legitimate email domain, and use a stolen returning card — a significantly harder attack vector.

**Recommendation**: Implement this rule in Stripe Radar. The 3DS requirement transfers chargeback liability to the issuer, protecting your revenue. Monitor for 30 days and review any chargebacks on rule-allowed transactions.`;

  for (const char of tradeoff) {
    enqueue({ type: 'text', content: char });
    await sleep(5);
  }

  enqueue({ type: 'done' });
}
