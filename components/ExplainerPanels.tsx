'use client';

import { useState } from 'react';
import RiskSignalList from './RiskSignalList';
import StreamingText from './StreamingText';

interface RiskSignal {
  signal: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
}

interface ExplainerData {
  confidence_score: number;
  verdict: string;
  risk_signals: RiskSignal[];
  developer_explanation: string;
  merchant_explanation: string;
  recommended_action: string;
  radar_rule_suggestion: string | null;
}

interface ExplainerPanelsProps {
  data: ExplainerData | null;
  rawStreamContent: string;
  isStreaming: boolean;
}

const tabs = [
  { id: 'risk', label: 'Risk Signals' },
  { id: 'developer', label: 'Developer View' },
  { id: 'merchant', label: 'Merchant View' },
];

export default function ExplainerPanels({ data, rawStreamContent, isStreaming }: ExplainerPanelsProps) {
  const [activeTab, setActiveTab] = useState('risk');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
              activeTab === tab.id
                ? 'text-purple-700 border-b-2 border-purple-600 bg-white -mb-px'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {isStreaming && (
          <div className="ml-auto flex items-center px-4 gap-2 text-xs text-purple-600">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Analyzing...
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === 'risk' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Signals Detected</h3>
            {data?.risk_signals && data.risk_signals.length > 0 ? (
              <>
                <RiskSignalList signals={data.risk_signals} />
                {data.recommended_action && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-0.5">Recommended Action</p>
                    <p className="text-sm text-blue-800">{data.recommended_action}</p>
                  </div>
                )}
              </>
            ) : isStreaming ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No risk signals available.</p>
            )}
          </div>
        )}

        {activeTab === 'developer' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Technical Analysis</h3>
            {data?.developer_explanation ? (
              <>
                <StreamingText content={data.developer_explanation} />
                {data.radar_rule_suggestion && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Suggested Radar Rule</p>
                    <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                      <code className="text-green-400 text-xs font-mono">
                        {data.radar_rule_suggestion}
                      </code>
                    </div>
                  </div>
                )}
              </>
            ) : isStreaming ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`h-4 bg-gray-100 rounded animate-pulse ${i === 3 ? 'w-2/3' : 'w-full'}`} />
                ))}
              </div>
            ) : (
              <StreamingText content={rawStreamContent} />
            )}
          </div>
        )}

        {activeTab === 'merchant' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Plain English Summary</h3>
            {data?.merchant_explanation ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <StreamingText content={data.merchant_explanation} />
              </div>
            ) : isStreaming ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Analysis not yet complete.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
