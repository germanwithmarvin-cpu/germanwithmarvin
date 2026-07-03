import Link from "next/link";

// Globaler Footer mit den Pflicht-Links (Impressum/Datenschutz) – auf jeder Seite sichtbar.
export default function LegalFooter() {
  return (
    <footer className="border-t border-gold/15 py-6 px-6 text-center text-sm text-cream-dim">
      <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <Link href="/impressum" className="hover:text-cream underline underline-offset-4">Impressum</Link>
        <Link href="/datenschutz" className="hover:text-cream underline underline-offset-4">Datenschutz</Link>
      </div>
    </footer>
  );
}
