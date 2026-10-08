import Link from "next/link";

// Gemeinsame Navigation für die öffentlichen Marketing-Seiten (Startseite,
// /german-course, /online-german-lessons, /ha). Verlinkt die beiden Funnels
// gegenseitig, damit keine Seite mehr eine Sackgasse ist.
//
// Pricing und Blog kommen bewusst erst in die Navigation, wenn es eine
// Preisseite bzw. mindestens 3 Blogartikel gibt (sonst tote/leere Links).
// Blog ist seit Okt 2026 live (10 SEO-Artikel).
export default function PublicNav({
  ctaLabel = "Start free",
  ctaHref = "/register",
}: {
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <nav className="flex items-center gap-1 sm:gap-2 text-sm">
      <Link href="/german-course" className="hidden sm:inline px-3 py-2 rounded-lg text-[#8A3030] hover:bg-[#8A3030]/5 transition">Course</Link>
      <Link href="/online-german-lessons" className="hidden sm:inline px-3 py-2 rounded-lg text-[#8A3030] hover:bg-[#8A3030]/5 transition">1-on-1 lessons</Link>
      <Link href="/pricing" className="hidden sm:inline px-3 py-2 rounded-lg text-[#8A3030] hover:bg-[#8A3030]/5 transition">Pricing</Link>
      <Link href="/blog" className="hidden sm:inline px-3 py-2 rounded-lg text-[#8A3030] hover:bg-[#8A3030]/5 transition">Blog</Link>
      <Link href="/login" className="px-4 py-2 rounded-lg border border-[#8A3030] text-[#8A3030] hover:bg-[#8A3030]/5 transition">Sign in</Link>
      <Link href={ctaHref} className="px-4 py-2 rounded-lg bg-[#8A3030] text-white hover:brightness-110 transition">{ctaLabel}</Link>
    </nav>
  );
}
