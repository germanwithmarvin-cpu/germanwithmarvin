import Link from "next/link";
import Logo from "@/components/Logo";
import VideoPlayer from "@/components/VideoPlayer";
import Reviews from "@/components/Reviews";
import { SITE, checkoutUrl, priceLabel } from "@/lib/config";

const benefits = [
  { icon: "🎬", title: "Clear video lessons", text: "Every topic explained simply in short, focused videos — from A1 all the way to B2." },
  { icon: "⚡", title: "Interactive exercises", text: "After each lesson: fill-in-the-gap, sentence building, matching and more — solved right in the app with instant feedback." },
  { icon: "🗂️", title: "Smart flashcard trainer", text: "1,800+ vocabulary cards with spaced repetition, so words actually stick." },
  { icon: "📖", title: "Reading stories", text: "Short German stories at your level to build a real feel for the language." },
  { icon: "🧭", title: "One guided path", text: "No guessing what to learn next — a clear path from beginner to advanced." },
  { icon: "📊", title: "See your progress", text: "Track completed lessons, learned cards and your streak as you go." },
];

// Was der Preis-Block auflistet.
const included = [
  "All video lessons (A1–B2)",
  "Interactive exercises after every lesson",
  "The full flashcard trainer (1,800+ cards)",
  "Reading stories & downloadable material",
  "Statistics & progress tracking",
];

export default function Home() {
  return (
    <div className="flex-1">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
        <nav>
          <Link href="/login" className="btn-outline px-4 py-2 text-sm">Sign in</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-6 pt-6 pb-4 text-center">
        <span className="inline-block text-xs tracking-[0.3em] text-gold-bright uppercase mb-4">German Simplified</span>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
          Learn German with me — <span className="text-gold-bright">the simple way.</span>
        </h1>
        <p className="text-cream-dim text-lg mb-7 max-w-xl mx-auto">
          Video lessons, interactive exercises, a smart flashcard trainer and reading stories — everything you
          need to actually speak German, in one place.
        </p>

        <VideoPlayer videoId={SITE.introVideoId} title="German Simplified — Marvin Graf" />

        {/* Zentraler CTA */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <a href={checkoutUrl()} className="btn-gold px-10 py-4 text-lg sm:text-xl w-full max-w-md">
            Join now — {priceLabel()}/month, full access
          </a>
          <p className="text-sm text-cream-dim">Cancel anytime · instant access</p>
        </div>
      </section>

      {/* Social Proof */}
      <Reviews />

      {/* Was ist drin */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-center mb-8">Everything you get</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="card p-6">
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="text-lg font-semibold text-cream">{b.title}</h3>
              <p className="mt-2 text-sm text-cream-dim">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preis-Block + CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="card p-8 sm:p-10 text-center border-gold/30">
          <h2 className="text-2xl font-bold">German Simplified — All-Access</h2>
          <div className="mt-3">
            <span className="text-5xl font-bold text-gold-bright">{priceLabel()}</span>
            <span className="text-cream-dim"> / month</span>
          </div>
          <ul className="text-sm text-cream-dim space-y-2 my-7 inline-block text-left">
            {included.map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <a href={checkoutUrl()} className="btn-gold px-8 py-4 text-lg w-full block">
            Join now — {priceLabel()}/month
          </a>
          <p className="text-sm text-cream-dim mt-3">Cancel anytime. Instant access after checkout.</p>

          <div className="mt-6 pt-5 border-t border-gold/15 text-sm text-cream-dim space-y-1">
            <p>
              Learning with me on <a href={SITE.preplyUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Preply</a> or{" "}
              <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Skool</a>?{" "}
              <Link href="/redeem" className="text-gold-bright underline underline-offset-4">Redeem your code</Link>
            </p>
            <p>
              Already a member? <Link href="/login" className="text-gold-bright underline underline-offset-4">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
