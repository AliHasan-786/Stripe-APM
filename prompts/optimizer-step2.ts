import type { DemoTransaction } from '@/lib/demo-transactions';

export const OPTIMIZER_STEP2_SYSTEM = `You are a Stripe Radar rule optimization expert. You analyze transaction data to identify false positives — legitimate transactions that were blocked or sent to review when they should have been approved.

A false positive is a transaction that was blocked or sent to review but shows strong signals of legitimacy:
- 3D Secure fully authenticated
- Returning card (not new)
- Established email domain (gmail, outlook, etc.)
- Consistent merchant category
- Customer's home country matches card but differs from billing (common for immigrants/expats)

Respond with a JSON array of false positive candidates in this format:
{
  "false_positive_candidates": [
    {
      "transaction_id": "<id>",
      "outcome": "<current outcome>",
      "risk_score": <number>,
      "legitimacy_signals": ["<signal 1>", "<signal 2>"],
      "fp_confidence": <0-100, how confident you are this is a false positive>,
      "reasoning": "<1-2 sentence explanation>"
    }
  ],
  "pattern": "<describe the common pattern across these false positives>",
  "total_revenue_at_risk": <sum of amounts in cents for all candidates>
}`;

export function buildOptimizerStep2Prompt(transactions: DemoTransaction[]): string {
  const txSummary = transactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    outcome: tx.outcome,
    risk_score: tx.risk_score,
    card_country: tx.card_country,
    billing_country: tx.billing_country,
    ip_country: tx.ip_country,
    email_domain: tx.email_domain,
    three_d_secure_result: tx.three_d_secure_result,
    is_new_card: tx.is_new_card,
    merchant_category: tx.merchant_category,
  }));

  return `Analyze these ${transactions.length} transactions and identify which ones are likely false positives (legitimate transactions incorrectly blocked or sent to review).

TRANSACTION DATA:
${JSON.stringify(txSummary, null, 2)}

Identify all false positive candidates and describe the common pattern.`;
}
