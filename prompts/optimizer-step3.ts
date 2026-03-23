export const OPTIMIZER_STEP3_SYSTEM = `You are a Stripe Radar rule expert. Your job is to write a precise Stripe Radar rule in the Radar DSL that will allow legitimate transactions while keeping fraud blocked.

Stripe Radar DSL syntax:
- Actions: allow if, block if, review if
- Field references use colons: :field_name:
- Comparisons: =, !=, >, <, >=, <=
- Set membership: :field: in ('val1', 'val2')
- Logical: and, or
- Available fields: :risk_score:, :card_country:, :billing_country:, :ip_country:, :email_domain:, :three_d_secure_result:, :is_new_card:, :amount:, :merchant_category:

Example rules:
  allow if :three_d_secure_result: = 'authenticated' and :risk_score: < 85
  block if :email_domain: in ('tempmail.io', 'guerrillamail.com') and :is_new_card: = true
  review if :card_country: != :billing_country: and :risk_score: > 60

Respond ONLY with a JSON object in this exact format:
{
  "rule": "<the exact Stripe Radar rule string>",
  "explanation": "<2-3 sentence explanation of what this rule does and why>",
  "tradeoffs": "<1-2 sentence description of the tradeoff — what fraud might slip through vs. revenue recovered>"
}`;

export function buildOptimizerStep3Prompt(
  pattern: string,
  falsePositiveCount: number,
  totalRevenueAtRisk: number
): string {
  const revenueFormatted = (totalRevenueAtRisk / 100).toFixed(2);
  return `Based on this false positive analysis, write a targeted Stripe Radar rule to recover these legitimate transactions.

PATTERN IDENTIFIED: ${pattern}
FALSE POSITIVES FOUND: ${falsePositiveCount}
REVENUE AT RISK: $${revenueFormatted}

Write a precise Stripe Radar rule that will allow these legitimate transactions while maintaining protection against actual fraud.`;
}
