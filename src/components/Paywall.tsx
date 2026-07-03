import Link from "next/link";
import { SITE } from "@/lib/config";

// Wird angezeigt, wenn ein gesperrter Inhalt (A2–B2 oder Premium) ohne Zugang
// geöffnet wird. Zugang läuft über einen Freischaltcode (Preply / Skool).
export default function Paywall({ title = "Unlock everything" }: { title?: string }) {
  return (
    <div className="card p-8 max-w-lg mx-auto text-center mt-10">
      <div className="text-5xl">🔓</div>
      <h2 className="text-2xl font-bold mt-3">{title}</h2>
      <p className="text-cream-dim mt-2">
        A1 stays free forever. Everything above A1 is included with your membership on Preply or Skool.
      </p>
      <ul className="text-sm text-cream-dim space-y-1.5 mt-5 text-left max-w-xs mx-auto">
        <li>✓ All levels A1–B2 (videos + flashcards)</li>
        <li>✓ Smart review path, statistics & placement test</li>
        <li>✓ Writing feedback & direct messages</li>
      </ul>

      <Link href="/redeem" className="btn-gold px-6 py-3 mt-6 inline-block">
        I have a code — redeem it
      </Link>

      <p className="text-sm text-cream-dim mt-4">Don&apos;t have a code yet? Join through:</p>
      <div className="flex items-center justify-center gap-3 mt-2">
        <a href={SITE.preplyUrl} target="_blank" rel="noopener noreferrer" className="btn-outline px-4 py-2 text-sm">Preply</a>
        <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className="btn-outline px-4 py-2 text-sm">Skool</a>
      </div>
    </div>
  );
}
