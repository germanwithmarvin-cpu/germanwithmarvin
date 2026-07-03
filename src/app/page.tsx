import Link from "next/link";
import Logo from "@/components/Logo";
import VideoPlayer from "@/components/VideoPlayer";
import Reviews from "@/components/Reviews";
import { SITE } from "@/lib/config";

const benefits = [
  { icon: "🎬", title: "Clear video lessons", text: "Every topic explained simply in short, focused videos you can watch anytime." },
  { icon: "🧭", title: "One guided path", text: "No guessing what to learn next. Follow a step-by-step path from start to fluency." },
  { icon: "⚡", title: "Practice that sticks", text: "Interactive quizzes and downloadable PDFs after every lesson, with instant feedback." },
  { icon: "🤝", title: "A real community", text: "Learn alongside other students in my Skool community — with me guiding the way." },
];

export default function Home() {
  return (
    <div className="flex-1">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-outline px-4 py-2 text-sm">Sign in</Link>
          <Link href="/register" className="btn-gold px-4 py-2 text-sm">Start free</Link>
        </nav>
      </header>

      {/* 1. Intro-Video zuerst */}
      <section className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <span className="inline-block text-xs tracking-[0.3em] text-gold-bright uppercase mb-4">
          German Simplified
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-8">
          Learn German with me — <span className="text-gold-bright">the simple way.</span>
        </h1>
        <VideoPlayer videoId={SITE.introVideoId} title="Intro – Marvin Graf" />
        <p className="mt-4 text-sm text-cream-dim">▶ Watch my 2-minute intro to see how it works.</p>
      </section>

      {/* 1b. Bewertungen (echt, von Preply) direkt unter dem Video */}
      <Reviews />

      {/* 2. Verkaufs-Sektion: Vorteile */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why learn with me</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="card p-6">
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="text-lg font-semibold text-cream">{b.title}</h3>
              <p className="mt-2 text-sm text-cream-dim">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Zugang über Preply / Skool */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="card p-10 text-center">
          <h2 className="text-2xl font-bold">Join my Skool community</h2>
          <p className="text-cream-dim mt-2">
            A1 is free for everyone. Full access (all levels, videos + flashcards) comes with your
            membership in my Skool community — you get an access code to unlock everything here.
          </p>
          <ul className="text-sm text-cream-dim space-y-2 my-6 inline-block text-left">
            <li>✓ All video lessons & the full flashcard path (A1–B2)</li>
            <li>✓ Spaced-repetition review, statistics & placement test</li>
            <li>✓ Writing feedback & a supportive learning community</li>
          </ul>
          <div className="flex flex-col gap-3 justify-center items-center">
            <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className="btn-gold px-8 py-3.5 text-lg w-full max-w-sm">⭐ Join my Skool community</a>
            <a href={SITE.preplyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cream-dim underline underline-offset-4">Prefer 1-on-1? Learn with me on Preply →</a>
          </div>
          <p className="text-sm text-cream-dim mt-5">
            Already have a code?{" "}
            <Link href="/register" className="text-gold-bright underline underline-offset-4">Create your account</Link>{" "}
            and redeem it. Or{" "}
            <Link href="/register" className="text-gold-bright underline underline-offset-4">start free with A1</Link>.
          </p>
        </div>
      </section>

      <footer className="border-t border-gold/15 py-8 text-center text-sm text-cream-dim">
        <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/impressum" className="hover:text-cream underline underline-offset-4">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-cream underline underline-offset-4">Datenschutz</Link>
        </div>
      </footer>
    </div>
  );
}
