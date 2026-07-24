"use client";

import { usePathname } from "next/navigation";
import AppNav from "@/components/AppNav";
import LegalFooter from "@/components/LegalFooter";
import SupportWidget from "@/components/SupportWidget";
import IntroTour from "@/components/IntroTour";
import TrialBanner from "@/components/TrialBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Die Lernpfade (Flashcards & Lessons-Liste) nutzen die volle Breite
  // (Panorama bis zum Rand); alle anderen Seiten bleiben in der zentrierten,
  // lesefreundlichen Spalte – inkl. der einzelnen Lektion /lessons/[id].
  const fullBleed = pathname === "/decks" || pathname === "/stories";
  return (
    <div className="flex-1 flex flex-col">
      <TrialBanner />
      <div className="flex-1 flex flex-col md:flex-row">
        <AppNav />
        <div className="flex-1 flex flex-col min-w-0">
          <main className={fullBleed ? "flex-1 w-full" : "flex-1 p-6 max-w-4xl mx-auto w-full"}>{children}</main>
          <LegalFooter />
        </div>
      </div>
      <SupportWidget />
      <IntroTour />
    </div>
  );
}
