'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DemoTransaction } from '@/lib/demo-transactions';

interface TransactionTableProps {
  transactions: DemoTransaction[];
  isDemo: boolean;
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const styles: Record<string, string> = {
    pass: 'bg-green-100 text-green-800 border-green-200',
    block: 'bg-red-100 text-red-800 border-red-200',
    review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  const labels: Record<string, string> = {
    pass: 'Passed',
    block: 'Blocked',
    review: 'Review',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[outcome] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}
    >
      {labels[outcome] ?? outcome}
    </span>
  );
}

function RiskScore({ score }: { score: number }) {
  const color =
    score >= 70
      ? 'text-red-600 bg-red-50'
      : score >= 40
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-green-600 bg-green-50';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold tabular-nums ${color}`}>
      {score}
    </span>
  );
}

function ThreeDSBadge({ result }: { result: DemoTransaction['three_d_secure_result'] }) {
  if (!result) return <span className="text-gray-400 text-xs">None</span>;
  const styles: Record<string, string> = {
    authenticated: 'text-green-700 bg-green-50',
    attempted: 'text-yellow-700 bg-yellow-50',
    not_supported: 'text-gray-600 bg-gray-50',
  };
  const labels: Record<string, string> = {
    authenticated: '3DS Auth',
    attempted: '3DS Attempt',
    not_supported: 'No 3DS',
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${styles[result]}`}>
      {labels[result]}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function TransactionTable({ transactions, isDemo }: TransactionTableProps) {
  const router = useRouter();
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [showFPOnly, setShowFPOnly] = useState(false);
  const [minRisk, setMinRisk] = useState(0);
  const [maxRisk, setMaxRisk] = useState(100);

  const isFP = (tx: DemoTransaction) =>
    tx.risk_score >= 70 &&
    tx.outcome !== 'pass' &&
    tx.three_d_secure_result === 'authenticated' &&
    !tx.is_new_card;

  const filtered = transactions.filter((tx) => {
    if (outcomeFilter !== 'all' && tx.outcome !== outcomeFilter) return false;
    if (tx.risk_score < minRisk || tx.risk_score > maxRisk) return false;
    if (showFPOnly && !isFP(tx)) return false;
    return true;
  });

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Outcome</label>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All</option>
            <option value="pass">Passed</option>
            <option value="block">Blocked</option>
            <option value="review">Review</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
            Risk Score
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={minRisk}
            onChange={(e) => setMinRisk(Number(e.target.value))}
            className="w-14 text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="number"
            min={0}
            max={100}
            value={maxRisk}
            onChange={(e) => setMaxRisk(Number(e.target.value))}
            className="w-14 text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="100"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFPOnly}
            onChange={(e) => setShowFPOnly(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-xs font-medium text-gray-600">Potential false positives only</span>
        </label>

        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} of {transactions.length} transactions
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Outcome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Card Country
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                3DS
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <p className="font-medium">No transactions match your filters</p>
                    <button
                      onClick={() => {
                        setOutcomeFilter('all');
                        setMinRisk(0);
                        setMaxRisk(100);
                        setShowFPOnly(false);
                      }}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() =>
                    router.push(
                      `/transaction/${tx.id}${isDemo ? '?demo=true' : ''}`
                    )
                  }
                  className="hover:bg-purple-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[120px]" title={tx.id}>
                        {tx.id.length > 20 ? `${tx.id.slice(0, 20)}...` : tx.id}
                      </span>
                      {isFP(tx) && (
                        <span
                          title="Potential false positive"
                          className="text-yellow-500 flex-shrink-0"
                        >
                          ⚠
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium text-gray-900">
                    ${(tx.amount / 100).toFixed(2)}
                    <span className="text-gray-400 text-xs ml-1 uppercase">{tx.currency}</span>
                  </td>
                  <td className="px-4 py-3">
                    <OutcomeBadge outcome={tx.outcome} />
                  </td>
                  <td className="px-4 py-3">
                    <RiskScore score={tx.risk_score} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    <span
                      className={
                        tx.card_country !== tx.billing_country
                          ? 'text-red-600 font-medium'
                          : ''
                      }
                      title={`Billing: ${tx.billing_country}`}
                    >
                      {tx.card_country}
                      {tx.card_country !== tx.billing_country && (
                        <span className="text-gray-400"> → {tx.billing_country}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <ThreeDSBadge result={tx.three_d_secure_result} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell tabular-nums">
                    {new Date(tx.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { LoadingSkeleton };
