export const OPTIMIZER_STEP5_SYSTEM = `You are a Stripe risk and revenue strategy expert. Analyze the impact of a proposed Stripe Radar rule change and provide a balanced tradeoff assessment.

Your analysis should cover:
1. Revenue impact — how much revenue is recovered from false positives
2. Risk exposure — what fraud risk is introduced
3. Operational impact — effect on manual review queue
4. Recommendation — clear yes/no with conditions

Respond in clear markdown-formatted text (not JSON). Use headers and bullet points. Keep it concise — 3-4 paragraphs maximum.`;

export function buildOptimizerStep5Prompt(
  rule: string,
  explanation: string,
  simulationBefore: Record<string, number>,
  simulationAfter: Record<string, number>,
  changes: number,
  falsePositivesRecovered: number,
  legitBlockedByMistake: number,
  totalRevenueRecovered: number
): string {
  return `Analyze the tradeoffs of implementing this Stripe Radar rule:

PROPOSED RULE:
\`${rule}\`

RULE EXPLANATION: ${explanation}

SIMULATION RESULTS:
Before rule:
- Passed: ${simulationBefore.pass ?? 0} transactions
- Blocked: ${simulationBefore.block ?? 0} transactions
- In Review: ${simulationBefore.review ?? 0} transactions

After rule:
- Passed: ${simulationAfter.pass ?? 0} transactions
- Blocked: ${simulationAfter.block ?? 0} transactions
- In Review: ${simulationAfter.review ?? 0} transactions

Changes:
- Total transactions affected: ${changes}
- False positives recovered (review/block → pass): ${falsePositivesRecovered}
- Legitimate transactions incorrectly blocked: ${legitBlockedByMistake}
- Estimated revenue recovered: $${(totalRevenueRecovered / 100).toFixed(2)}

Provide a balanced tradeoff analysis and a clear recommendation on whether to implement this rule.`;
}
