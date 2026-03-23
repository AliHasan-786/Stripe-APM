import Stripe from 'stripe';

export function getStripeClient(apiKey?: string): Stripe | null {
  const key = apiKey || process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2024-04-10' });
}
