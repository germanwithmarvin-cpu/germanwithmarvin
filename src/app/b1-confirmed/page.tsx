/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import B1ConfirmTracker from "@/components/B1ConfirmTracker";

export const metadata: Metadata = {
  title: "Email confirmed — German with Marvin",
  robots: { index: false },
};

// Landeseite nach dem Double-Opt-in-Bestätigungsklick. Feuert das Meta-"Lead"-
// Event (über B1ConfirmTracker bei ?confirmed=1) und führt weiter zum Kurs.
export default function B1ConfirmedPage() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen flex flex-col">
      <header className="flex items-center justify-center px-6 py-4">
        <img src="/logo-light.webp" alt="German with Marvin" className="h-14 w-auto object-contain" />
      </header>
      <main className="flex-1 w-full max-w-md mx-auto px-6 py-12 text-center space-y-5">
        <B1ConfirmTracker />
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold text-[#8A3030]">You&apos;re confirmed!</h1>
        <p className="text-[#3B2922]/80">Thanks — you&apos;ll get your free B1 tips by email. Here&apos;s your next step:</p>
        <Link href="/b1-course" className="block w-full px-6 py-3.5 rounded-xl bg-[#8A3030] text-white font-bold hover:brightness-110">See the B1 course →</Link>
        <Link href="/b1-course#trial" className="inline-block text-[#8A3030] underline underline-offset-2 font-semibold text-sm">Or join a free live trial lesson</Link>
      </main>
      <footer className="px-6 py-6 text-center text-xs text-[#3B2922]/50">
        <Link href="/impressum" className="underline mx-2">Impressum</Link>
        <Link href="/datenschutz" className="underline mx-2">Privacy</Link>
      </footer>
    </div>
  );
}
