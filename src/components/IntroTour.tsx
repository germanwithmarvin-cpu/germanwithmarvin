"use client";

import { useEffect, useState } from "react";
import Lena, { type LenaMood } from "@/components/training/Lena";
import { createClient } from "@/lib/supabase/client";

// Kurzes Willkommens-Tutorial als Overlay. Lena führt in wenigen Schritten durch
// die Bereiche der App. Wird nur einmal gezeigt – der Merker liegt (wie beim
// übrigen Onboarding) in den Konto-Metadaten, gilt also auf jedem Gerät.

type Step = { emoji: string; title: string; text: string; mood: LenaMood };

const STEPS: Step[] = [
  {
    emoji: "👋", mood: "wave", title: "Hi, I'm Lena!",
    text: "Welcome to German Simplified. I'm learning along with you — let me show you around in 30 seconds.",
  },
  {
    emoji: "🏠", mood: "explain", title: "Overview",
    text: "Your home base: your streak, your progress and what to do next — all in one place.",
  },
  {
    emoji: "🎬", mood: "explain", title: "Lessons",
    text: "Marvin's video lessons, level by level from A1 to B2. Watch, then practise right away.",
  },
  {
    emoji: "🎓", mood: "explain", title: "Training",
    text: "Interactive exercises for every topic — plus an intensive drill that keeps the tricky ones coming until they stick.",
  },
  {
    emoji: "🗓️", mood: "explain", title: "1-on-1 lessons",
    text: "Book a real 50-minute session with Marvin whenever you want a human to explain it.",
  },
  {
    emoji: "🗂️", mood: "explain", title: "Flashcards",
    text: "Smart repetition so new words actually stick — the app shows each card right when you're about to forget it.",
  },
  {
    emoji: "🚀", mood: "cheer", title: "Word Rocket",
    text: "A fast little game to review your vocabulary. Great for a quick warm-up.",
  },
  {
    emoji: "📖", mood: "explain", title: "Stories",
    text: "Short German stories at your level — reading is one of the best ways to grow.",
  },
  {
    emoji: "🧭", mood: "explain", title: "Where you stand",
    text: "A quick grammar check that finds the topics that aren't sitting yet and sends you to the right unit.",
  },
  {
    emoji: "💬", mood: "cheer", title: "That's it!",
    text: "Stuck at any point? Tap the 💬 button at the bottom right and we'll help. Los geht's — you've got this!",
  },
];

export default function IntroTour() {
  const [show, setShow] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    let cancelled = false;
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      if (user.user_metadata?.tour_seen !== true) setShow(true);
    });
    return () => { cancelled = true; };
  }, []);

  async function finish() {
    setShow(false);
    try { await createClient().auth.updateUser({ data: { tour_seen: true } }); } catch { /* Merker ist nice-to-have */ }
  }

  if (!show) return null;
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      style={{ background: "rgba(20,8,10,.72)", backdropFilter: "blur(3px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
    >
      <div className="card w-[min(94vw,460px)] p-6 sm:p-7 text-center relative">
        <button
          onClick={finish}
          className="absolute top-3 right-4 text-xs text-cream-dim hover:text-cream"
        >
          Skip
        </button>

        <div className="flex justify-center -mt-2">
          <Lena mood={step.mood} size={132} />
        </div>

        <div className="text-3xl mt-1">{step.emoji}</div>
        <h2 className="text-xl font-extrabold mt-1" style={{ color: "var(--bordeaux)" }}>{step.title}</h2>
        <p className="text-sm text-cream-dim mt-2 max-w-sm mx-auto leading-relaxed">{step.text}</p>

        {/* Fortschritts-Punkte */}
        <div className="flex justify-center gap-1.5 mt-5">
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 20 : 6,
                background: idx === i ? "var(--gold-bright)" : "color-mix(in srgb, var(--gold) 30%, transparent)",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-5">
          <button
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
            className="text-sm text-cream-dim hover:text-cream disabled:opacity-0"
          >
            ← Back
          </button>
          <span className="text-xs text-cream-dim">{i + 1} / {STEPS.length}</span>
          {last ? (
            <button onClick={finish} className="btn-gold px-5 py-2.5 font-bold text-sm">Los geht’s! →</button>
          ) : (
            <button onClick={() => setI((n) => Math.min(STEPS.length - 1, n + 1))} className="btn-gold px-5 py-2.5 font-bold text-sm">
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
