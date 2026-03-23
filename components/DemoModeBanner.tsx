import Link from 'next/link';

interface DemoModeBannerProps {
  className?: string;
}

export default function DemoModeBanner({ className = '' }: DemoModeBannerProps) {
  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${className}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-yellow-600 mt-0.5 flex-shrink-0">⚠</span>
        <p className="text-sm text-yellow-800">
          <strong>Demo mode</strong> — Using synthetic transaction data.{' '}
          <span className="hidden sm:inline">
            Connect your Stripe test key to analyze real transactions.
          </span>
        </p>
      </div>
      <Link
        href="/settings"
        className="text-sm font-medium text-yellow-800 underline underline-offset-2 hover:text-yellow-900 whitespace-nowrap"
      >
        Connect Stripe key →
      </Link>
    </div>
  );
}
