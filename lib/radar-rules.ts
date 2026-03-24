import type { DemoTransaction } from './demo-transactions';

export interface RadarRule {
  action: 'allow' | 'block' | 'review';
  conditions: string;
  raw: string;
}

export interface SimulationResult {
  transactionId: string;
  originalOutcome: string;
  newOutcome: string;
  changed: boolean;
  reason: string;
}

export interface SimulationSummary {
  total: number;
  changed: number;
  wouldAllow: number;
  wouldBlock: number;
  wouldReview: number;
  falsePositivesRecovered: number;
  legitBlockedByMistake: number;
}

/**
 * Parses a Stripe Radar-style rule string.
 * Supports patterns like:
 *   allow if :email_domain: in ('gmail.com', 'outlook.com') and :three_d_secure_result: = 'authenticated'
 *   block if :risk_score: > 80
 *   review if :card_country: != :billing_country:
 */
export function parseRule(raw: string): RadarRule | null {
  const trimmed = raw.trim().toLowerCase();
  const match = trimmed.match(/^(allow|block|review)\s+if\s+(.+)$/);
  if (!match) return null;
  return {
    action: match[1] as 'allow' | 'block' | 'review',
    conditions: match[2],
    raw,
  };
}

type TransactionValue = string | number | boolean | null;

function getTransactionField(tx: DemoTransaction, field: string): TransactionValue {
  const map: Record<string, TransactionValue> = {
    email_domain: tx.email_domain,
    card_country: tx.card_country,
    billing_country: tx.billing_country,
    ip_country: tx.ip_country,
    risk_score: tx.risk_score,
    three_d_secure_result: tx.three_d_secure_result,
    is_new_card: tx.is_new_card,
    amount: tx.amount,
    currency: tx.currency,
    merchant_category: tx.merchant_category,
  };
  return map[field] ?? null;
}

/**
 * Evaluates a single condition token against a transaction.
 * Supports: =, !=, >, <, >=, <=, in (list)
 */
function evaluateCondition(condition: string, tx: DemoTransaction): boolean {
  const inMatch = condition.match(/:(\w+):\s+in\s+\(([^)]+)\)/);
  if (inMatch) {
    const field = inMatch[1];
    const values = inMatch[2]
      .split(',')
      .map((v) => v.trim().replace(/['"]/g, '').toLowerCase());
    const txVal = String(getTransactionField(tx, field) ?? '').toLowerCase();
    return values.includes(txVal);
  }

  const notInMatch = condition.match(/:(\w+):\s+not\s+in\s+\(([^)]+)\)/);
  if (notInMatch) {
    const field = notInMatch[1];
    const values = notInMatch[2]
      .split(',')
      .map((v) => v.trim().replace(/['"]/g, '').toLowerCase());
    const txVal = String(getTransactionField(tx, field) ?? '').toLowerCase();
    return !values.includes(txVal);
  }

  const compMatch = condition.match(/:(\w+):\s*(=|!=|>=|<=|>|<)\s*['"]?([^'"]+)['"]?/);
  if (compMatch) {
    const field = compMatch[1];
    const op = compMatch[2];
    const compareVal = compMatch[3].trim();
    const txVal = getTransactionField(tx, field);

    const numCompare = parseFloat(compareVal);
    const numTxVal = typeof txVal === 'number' ? txVal : parseFloat(String(txVal));

    if (!isNaN(numCompare) && !isNaN(numTxVal)) {
      switch (op) {
        case '=': return numTxVal === numCompare;
        case '!=': return numTxVal !== numCompare;
        case '>': return numTxVal > numCompare;
        case '<': return numTxVal < numCompare;
        case '>=': return numTxVal >= numCompare;
        case '<=': return numTxVal <= numCompare;
      }
    }

    const strTxVal = String(txVal ?? '').toLowerCase();
    const strCompare = compareVal.toLowerCase();
    switch (op) {
      case '=': return strTxVal === strCompare;
      case '!=': return strTxVal !== strCompare;
    }
  }

  return false;
}

/**
 * Evaluates a compound condition string (supports AND/OR) against a transaction.
 */
function evaluateConditions(conditions: string, tx: DemoTransaction): boolean {
  // Split on ' or ' first (lower precedence)
  const orParts = conditions.split(/\s+or\s+/i);
  return orParts.some((orPart) => {
    const andParts = orPart.split(/\s+and\s+/i);
    return andParts.every((part) => evaluateCondition(part.trim(), tx));
  });
}

export function simulateRule(
  ruleRaw: string,
  transactions: DemoTransaction[]
): { results: SimulationResult[]; summary: SimulationSummary } {
  const rule = parseRule(ruleRaw);

  const results: SimulationResult[] = transactions.map((tx) => {
    if (!rule) {
      return {
        transactionId: tx.id,
        originalOutcome: tx.outcome,
        newOutcome: tx.outcome,
        changed: false,
        reason: 'Could not parse rule',
      };
    }

    const matches = evaluateConditions(rule.conditions, tx);
    // Normalize 'allow' → 'pass': Stripe Radar uses 'allow' in rules
    // but transaction outcomes are stored as 'pass'/'block'/'review'
    const ruleOutcome = rule.action === 'allow' ? 'pass' : rule.action;
    const newOutcome = matches ? ruleOutcome : tx.outcome;
    const changed = newOutcome !== tx.outcome;

    return {
      transactionId: tx.id,
      originalOutcome: tx.outcome,
      newOutcome,
      changed,
      reason: matches
        ? `Rule matched — outcome changed to '${rule.action}'`
        : 'Rule did not match — outcome unchanged',
    };
  });

  const summary: SimulationSummary = {
    total: transactions.length,
    changed: results.filter((r) => r.changed).length,
    wouldAllow: results.filter((r) => r.newOutcome === 'pass').length,
    wouldBlock: results.filter((r) => r.newOutcome === 'block').length,
    wouldReview: results.filter((r) => r.newOutcome === 'review').length,
    falsePositivesRecovered: results.filter(
      (r) => r.changed && r.originalOutcome !== 'pass' && r.newOutcome === 'pass'
    ).length,
    legitBlockedByMistake: results.filter(
      (r) => r.changed && r.originalOutcome === 'pass' && r.newOutcome === 'block'
    ).length,
  };

  return { results, summary };
}
