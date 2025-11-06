'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-md w-full">
        <div className="bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>

          <h2 className="text-2xl font-bold font-serif text-foreground mb-2">
            Something went wrong!
          </h2>

          <p className="text-foreground/60 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-amber-600 text-[#18181B] font-semibold rounded-full hover:from-amber-600 hover:to-[#D4AF37] transition-all"
            >
              Try again
            </button>

            <a
              href="/dashboard"
              className="block w-full px-6 py-3 bg-[#18181B]/60 backdrop-blur-lg rounded-full border border-[#27272A] text-foreground hover:border-accent transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
