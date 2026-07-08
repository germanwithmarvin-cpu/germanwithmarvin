"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { getLessons } from "@/lib/lessons";
import { createClient } from "@/lib/supabase/client";
import { checkoutUrl, priceLabel } from "@/lib/config";

// Multiple-Choice-Einstufung (zunehmender Schwierigkeitsgrad A1 → B1).
const assessment = [
  { prompt: "Which article goes with “Sonne” (sun)?", options: ["der Sonne", "die Sonne", "das Sonne"], correct: 1 },
  { prompt: "Complete: “Wie ___ du?” (What's your name?)", options: ["heißt", "heißen", "heiße"], correct: 0 },
  { prompt: "What is the plural of “das Buch” (the book)?", options: ["die Buchen", "die Bücher", "die Buchs"], correct: 1 },
  { prompt: "Past tense: “I travelled to Berlin.”", options: ["Ich habe nach Berlin gefahren.", "Ich bin nach Berlin gefahren.", "Ich nach Berlin gefahren."], correct: 1 },
  { prompt: "Which is polite small talk?", options: ["Was willst du?", "Schönes Wetter heute, oder?", "Keine Zeit."], correct: 1 },
  { prompt: "Complete: “Ich freue mich ___ das Wochenende.”", options: ["auf", "an", "für"], correct: 0 },
];

// Einfache, sofortige automatische Rückmeldung zur Schreibaufgabe.
function instantFeedback(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const germanHints = /[äöüß]|(\b(ich|und|der|die|das|ist|bin|haben|mein|gern|heute|weil|aber)\b)/i.test(text);
  const points: string[] = [];

  if (words >= 25 && words <= 40) points.push("✅ Great length — right around the 30-word target.");
  else if (words < 25) points.push(`✍️ A bit short (${words} words). Aim for about 30 to show more of your German.`);
  else points.push(`✍️ Nicely detailed (${words} words) — even a little over target.`);

  if (sentences >= 2) points.push("✅ You used several sentences — good structure.");
  else points.push("💡 Try splitting your text into 2–3 sentences for clearer structure.");

  if (germanHints) points.push("✅ I can see real German words and structures — well done!");
  else points.push("💡 Try to use more German words (e.g. ich, und, weil) and umlauts where needed.");

  return points;
}

