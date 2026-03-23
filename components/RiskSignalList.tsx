'use client';

import { useEffect, useState } from 'react';

interface RiskSignal {
  signal: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
}

interface RiskSignalListProps {
  signals: RiskSignal[];
}

const severityConfig = {
  high: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'High',
  },
  medium: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Medium',
  },
  low: {
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
    label: 'Low',
  },
};

export default function RiskSignalList({ signals }: RiskSignalListProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (signals.length === 0) return;
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= signals.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [signals]);

  if (signals.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        No risk signals detected yet...
      </div>
    );
  }

  const sorted = [...signals].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-2">
      {sorted.slice(0, visibleCount).map((signal, i) => {
        const config = severityConfig[signal.severity];
        return (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm animate-fade-in"
          >
            <div className="mt-1.5 flex-shrink-0">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.dot}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm text-gray-900">{signal.signal}</span>
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded border ${config.badge}`}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{signal.explanation}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
