"use client";

import { usePathname } from "next/navigation";
import AppNav from "@/components/AppNav";
import LegalFooter from "@/components/LegalFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Der Lernpfad nutzt die volle Breite (Panorama bis zum Rand); alle anderen
  // Seiten bleiben in der zentrierten, lesefreundlichen Spalte.
  const fullBleed = pathname?.startsWith("/decks");
  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <AppNav />
      <div className="flex-1 flex flex-col min-w-0">
        <main className={fullBleed ? "flex-1 w-full" : "flex-1 p-6 max-w-4xl mx-auto w-full"}>{children}</main>
        <LegalFooter />
      </div>
    </div>
  );
}
