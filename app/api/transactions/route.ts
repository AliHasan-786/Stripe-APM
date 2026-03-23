import { NextRequest, NextResponse } from 'next/server';
import { demoTransactions, type DemoTransaction } from '@/lib/demo-transactions';
import { getStripeClient } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get('demo') === 'true';

  // Key is always server-side — never accepted from client
  const stripe = isDemo ? null : getStripeClient();

  if (!stripe) {
    return NextResponse.json({
      transactions: demoTransactions,
      isDemo: true,
      source: 'demo',
    });
  }

  try {
    const charges = await stripe.charges.list({ limit: 20, expand: ['data.outcome'] });

    // Fall back to demo if account has no transactions yet
    if (charges.data.length === 0) {
      return NextResponse.json({
        transactions: demoTransactions,
        isDemo: true,
        source: 'demo',
      });
    }

    const transactions: DemoTransaction[] = charges.data.map((charge) => {
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

    return NextResponse.json({ transactions, isDemo: false, source: 'stripe' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
    // Fall back to demo on any Stripe error
    return NextResponse.json({
      transactions: demoTransactions,
      isDemo: true,
      source: 'demo',
      warning: message,
    });
  }
}
