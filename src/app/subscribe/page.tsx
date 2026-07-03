"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/config";

// Zugang läuft über Preply/Skool (dort bezahlt der Schüler) → Freischaltcode → /redeem.
export default function GetAccessPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <div className="card p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold">Get full access</h1>
          <p className="text-cream-dim mt-2">
            A1 is free for everyone. Full access to all levels, videos and the vocabulary trainer comes
            with your membership on Preply or Skool.
          </p>

          <ul className="text-sm text-cream-dim space-y-2 mt-6 text-left max-w-xs mx-auto">
            <li>✓ All video lessons (A1–B2)</li>
            <li>✓ Full flashcard path with spaced repetition</li>
            <li>✓ Statistics, placement test & progress</li>
            <li>✓ Writing feedback & direct messages</li>
          </ul>

          <div className="flex flex-col gap-3 mt-6">
            <a href={SITE.preplyUrl} target="_blank" rel="noopener noreferrer" className="btn-gold py-3">Learn with me on Preply</a>
            <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className="btn-outline py-2.5">Join my Skool community</a>
          </div>

          <p className="text-sm text-cream-dim mt-5">
            Already have a code? <Link href="/redeem" className="text-gold-bright underline underline-offset-4">Redeem it here</Link>.
          </p>
          <p className="text-xs text-cream-dim mt-2">
            New here? <Link href="/register" className="text-gold-bright underline underline-offset-4">Create a free account</Link> (A1 free).
          </p>
        </div>
      </main>
    </div>
  );
}
