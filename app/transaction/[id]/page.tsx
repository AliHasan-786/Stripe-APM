'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ExplainerPanels from '@/components/ExplainerPanels';
import ConfidenceMeter from '@/components/ConfidenceMeter';
import DemoModeBanner from '@/components/DemoModeBanner';
import type { DemoTransaction } from '@/lib/demo-transactions';

interface AnalysisData {
  confidence_score: number;
  verdict: string;
  risk_signals: Array<{ signal: string; severity: 'high' | 'medium' | 'low'; explanation: string }>;
  developer_explanation: string;
  merchant_explanation: string;
  recommended_action: string;
  radar_rule_suggestion: string | null;
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
    review: 'Under Review',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${styles[outcome] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}
    >
      {labels[outcome] ?? outcome}
    </span>
  );
}

function TransactionDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const isDemo = searchParams.get('demo') === 'true';

  const [transaction, setTransaction] = useState<DemoTransaction | null>(null);
  const [txLoading, setTxLoading] = useState(true);

  const [streamRaw, setStreamRaw] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasStartedRef = useRef(false);

  // Load transaction details
  useEffect(() => {
    const url = isDemo ? '/api/transactions?demo=true' : '/api/transactions';

    fetch(url)
      .then((r) => r.json())
      .then((data: { transactions: DemoTransaction[] }) => {
        const found = data.transactions?.find((t) => t.id === id);
        if (found) setTransaction(found);
      })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [id, isDemo]);

  // Start streaming analysis once transaction loads
  const startAnalysis = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsStreaming(true);
    setStreamRaw('');
    setAnalysisData(null);
    setStreamError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: id,
          isDemoMode: isDemo,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr) as Record<string, unknown>;

            if (event.type === 'text') {
              fullText += event.content as string;
              setStreamRaw(fullText);
            } else if (event.type === 'parsed') {
              setAnalysisData(event.data as AnalysisData);
            } else if (event.type === 'error') {
              setStreamError(event.message as string);
            } else if (event.type === 'done') {
              // Try parsing fullText as JSON if we haven't gotten a parsed event
              if (!analysisData) {
                try {
                  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]) as AnalysisData;
                    setAnalysisData(parsed);
                  }
                } catch {
                  // Couldn't parse
                }
              }
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      // Final attempt to parse JSON from stream
      setStreamRaw((current) => {
        try {
          const jsonMatch = current.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as AnalysisData;
            setAnalysisData(parsed);
          }
        } catch {
          // Not valid JSON
        }
        return current;
      });
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsStreaming(false);
    }
  }, [id, isDemo, analysisData]);

  useEffect(() => {
    if (!txLoading && transaction) {
      startAnalysis();
    }
  }, [txLoading, transaction, startAnalysis]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  }, []);

  if (txLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Back to transactions
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
        >
          {copied ? '✓ Copied link' : '🔗 Share'}
        </button>
      </div>

      {isDemo && <DemoModeBanner />}

      {/* Transaction header card */}
      {transaction ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <OutcomeBadge outcome={transaction.outcome} />
                <span className="text-xs text-gray-400 font-mono">{transaction.id}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                ${(transaction.amount / 100).toFixed(2)}{' '}
                <span className="text-base font-normal text-gray-500 uppercase">
                  {transaction.currency}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {transaction.merchant_category} ·{' '}
                {new Date(transaction.created_at).toLocaleString()}
              </p>
            </div>

            <div className="w-full sm:w-56">
              {analysisData ? (
                <ConfidenceMeter
                  score={analysisData.confidence_score}
                  verdict={analysisData.verdict}
                />
              ) : (
                <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
              )}
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                Risk Score
              </p>
              <p
                className={`font-bold tabular-nums ${
                  transaction.risk_score >= 70
                    ? 'text-red-600'
                    : transaction.risk_score >= 40
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {transaction.risk_score}/100
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                Card Country
              </p>
              <p
                className={`font-semibold ${
                  transaction.card_country !== transaction.billing_country
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}
              >
                {transaction.card_country}
                {transaction.card_country !== transaction.billing_country && (
                  <span className="text-gray-400 font-normal">
                    {' '}
                    → {transaction.billing_country}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                3D Secure
              </p>
              <p
                className={`font-semibold ${
                  transaction.three_d_secure_result === 'authenticated'
                    ? 'text-green-600'
                    : transaction.three_d_secure_result === null
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {transaction.three_d_secure_result ?? 'Not attempted'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                Email Domain
              </p>
              <p className="font-semibold text-gray-900 truncate">{transaction.email_domain}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          Transaction {id} not found.{' '}
          <Link href="/transactions?demo=true" className="underline">
            Back to explorer
          </Link>
        </div>
      )}

      {streamError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Analysis error: {streamError}
        </div>
      )}

      {/* AI Explainer panels */}
      <ExplainerPanels
        data={analysisData}
        rawStreamContent={streamRaw}
        isStreaming={isStreaming}
      />

      {/* Run optimizer CTA */}
      {analysisData && !isStreaming && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">
              Want to reduce false positives like this?
            </h3>
            <p className="text-sm text-purple-700">
              The Rule Optimizer scans your full transaction history and generates a targeted Radar
              rule.
            </p>
          </div>
          <Link
            href={`/optimize${isDemo ? '?demo=true' : ''}`}
            className="flex-shrink-0 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition-all whitespace-nowrap"
          >
            Run Rule Optimizer →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function TransactionDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      }
    >
      <TransactionDetailContent />
    </Suspense>
  );
}
