'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RuleOptimizer from '@/components/RuleOptimizer';
import DemoModeBanner from '@/components/DemoModeBanner';

function OptimizeContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [stripeKey, setStripeKey] = useState<string | undefined>();
  const [isActuallyDemo, setIsActuallyDemo] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('stripeKey');
      if (key) {
        setStripeKey(key);
        setIsActuallyDemo(false);
      } else {
        setIsActuallyDemo(true);
      }
    }
    if (isDemo) setIsActuallyDemo(true);
  }, [isDemo]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rule Optimizer</h1>
        <p className="text-gray-500 text-sm mt-1">
          A 5-step AI agent analyzes your transactions, identifies false positives, generates a
          targeted Stripe Radar rule, simulates its impact, and recommends whether to deploy it.
        </p>
      </div>

      {isActuallyDemo && <DemoModeBanner className="mb-6" />}

      {/* Info cards */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {[
          {
            icon: '🔎',
            title: 'Step 1-2',
            desc: 'Fetches transactions and identifies false positive candidates',
          },
          {
            icon: '⚡',
            title: 'Step 3-4',
            desc: 'Generates a Stripe Radar rule and simulates its impact',
          },
          {
            icon: '📊',
            title: 'Step 5',
            desc: 'Analyzes the revenue vs. risk tradeoff with a clear recommendation',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xs font-semibold text-gray-500 mb-1">{card.title}</p>
            <p className="text-sm text-gray-600">{card.desc}</p>
          </div>
        ))}
      </div>

      <RuleOptimizer isDemoMode={isActuallyDemo} stripeKey={stripeKey} />
    </div>
  );
}

export default function OptimizePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      }
    >
      <OptimizeContent />
    </Suspense>
  );
}
