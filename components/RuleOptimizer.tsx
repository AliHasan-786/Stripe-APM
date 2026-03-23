'use client';

import { useState, useCallback, useEffect } from 'react';
import StreamingText from './StreamingText';

interface SimulationChange {
  transactionId: string;
  from: string;
  to: string;
  reason: string;
}

interface SimulationSummaryData {
  total: number;
  changed: number;
  wouldAllow: number;
  wouldBlock: number;
  wouldReview: number;
  falsePositivesRecovered: number;
  legitBlockedByMistake: number;
  revenueRecovered: number;
}

interface StepStatus {
  step: number;
  label: string;
  status: 'pending' | 'active' | 'done';
}

const TOTAL_STEPS = 5;
const STEP_LABELS = [
  'Fetching recent transactions...',
  'Identifying false-positive candidates...',
  'Generating Radar Rule...',
  'Simulating rule against transactions...',
  'Analyzing tradeoffs...',
];

interface RuleOptimizerProps {
  isDemoMode: boolean;
  stripeKey?: string;
}

export default function RuleOptimizer({ isDemoMode, stripeKey }: RuleOptimizerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [steps, setSteps] = useState<StepStatus[]>(
    STEP_LABELS.map((label, i) => ({ step: i + 1, label, status: 'pending' }))
  );
  const [streamText, setStreamText] = useState('');
  const [generatedRule, setGeneratedRule] = useState<string | null>(null);
  const [ruleExplanation, setRuleExplanation] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<{
    before: Record<string, number>;
    after: Record<string, number>;
    changes: SimulationChange[];
    summary: SimulationSummaryData;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateStep = useCallback((stepNum: number, status: 'active' | 'done') => {
    setSteps((prev) =>
      prev.map((s) =>
        s.step === stepNum
          ? { ...s, status }
          : s.step < stepNum && status === 'active'
          ? { ...s, status: 'done' }
          : s
      )
    );
  }, []);

  const runOptimizer = useCallback(async () => {
    setIsRunning(true);
    setIsDone(false);
    setStreamText('');
    setGeneratedRule(null);
    setRuleExplanation(null);
    setSimulation(null);
    setError(null);
    setSteps(STEP_LABELS.map((label, i) => ({ step: i + 1, label, status: 'pending' })));

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemoMode, stripeKey }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start optimizer');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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

            if (event.type === 'step') {
              const stepNum = event.step as number;
              updateStep(stepNum, 'active');
              if (stepNum > 1) {
                setStreamText('');
              }
            } else if (event.type === 'text') {
              setStreamText((prev) => prev + (event.content as string));
            } else if (event.type === 'rule') {
              setGeneratedRule(event.content as string);
              setRuleExplanation(event.explanation as string);
            } else if (event.type === 'simulation') {
              setSimulation({
                before: event.before as Record<string, number>,
                after: event.after as Record<string, number>,
                changes: event.changes as SimulationChange[],
                summary: event.summary as SimulationSummaryData,
              });
            } else if (event.type === 'error') {
              setError(event.message as string);
            } else if (event.type === 'done') {
              setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' })));
              setIsDone(true);
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setIsRunning(false);
    }
  }, [isDemoMode, stripeKey, updateStep]);

  const copyRule = useCallback(async () => {
    if (!generatedRule) return;
    await navigator.clipboard.writeText(generatedRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedRule]);

  return (
    <div className="space-y-6">
      {/* Run button */}
      <div className="flex items-center gap-4">
        <button
          onClick={runOptimizer}
          disabled={isRunning}
          className={`
            px-6 py-3 rounded-lg font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            ${isRunning
              ? 'bg-purple-400 cursor-not-allowed animate-pulse-slow'
              : 'bg-purple-600 hover:bg-purple-700 active:scale-95'}
          `}
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running Optimizer...
            </span>
          ) : isDone ? (
            'Run Again'
          ) : (
            'Run Optimizer'
          )}
        </button>

        {isDone && (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
            <span>✓</span> Analysis complete
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* Step progress */}
      {(isRunning || isDone) && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Progress</h3>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.step} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {step.status === 'done' ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : step.status === 'active' ? (
                    <span className="inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    step.status === 'done'
                      ? 'text-gray-500 line-through'
                      : step.status === 'active'
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming text output */}
      {streamText && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <StreamingText content={streamText} />
        </div>
      )}

      {/* Generated rule */}
      {generatedRule && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-900 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
              Generated Radar Rule
            </span>
            <button
              onClick={copyRule}
              className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-4 bg-gray-900">
            <code className="text-green-400 text-sm font-mono break-all">{generatedRule}</code>
          </div>
          {ruleExplanation && (
            <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
              <p className="text-sm text-blue-800">{ruleExplanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Simulation results */}
      {simulation && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Simulation Results</h3>
          </div>
          <div className="p-5">
            {/* Before/After counts */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Before Rule</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Passed</span>
                    <span className="font-medium tabular-nums">{simulation.before.pass ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-700">Blocked</span>
                    <span className="font-medium tabular-nums">{simulation.before.block ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-700">Review</span>
                    <span className="font-medium tabular-nums">{simulation.before.review ?? 0}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">After Rule</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Passed</span>
                    <span className="font-medium tabular-nums">{simulation.after.pass ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-700">Blocked</span>
                    <span className="font-medium tabular-nums">{simulation.after.block ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-700">Review</span>
                    <span className="font-medium tabular-nums">{simulation.after.review ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700 tabular-nums">
                  {simulation.summary.falsePositivesRecovered}
                </p>
                <p className="text-xs text-green-600 mt-0.5">False positives recovered</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-700 tabular-nums">
                  ${(simulation.summary.revenueRecovered / 100).toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 mt-0.5">Revenue recovered</p>
              </div>
              <div
                className={`${
                  simulation.summary.legitBlockedByMistake > 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                } border rounded-lg p-3 text-center col-span-2 sm:col-span-1`}
              >
                <p
                  className={`text-2xl font-bold tabular-nums ${
                    simulation.summary.legitBlockedByMistake > 0 ? 'text-red-700' : 'text-gray-500'
                  }`}
                >
                  {simulation.summary.legitBlockedByMistake}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    simulation.summary.legitBlockedByMistake > 0 ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  Legit transactions blocked by mistake
                </p>
              </div>
            </div>

            {/* Changed transactions */}
            {simulation.changes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Changed Transactions ({simulation.changes.length})
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {simulation.changes.map((change) => (
                    <div
                      key={change.transactionId}
                      className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded p-2"
                    >
                      <span className="font-mono text-gray-600 truncate flex-1">
                        {change.transactionId}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-medium ${
                          change.from === 'pass'
                            ? 'bg-green-100 text-green-800'
                            : change.from === 'block'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {change.from}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-medium ${
                          change.to === 'pass'
                            ? 'bg-green-100 text-green-800'
                            : change.to === 'block'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {change.to}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {(isRunning || isDone) && (
        <p className="text-xs text-gray-400 italic">
          Disclaimer: This AI analysis is for educational purposes only. Always review proposed
          Radar rules with your fraud team before deploying to production. Simulation results use
          {isDemoMode ? ' synthetic demo data' : ' your recent transaction history'}.
        </p>
      )}
    </div>
  );
}
