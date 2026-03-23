'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TransactionTable from '@/components/TransactionTable';
import DemoModeBanner from '@/components/DemoModeBanner';
import type { DemoTransaction } from '@/lib/demo-transactions';

function TransactionsContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActuallyDemo, setIsActuallyDemo] = useState(false);

  useEffect(() => {
    const url = isDemo ? '/api/transactions?demo=true' : '/api/transactions';

    fetch(url)
      .then((res) => res.json())
      .then((data: { transactions: DemoTransaction[]; isDemo: boolean; error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTransactions(data.transactions ?? []);
          setIsActuallyDemo(data.isDemo);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      })
      .finally(() => setLoading(false));
  }, [isDemo]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Explorer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse recent transactions, filter by outcome and risk score, and click any row to get an
          AI explanation.
        </p>
      </div>

      {isActuallyDemo && <DemoModeBanner className="mb-6" />}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Error loading transactions: {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Transaction ID', 'Amount', 'Outcome', 'Risk', 'Country', '3DS', 'Date'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <TransactionTable transactions={transactions} isDemo={isActuallyDemo} />
      )}

      {!loading && transactions.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Click any transaction row to get an AI-powered explanation of the fraud decision.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
