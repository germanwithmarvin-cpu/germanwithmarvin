/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import FreeExamRunner from "@/components/FreeExamRunner";
import { B1_COPY } from "@/lib/b1course";

const BASE = "https://www.germanwithmarvin.com";

export const metadata: Metadata = {
  title: `${B1_COPY.test.metaTitle} — German with Marvin`,
  description: B1_COPY.test.metaDescription,
  alternates: { canonical: `${BASE}/b1-test` },
  openGraph: { title: B1_COPY.test.metaTitle, description: B1_COPY.test.metaDescription, url: `${BASE}/b1-test`, type: "website" },
};

// Single-goal Ad-Landingpage: nur Logo, KEINE Navigation (ein Ziel, ein Button).
// Die vorhandene Prüfung wird wiederverwendet; das Ergebnis erscheint erst nach
// der E-Mail-Eingabe (emailGate). Nur Impressum/Datenschutz im Footer (rechtlich nötig).
export default function B1TestPage() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen flex flex-col">
      <header className="flex items-center justify-center px-6 py-4">
        <img src="/logo-light.png" alt="German with Marvin" className="h-14 w-auto object-contain" />
      </header>
      <main className="flex-1 w-full">
        <FreeExamRunner level="B1" emailGate={{ source: "b1-test" }} />
      </main>
      <footer className="px-6 py-6 text-center text-xs text-[#3B2922]/50">
        <Link href="/impressum" className="underline mx-2">Impressum</Link>
        <Link href="/datenschutz" className="underline mx-2">Privacy</Link>
      </footer>
    </div>
  );
}
