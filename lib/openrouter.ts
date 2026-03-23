import OpenAI from 'openai';

export function getOpenRouterClient(): OpenAI {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'demo-mode',
    defaultHeaders: {
      'HTTP-Referer': 'https://stripe-radar-copilot.vercel.app',
      'X-Title': 'Stripe Radar Copilot',
    },
  });
}

export const FREE_MODEL = 'nvidia/nemotron-super-49b-v1:free';
