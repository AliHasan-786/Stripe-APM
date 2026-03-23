'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [stripeKey, setStripeKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('stripeKey');
      if (existing) {
        setStripeKey(existing);
        setHasKey(true);
      }
    }
  }, []);

  const handleSave = () => {
    if (!stripeKey.trim()) return;
    localStorage.setItem('stripeKey', stripeKey.trim());
    setHasKey(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('stripeKey');
    setStripeKey('');
    setHasKey(false);
  };

  const maskedKey = stripeKey.length > 8
    ? `${stripeKey.slice(0, 8)}${'•'.repeat(Math.max(0, stripeKey.length - 12))}${stripeKey.slice(-4)}`
    : stripeKey;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect your Stripe test key to analyze real transactions. Keys are stored only in your
          browser&apos;s localStorage — never sent to our servers.
        </p>
      </div>

      {/* Current status */}
      <div
        className={`rounded-xl border p-4 mb-6 ${
          hasKey
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={hasKey ? 'text-green-600' : 'text-yellow-600'}>
            {hasKey ? '✓' : '⚠'}
          </span>
          <p className={`text-sm font-medium ${hasKey ? 'text-green-800' : 'text-yellow-800'}`}>
            {hasKey
              ? `Connected: ${maskedKey}`
              : 'No Stripe key configured — app is in demo mode'}
          </p>
        </div>
      </div>

      {/* Key input */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Stripe Test API Key</h2>
        <p className="text-sm text-gray-500 mb-4">
          Use a test key (starts with <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">sk_test_</code>).
          Never use your live key.
        </p>

        <div className="flex gap-2">
          <input
            type="password"
            value={stripeKey}
            onChange={(e) => setStripeKey(e.target.value)}
            placeholder="sk_test_..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={!stripeKey.trim()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>

        {hasKey && (
          <button
            onClick={handleClear}
            className="mt-3 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            Remove key
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">How to get a test key</h2>
        <ol className="space-y-3">
          {[
            <>
              Go to{' '}
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                dashboard.stripe.com/test/apikeys
              </a>
            </>,
            <>Log in or create a free Stripe account (no credit card needed)</>,
            <>Make sure you&apos;re in <strong>Test mode</strong> (toggle in the top-left)</>,
            <>Copy the <strong>Secret key</strong> starting with <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">sk_test_</code></>,
            <>Paste it above and click Save</>,
          ].map((step, i) => (
            <li key={i} className="flex gap-3 items-start text-sm text-gray-600">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Privacy notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Privacy notice</p>
        <p>
          Your Stripe API key is stored only in your browser&apos;s <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">localStorage</code>.
          It is never transmitted to our servers except as part of API requests made directly from
          your browser to Stripe. This app cannot see or store your payment data.
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/transactions"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-lg transition-colors"
        >
          {hasKey ? 'View my transactions →' : 'Try demo mode →'}
        </Link>
        {hasKey && (
          <Link
            href="/transactions?demo=true"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
          >
            Use demo data instead
          </Link>
        )}
      </div>
    </div>
  );
}
