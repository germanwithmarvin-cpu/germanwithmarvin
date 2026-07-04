import Link from "next/link";

// Globaler Footer mit den Pflicht-Links (Impressum/Datenschutz) – auf jeder Seite sichtbar.
export default function LegalFooter() {
  return (
    <footer className="border-t border-gold/15 py-6 px-6 text-center text-sm text-cream-dim">
      <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/impressum" className="hover:text-cream underline underline-offset-4">Legal Notice · Impressum</Link>
        <Link href="/datenschutz" className="hover:text-cream underline underline-offset-4">Privacy Policy · Datenschutz</Link>
      </div>
    </footer>
  );
}
