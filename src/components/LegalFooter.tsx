import Link from "next/link";
import { SITE } from "@/lib/config";

// Globaler Footer mit den Pflicht-Links (Impressum/Datenschutz) – auf jeder Seite sichtbar.
export default function LegalFooter() {
  return (
    <footer className="border-t border-gold/15 py-6 px-6 text-center text-sm text-cream-dim">
      <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <a href={`mailto:${SITE.contactEmail}`} className="hover:text-cream underline underline-offset-4">Contact · Kontakt</a>
        <Link href="/impressum" className="hover:text-cream underline underline-offset-4">Legal Notice · Impressum</Link>
        <Link href="/datenschutz" className="hover:text-cream underline underline-offset-4">Privacy · Datenschutz</Link>
        <Link href="/agb" className="hover:text-cream underline underline-offset-4">Terms · AGB</Link>
      </div>
    </footer>
  );
}
