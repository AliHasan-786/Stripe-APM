import type { DemoTransaction } from '@/lib/demo-transactions';

export function buildExplainerUserPrompt(transaction: DemoTransaction): string {
  const amountFormatted = (transaction.amount / 100).toFixed(2);
  const outcomeLabel =
    transaction.outcome === 'pass'
      ? 'PASSED (allowed)'
      : transaction.outcome === 'block'
      ? 'BLOCKED'
      : 'FLAGGED FOR REVIEW';

  return `Analyze this Stripe payment transaction and explain the fraud decision:

TRANSACTION DETAILS:
- ID: ${transaction.id}
- Amount: $${amountFormatted} ${transaction.currency.toUpperCase()}
- Outcome: ${outcomeLabel}
- Risk Score: ${transaction.risk_score}/100
- Merchant Category: ${transaction.merchant_category}
- Date/Time: ${transaction.created_at}

CARDHOLDER & GEOGRAPHY:
- Card Issued In: ${transaction.card_country}
- Billing Address Country: ${transaction.billing_country}
- IP Address Country: ${transaction.ip_country}
- Card/Billing Country Match: ${transaction.card_country === transaction.billing_country ? 'YES' : 'NO — MISMATCH'}
- IP/Billing Country Match: ${transaction.ip_country === transaction.billing_country ? 'YES' : 'NO — MISMATCH'}

AUTHENTICATION:
- 3D Secure Result: ${transaction.three_d_secure_result ?? 'Not attempted'}
- New Card (first time seen): ${transaction.is_new_card ? 'YES' : 'NO — returning card'}

EMAIL SIGNALS:
- Email: ${transaction.email}
- Email Domain: ${transaction.email_domain}
- Domain Type: ${getEmailDomainType(transaction.email_domain)}

CONTEXT:
${transaction.description}

Please analyze all signals and provide your structured JSON response explaining this fraud decision.`;
}

function getEmailDomainType(domain: string): string {
  const disposable = [
    'tempmail.io', 'guerrillamail.com', 'yopmail.com', 'mailinator.com',
    'throwaway.email', 'sharklasers.com', 'guerrillamailblock.com',
    '10minutemail.com', 'dispostable.com', 'fakeinbox.com',
  ];
  const freemail = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'hotmail.fr', 'web.de'];

  if (disposable.includes(domain.toLowerCase())) return 'DISPOSABLE / SPAM EMAIL DOMAIN';
  if (freemail.includes(domain.toLowerCase())) return 'Free webmail provider';
  return 'Custom / business domain';
}
