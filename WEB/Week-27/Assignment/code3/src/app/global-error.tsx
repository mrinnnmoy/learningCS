"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production: send to Sentry
    // Sentry.captureException(error);
    console.error("[GlobalError]", error.message, error.digest);
  }, [error]);

  return (
    <html>
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-400 mb-6 text-sm">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-600 mb-4 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
