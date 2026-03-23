'use client';

interface ConfidenceMeterProps {
  score: number;
  verdict: string;
}

export default function ConfidenceMeter({ score, verdict }: ConfidenceMeterProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  const getColor = () => {
    if (clampedScore >= 70) return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' };
    if (clampedScore >= 40) return { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
    return { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50 border-green-200' };
  };

  const colors = getColor();

  return (
    <div className={`rounded-xl border p-4 ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Fraud Confidence</span>
        <span className={`text-lg font-bold tabular-nums ${colors.text}`}>
          {clampedScore}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>Legitimate</span>
        <span>Ambiguous</span>
        <span>Fraud</span>
      </div>

      {/* Verdict badge */}
      <div className="flex justify-center">
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text} border`}>
          {verdict}
        </span>
      </div>
    </div>
  );
}
