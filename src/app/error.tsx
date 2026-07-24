"use client";

import { useEffect } from "react";
import Link from "next/link";

// Fehlergrenze für unerwartete Laufzeitfehler (vorher: Next.js-Standardseite).
// Muss eine Client-Komponente sein.
export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Später ggf. an ein Fehler-Tracking (z. B. Sentry) melden.
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <div className="card p-8 sm:p-10 w-full max-w-md text-center space-y-5">
        <div className="text-5xl">😕</div>
        <div>
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-cream-dim mt-1">
            An unexpected error occurred. Please try again — if it keeps happening, let us know.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={() => window.location.reload()} className="btn-gold px-6 py-2.5 font-bold">
            Try again
          </button>
          <Link href="/dashboard" className="btn-outline px-6 py-2.5">Back to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
