'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';

function HeaderInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isDemo = searchParams.get('demo') === 'true';

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-purple-700 transition-colors">
            <span className="text-xl">⚡</span>
            <span className="hidden sm:inline">Stripe Radar Copilot</span>
            <span className="sm:hidden">Radar Copilot</span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm">
            <Link
              href={isDemo ? '/transactions?demo=true' : '/transactions'}
              className={`transition-colors ${pathname === '/transactions' ? 'text-purple-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Explorer
            </Link>
            <Link
              href={isDemo ? '/optimize?demo=true' : '/optimize'}
              className={`transition-colors ${pathname === '/optimize' ? 'text-purple-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Optimizer
            </Link>
            <Link
              href="/case-study"
              className={`transition-colors ${pathname === '/case-study' ? 'text-purple-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Case Study
            </Link>
            <Link
              href="/settings"
              className={`transition-colors ${pathname === '/settings' ? 'text-purple-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              About
            </Link>

            {isDemo && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full border border-yellow-200">
                Demo
              </span>
            )}

            <a
              href="https://github.com/AliHasan-786"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense
      fallback={
        <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
                <span className="text-xl">⚡</span>
                <span>Stripe Radar Copilot</span>
              </Link>
            </div>
          </div>
        </header>
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
