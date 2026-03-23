'use client';

import type { ReactNode } from 'react';

interface StreamingTextProps {
  content: string;
  className?: string;
}

/**
 * Renders streaming text content with basic markdown-like formatting.
 * Supports: **bold**, `code`, # headers, - lists, newlines
 */
export default function StreamingText({ content, className = '' }: StreamingTextProps) {
  if (!content) {
    return (
      <div className={`text-gray-400 text-sm italic ${className}`}>
        Waiting for AI analysis...
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div className={`text-sm leading-relaxed space-y-1 ${className}`}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Header
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="font-semibold text-gray-900 text-base mt-3 mb-1">
              {line.replace('## ', '')}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={i} className="font-bold text-gray-900 text-lg mt-4 mb-1">
              {line.replace('# ', '')}
            </h2>
          );
        }

        // List item
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
              <span className="text-gray-700">{formatInline(line.replace(/^[-*] /, ''))}</span>
            </div>
          );
        }

        // Numbered list
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-400 font-medium w-4 flex-shrink-0">{num}.</span>
              <span className="text-gray-700">{formatInline(line.replace(/^\d+\. /, ''))}</span>
            </div>
          );
        }

        // Bold-only line (like "**Label**: content")
        return (
          <p key={i} className="text-gray-700">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string): ReactNode {
  // Split on **bold**, `code`, and plain text
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
