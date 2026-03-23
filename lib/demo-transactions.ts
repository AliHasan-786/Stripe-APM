export interface DemoTransaction {
  id: string;
  amount: number;
  currency: string;
  outcome: 'pass' | 'block' | 'review';
  risk_score: number;
  card_country: string;
  billing_country: string;
  email: string;
  email_domain: string;
  ip_country: string;
  three_d_secure_result: 'authenticated' | 'attempted' | 'not_supported' | null;
  is_new_card: boolean;
  created_at: string;
  merchant_category: string;
  description: string;
}

export const demoTransactions: DemoTransaction[] = [
  // Clear fraud — high risk, blocked, card country mismatch
  {
    id: 'ch_demo_fraud_001',
    amount: 29900,
    currency: 'usd',
    outcome: 'block',
    risk_score: 92,
    card_country: 'NG',
    billing_country: 'US',
    email: 'john.doe1983@tempmail.io',
    email_domain: 'tempmail.io',
    ip_country: 'RU',
    three_d_secure_result: null,
    is_new_card: true,
    created_at: '2026-03-21T02:14:33Z',
    merchant_category: 'electronics',
    description: 'High-value electronics — card issued in Nigeria, IP from Russia, billing US. Disposable email.',
  },
  {
    id: 'ch_demo_fraud_002',
    amount: 89500,
    currency: 'usd',
    outcome: 'block',
    risk_score: 88,
    card_country: 'UA',
    billing_country: 'CA',
    email: 'buyer2024@guerrillamail.com',
    email_domain: 'guerrillamail.com',
    ip_country: 'CN',
    three_d_secure_result: 'attempted',
    is_new_card: true,
    created_at: '2026-03-20T23:47:11Z',
    merchant_category: 'digital_goods',
    description: 'Large digital goods purchase. Card from Ukraine, IP from China, billing Canada. Known disposable email domain.',
  },
  {
    id: 'ch_demo_fraud_003',
    amount: 149999,
    currency: 'usd',
    outcome: 'block',
    risk_score: 95,
    card_country: 'PK',
    billing_country: 'GB',
    email: 'fast.buyer99@yopmail.com',
    email_domain: 'yopmail.com',
    ip_country: 'IR',
    three_d_secure_result: null,
    is_new_card: true,
    created_at: '2026-03-20T18:02:55Z',
    merchant_category: 'jewelry',
    description: 'Very high-value jewelry purchase. Card from Pakistan, IP from Iran, billing UK. Yopmail is a known spam domain.',
  },

  // Legitimate transactions — low risk, 3DS authenticated
  {
    id: 'ch_demo_legit_001',
    amount: 4999,
    currency: 'usd',
    outcome: 'pass',
    risk_score: 12,
    card_country: 'US',
    billing_country: 'US',
    email: 'sarah.johnson@gmail.com',
    email_domain: 'gmail.com',
    ip_country: 'US',
    three_d_secure_result: 'authenticated',
    is_new_card: false,
    created_at: '2026-03-22T10:30:00Z',
    merchant_category: 'software',
    description: 'SaaS subscription renewal. Returning customer, US card and IP, 3DS authenticated.',
  },
  {
    id: 'ch_demo_legit_002',
    amount: 12500,
    currency: 'usd',
    outcome: 'pass',
    risk_score: 18,
    card_country: 'GB',
    billing_country: 'GB',
    email: 'james.whitfield@outlook.com',
    email_domain: 'outlook.com',
    ip_country: 'GB',
    three_d_secure_result: 'authenticated',
    is_new_card: false,
    created_at: '2026-03-22T09:15:22Z',
    merchant_category: 'clothing',
    description: 'Retail purchase from UK. All signals consistent, returning cardholder, 3DS passed.',
  },
  {
    id: 'ch_demo_legit_003',
    amount: 7800,
    currency: 'usd',
    outcome: 'pass',
    risk_score: 28,
    card_country: 'DE',
    billing_country: 'DE',
    email: 'm.hoffmann@web.de',
    email_domain: 'web.de',
    ip_country: 'DE',
    three_d_secure_result: 'authenticated',
    is_new_card: false,
    created_at: '2026-03-22T08:45:10Z',
    merchant_category: 'travel',
    description: 'Travel booking from Germany. Established email domain, consistent geography, 3DS authenticated.',
  },

  // Ambiguous transactions — medium risk, some signals
  {
    id: 'ch_demo_ambig_001',
    amount: 23400,
    currency: 'usd',
    outcome: 'review',
    risk_score: 62,
    card_country: 'US',
    billing_country: 'US',
    email: 'buyer_deals@yahoo.com',
    email_domain: 'yahoo.com',
    ip_country: 'MX',
    three_d_secure_result: 'attempted',
    is_new_card: true,
    created_at: '2026-03-21T16:30:45Z',
    merchant_category: 'electronics',
    description: 'New card, US billing but IP from Mexico. 3DS attempted (not fully authenticated). Yahoo email.',
  },
  {
    id: 'ch_demo_ambig_002',
    amount: 55000,
    currency: 'usd',
    outcome: 'pass',
    risk_score: 68,
    card_country: 'FR',
    billing_country: 'US',
    email: 'alex.moreau@hotmail.fr',
    email_domain: 'hotmail.fr',
    ip_country: 'FR',
    three_d_secure_result: 'not_supported',
    is_new_card: true,
    created_at: '2026-03-21T14:22:18Z',
    merchant_category: 'home_goods',
    description: 'High-value home goods. French card and IP but US billing address. New card, 3DS not supported by issuer.',
  },

  // Potential false positives — high score but legitimate signals
  {
    id: 'ch_demo_fp_001',
    amount: 18750,
    currency: 'usd',
    outcome: 'review',
    risk_score: 78,
    card_country: 'IN',
    billing_country: 'US',
    email: 'priya.sharma@gmail.com',
    email_domain: 'gmail.com',
    ip_country: 'IN',
    three_d_secure_result: 'authenticated',
    is_new_card: false,
    created_at: '2026-03-21T12:10:33Z',
    merchant_category: 'software',
    description: 'Likely false positive. Indian immigrant paying US bill while traveling. Gmail, 3DS authenticated, returning card.',
  },
  {
    id: 'ch_demo_fp_002',
    amount: 34200,
    currency: 'usd',
    outcome: 'review',
    risk_score: 82,
    card_country: 'BR',
    billing_country: 'US',
    email: 'lucas.ferreira@gmail.com',
    email_domain: 'gmail.com',
    ip_country: 'BR',
    three_d_secure_result: 'authenticated',
    is_new_card: false,
    created_at: '2026-03-21T08:55:47Z',
    merchant_category: 'digital_goods',
    description: 'Potential false positive. Brazilian customer buying US digital goods. Gmail, 3DS authenticated, returning cardholder.',
  },
];

export function getTransactionById(id: string): DemoTransaction | undefined {
  return demoTransactions.find((t) => t.id === id);
}
