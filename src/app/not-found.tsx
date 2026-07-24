import Link from "next/link";
import Logo from "@/components/Logo";

// Eigene 404-Seite (vorher: Next.js-Standardseite). Rendert innerhalb des
// Root-Layouts, also mit App-Hintergrund.
export default function NotFound() {
  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <div className="card p-8 sm:p-10 w-full max-w-md text-center space-y-5">
        <div className="flex justify-center"><Logo /></div>
        <div className="text-6xl font-extrabold" style={{ color: "var(--bordeaux)" }}>404</div>
        <div>
          <h1 className="text-xl font-bold">This page doesn’t exist</h1>
          <p className="text-sm text-cream-dim mt-1">
            The link may be out of date or mistyped.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard" className="btn-gold px-6 py-2.5 font-bold">Back to dashboard</Link>
          <Link href="/" className="btn-outline px-6 py-2.5">Home</Link>
        </div>
      </div>
    </main>
  );
}