type AiFeedback = {
  level: string;
  encouragement: string;
  corrected_text: string;
  issues: { original: string; correction: string; explanation: string }[];
};

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 Begrüßung, 1 MC-Test, 2 Schreibaufgabe, 3 Empfehlung
  const [answers, setAnswers] = useState<(number | null)[]>(Array(assessment.length).fill(null));
  const [writing, setWriting] = useState("");
  const [feedback, setFeedback] = useState<string[] | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [checking, setChecking] = useState(false);
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    getLessons().then((ls) => setFirstLessonId(ls[0]?.id ?? null));
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
      setEmail(user?.email ?? undefined);
    });
  }, []);

  // Holt echte KI-Korrektur; fällt auf die einfache Prüfung zurück, wenn kein Schlüssel da ist.
  async function checkWriting() {
    setChecking(true);
    setFeedback(null);
    setAiFeedback(null);
    try {
      const res = await fetch("/api/correct-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Placement: write ~30 words about yourself or your day", text: writing }),
      });
      const data = await res.json();
      if (data.configured && data.feedback) {
        setAiFeedback(data.feedback as AiFeedback);
      } else {
        setFeedback(instantFeedback(writing));
      }
    } catch {
      setFeedback(instantFeedback(writing));
    } finally {
      setChecking(false);
    }
  }

  const score = answers.reduce<number>((s, a, i) => s + (a === assessment[i].correct ? 1 : 0), 0);
  const allAnswered = answers.every((a) => a !== null);
  const writingWords = writing.trim() ? writing.trim().split(/\s+/).length : 0;

  const recommendedLevel =
    score <= 2 ? "A1 — from the very beginning" : score <= 4 ? "A2 — building on the basics" : "B1 — you already know a lot!";

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
      </header>

      <main className="flex-1 grid place-items-center px-6 py-8">
        <div className="w-full max-w-2xl">

          {/* Schritt 1: Begrüßung */}
          {step === 0 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl">🎉</div>
              <h1 className="text-3xl font-bold">Welcome aboard!</h1>
              <p className="text-cream-dim max-w-md mx-auto">
                Thank you for joining. Let&apos;s find the perfect starting point for you — it only takes two
                short steps.
              </p>
              <button onClick={() => setStep(1)} className="btn-gold px-8 py-3.5 text-lg">Let&apos;s go</button>
            </div>
          )}

          {/* Schritt 2: Multiple-Choice-Test */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Placement check — part 1</h1>
                <p className="text-cream-dim">A few quick questions so I can recommend where to start.</p>
              </div>
              {assessment.map((q, qi) => (
                <div key={qi} className="card p-5">
                  <div className="font-medium mb-3">{qi + 1}. {q.prompt}</div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border transition ${
                          answers[qi] === oi ? "border-gold bg-gold/15" : "border-gold/25 hover:border-gold/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setStep(2)} disabled={!allAnswered} className="btn-gold px-8 py-3.5 text-lg w-full disabled:opacity-40">
                Continue
              </button>
            </div>
          )}

          {/* Schritt 3: Freie Schreibaufgabe mit Sofort-Korrektur */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Placement check — part 2</h1>
                <p className="text-cream-dim">Write about 30 words in German about yourself or your day. Don&apos;t worry about mistakes!</p>
              </div>
              <div className="card p-5">
                <textarea
                  value={writing}
                  onChange={(e) => { setWriting(e.target.value); setFeedback(null); setAiFeedback(null); }}
                  rows={6}
                  placeholder="Hallo! Ich heiße… Ich wohne in… Heute…"
                  className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold resize-y"
                />
                <div className="text-sm text-cream-dim mt-2">{writingWords} words</div>
              </div>

              {/* Einfache Rückmeldung (Rückfall ohne KI) */}
              {feedback && (
                <div className="card p-5 space-y-2">
                  <div className="font-semibold text-gold-bright">Instant feedback</div>
                  {feedback.map((f, i) => <p key={i} className="text-sm text-cream">{f}</p>)}
                </div>
              )}

              {/* Echte KI-Korrektur */}
              {aiFeedback && (
                <div className="card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gold-bright">Marvin&apos;s feedback</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold-bright">Level: {aiFeedback.level}</span>
                  </div>
                  <p className="text-sm text-cream">{aiFeedback.encouragement}</p>

                  {aiFeedback.issues.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Corrections:</div>
                      {aiFeedback.issues.map((it, i) => (
                        <div key={i} className="text-sm rounded-lg bg-bordeaux-deep/50 p-3">
                          <span className="line-through text-red-300">{it.original}</span>{" "}
                          → <span className="text-green-300">{it.correction}</span>
                          <p className="text-cream-dim mt-1">{it.explanation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-300">No mistakes found — excellent! 🎉</p>
                  )}

                  <div>
                    <div className="text-sm font-medium mb-1">Corrected version:</div>
                    <p className="text-sm text-cream rounded-lg bg-green-400/10 border border-green-400/20 p-3 whitespace-pre-wrap">{aiFeedback.corrected_text}</p>
                  </div>
                </div>
              )}

              {!feedback && !aiFeedback ? (
                <button onClick={checkWriting} disabled={writingWords < 5 || checking} className="btn-gold px-8 py-3.5 text-lg w-full disabled:opacity-40">
                  {checking ? "Checking…" : "Check my writing"}
                </button>
              ) : (
                <button onClick={() => setStep(3)} className="btn-gold px-8 py-3.5 text-lg w-full">
                  See my recommendation
                </button>
              )}
            </div>
          )}

          {/* Schritt 4: Empfehlung + Start */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl">🧭</div>
              <h1 className="text-2xl font-bold">My recommendation for you</h1>
              <div className="card p-6">
                <p className="text-cream-dim">Based on your answers, I recommend starting at:</p>
                <p className="text-xl font-semibold text-gold-bright mt-2">{recommendedLevel}</p>
                <p className="text-sm text-cream-dim mt-3">
                  Everyone follows the path from the beginning — you&apos;ll move quickly through anything you already know.
                </p>
              </div>
              {/* Abo-Vorschlag direkt nach der Registrierung */}
              <div className="card p-6 border-gold/30 text-left">
                <div className="text-lg font-semibold text-center">🔓 Unlock everything</div>
                <p className="text-sm text-cream-dim mt-2 text-center">
                  You start with <span className="text-cream">A1 free</span>. Get <span className="text-cream">German Simplified — All-Access</span> for
                  all levels, videos, flashcards & stories.
                </p>
                <ul className="text-sm text-cream-dim space-y-1.5 mt-4 max-w-xs mx-auto">
                  <li>✓ All video lessons (A1–B2)</li>
                  <li>✓ The full flashcard trainer & reading stories</li>
                  <li>✓ Writing feedback — cancel anytime</li>
                </ul>
                <a
                  href={checkoutUrl(userId, email)}
                  className="btn-gold px-6 py-3 mt-5 block text-center"
                >
                  Get full access — {priceLabel()}/month
                </a>
              </div>

              <button
                onClick={() => router.push(firstLessonId ? `/lessons/${firstLessonId}` : "/lessons")}
                className="text-sm text-cream-dim hover:text-cream underline underline-offset-4"
              >
                Maybe later — start with free A1
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
