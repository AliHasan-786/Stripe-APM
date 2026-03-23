interface DemoModeBannerProps {
  className?: string;
}

export default function DemoModeBanner({ className = '' }: DemoModeBannerProps) {
  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2 ${className}`}
    >
      <span className="text-blue-500 mt-0.5 flex-shrink-0">ℹ</span>
      <p className="text-sm text-blue-800">
        <strong>Sample data</strong> — Viewing 10 synthetic transactions designed to showcase
        all features. Risk scores, outcomes, and signals are representative of real Stripe Radar behavior.
      </p>
    </div>
  );
}
