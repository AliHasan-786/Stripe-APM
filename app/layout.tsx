import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Stripe Radar Copilot — AI-Powered Fraud Decision Explainer',
  description:
    'Understand why Stripe Radar blocked or flagged a transaction. Get plain-English explanations, developer insights, and AI-generated Radar rules to reduce false positives.',
  keywords: ['Stripe', 'Radar', 'fraud detection', 'payment fraud', 'false positives', 'Stripe Radar rules'],
  authors: [{ name: 'Ali Hasan', url: 'https://github.com/AliHasan-786' }],
  openGraph: {
    title: 'Stripe Radar Copilot',
    description: 'AI-powered explanations for Stripe Radar fraud decisions. Reduce false positives with confidence.',
    url: 'https://stripe-radar-copilot.vercel.app',
    siteName: 'Stripe Radar Copilot',
    type: 'website',
    images: [
      {
        url: 'https://stripe-radar-copilot.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stripe Radar Copilot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stripe Radar Copilot',
    description: 'AI-powered explanations for Stripe Radar fraud decisions.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
