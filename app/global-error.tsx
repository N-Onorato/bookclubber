'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
