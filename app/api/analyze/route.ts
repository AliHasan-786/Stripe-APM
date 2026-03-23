import { NextRequest } from 'next/server';
import { getOpenRouterClient, FREE_MODEL } from '@/lib/openrouter';
import { demoTransactions, getTransactionById, type DemoTransaction } from '@/lib/demo-transactions';
import { getStripeClient } from '@/lib/stripe';
import { checkRateLimit, getIpFromRequest } from '@/lib/rate-limit';
import { EXPLAINER_SYSTEM_PROMPT } from '@/prompts/explainer-system';
import { buildExplainerUserPrompt } from '@/prompts/explainer-user';

interface AnalyzeRequestBody {
  transactionId: string;
  isDemoMode: boolean;
}

function sseData(payload: Record<string, unknown>): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(request: NextRequest) {
  const ip = getIpFromRequest(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Maximum 20 AI analyses per day.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json() as AnalyzeRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { transactionId, isDemoMode } = body;

  let transaction: DemoTransaction | null = null;

  if (isDemoMode) {
    transaction = getTransactionById(transactionId) ?? null;
  } else {
    // Try to fetch from Stripe using server-side key
    const stripe = getStripeClient();
    if (stripe) {
      try {
        const charge = await stripe.charges.retrieve(transactionId, {
          expand: ['outcome'],
        });
        const outcome = charge.outcome;
        let outcomeType: 'pass' | 'block' | 'review' = 'pass';
        if (outcome?.type === 'blocked') outcomeType = 'block';
        else if (outcome?.type === 'manual_review') outcomeType = 'review';

        const riskScore = typeof outcome?.risk_score === 'number' ? outcome.risk_score : 0;
        const billingCountry = charge.billing_details?.address?.country ?? 'US';
        const cardCountry = charge.payment_method_details?.card?.country ?? billingCountry;
        const email = charge.billing_details?.email ?? 'unknown@unknown.com';
        const emailDomain = email.includes('@') ? email.split('@')[1] : 'unknown';

        transaction = {
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
      } catch {
        // Fall back to demo
        transaction = getTransactionById(transactionId) ?? null;
      }
    }
  }

  if (!transaction) {
    // If not found in demo, try demo transactions as fallback
    const demoFallback = demoTransactions[0];
    transaction = demoFallback;
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const enqueue = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(sseData(data)));
      };

      if (!process.env.OPENROUTER_API_KEY) {
        // No API key — stream a mock analysis
        enqueue({ type: 'text', content: buildMockAnalysis(transaction!) });
        enqueue({ type: 'done' });
        controller.close();
        return;
      }

      try {
        const userPrompt = buildExplainerUserPrompt(transaction!);
        const stream = await getOpenRouterClient().chat.completions.create({
          model: FREE_MODEL,
          messages: [
            { role: 'system', content: EXPLAINER_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          stream: true,
          max_tokens: 3000,
        });

        let fullContent = '';
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            fullContent += delta;
            enqueue({ type: 'text', content: delta });
          }
        }

        // Validate JSON and send parsed result
        try {
          const parsed = JSON.parse(fullContent) as Record<string, unknown>;
          enqueue({ type: 'parsed', data: parsed });
        } catch {
          // Content wasn't valid JSON — send as-is
        }

        enqueue({ type: 'done' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI analysis failed';
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
      'X-RateLimit-Remaining': String(rateLimit.remaining),
    },
  });
}

function buildMockAnalysis(tx: DemoTransaction): string {
  const isFraud = tx.risk_score >= 70;
  const isAmbiguous = tx.risk_score >= 40 && tx.risk_score < 70;
  const verdict = isFraud ? 'Likely Fraud' : isAmbiguous ? 'Ambiguous' : 'Likely Legitimate';
  const confidence = tx.risk_score;

  return JSON.stringify({
    confidence_score: confidence,
    verdict,
    risk_signals: [
      ...(tx.card_country !== tx.billing_country
        ? [{ signal: 'Country Mismatch', severity: 'high', explanation: `Card issued in ${tx.card_country} but billing address is in ${tx.billing_country}. This is a strong fraud indicator.` }]
        : [{ signal: 'Country Match', severity: 'low', explanation: `Card country and billing country both match (${tx.card_country}). Positive signal.` }]),
      ...(tx.ip_country !== tx.billing_country
        ? [{ signal: 'IP Location Mismatch', severity: 'medium', explanation: `IP address geolocates to ${tx.ip_country}, but billing address is ${tx.billing_country}.` }]
        : []),
      ...(tx.three_d_secure_result === 'authenticated'
        ? [{ signal: '3DS Authenticated', severity: 'low', explanation: '3D Secure authentication was fully completed. Strong signal of legitimate cardholder.' }]
        : tx.three_d_secure_result === null
        ? [{ signal: '3DS Not Attempted', severity: 'medium', explanation: 'No 3D Secure authentication was attempted. Higher fraud risk.' }]
        : []),
      ...(tx.is_new_card
        ? [{ signal: 'New Card', severity: 'medium', explanation: 'This card has not been seen before. First-time card usage carries higher risk.' }]
        : [{ signal: 'Returning Card', severity: 'low', explanation: 'This card has been seen before, suggesting an established customer.' }]),
      ...(tx.email_domain.includes('tempmail') || tx.email_domain.includes('guerrilla') || tx.email_domain.includes('yopmail')
        ? [{ signal: 'Disposable Email', severity: 'high', explanation: `${tx.email_domain} is a known disposable email domain frequently used in fraud.` }]
        : [{ signal: 'Established Email Domain', severity: 'low', explanation: `${tx.email_domain} is a legitimate email provider.` }]),
    ],
    developer_explanation: `This transaction (${tx.id}) received a Radar risk score of ${tx.risk_score}/100, which ${isFraud ? 'exceeds' : isAmbiguous ? 'approaches' : 'is well below'} the default block threshold of 75. ${tx.outcome === 'block' ? 'The default Radar block rule triggered, halting this payment.' : tx.outcome === 'review' ? 'The transaction was sent to manual review due to elevated risk signals.' : 'Radar allowed this transaction through after evaluating all signals.'}\n\nKey signals evaluated: card_country=${tx.card_country}, billing_country=${tx.billing_country}, ip_country=${tx.ip_country}, three_d_secure_result=${tx.three_d_secure_result ?? 'null'}, is_new_card=${tx.is_new_card}.\n\nThe primary risk factors are ${tx.card_country !== tx.billing_country ? 'the geographic mismatch between card issuance and billing' : 'the elevated risk score'} and ${tx.three_d_secure_result === null ? 'the absence of 3DS authentication' : 'the authentication status'}.`,
    merchant_explanation: `${verdict === 'Likely Fraud' ? `This payment was blocked because it showed multiple signs of fraud, including ${tx.card_country !== tx.billing_country ? 'a mismatch between where the card was issued and the billing address' : 'an unusually high fraud risk score'}. This protects your business from chargebacks.` : verdict === 'Ambiguous' ? `This payment shows some unusual patterns that triggered a review. ${tx.three_d_secure_result === 'authenticated' ? 'However, the customer completed identity verification (3D Secure), which is a positive sign.' : 'We recommend reviewing this order manually before fulfilling it.'} ` : `This payment looks legitimate. All key signals — card country, billing address, email, and authentication — are consistent with a genuine customer.`}`,
    recommended_action: isFraud
      ? 'Refund and investigate'
      : isAmbiguous
      ? 'Request additional verification'
      : 'No action needed',
    radar_rule_suggestion:
      tx.three_d_secure_result === 'authenticated' && tx.risk_score > 70 && !tx.is_new_card
        ? `allow if :three_d_secure_result: = 'authenticated' and :risk_score: < 85 and :is_new_card: = false`
        : null,
  });
}
