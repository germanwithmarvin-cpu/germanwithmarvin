"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { completeLesson } from "@/lib/progress";
import VideoPlayer from "@/components/VideoPlayer";

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [nextLesson, setNextLesson] = useState<Lesson | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessons().then((all) => {
      const i = all.findIndex((l) => l.id === params.id);
      setLesson(i >= 0 ? all[i] : undefined);
      setNextLesson(i >= 0 ? all[i + 1] : undefined);
      setLoading(false);
    });
  }, [params.id]);

  const [watched, setWatched] = useState(false);
  const [step, setStep] = useState(0); // welche Quizfrage
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (loading) {
    return <p className="text-sm text-cream-dim">Loading lesson…</p>;
  }

  if (!lesson) {
    return (
      <div className="space-y-4">
        <p>Lesson not found.</p>
        <Link href="/lessons" className="btn-outline px-4 py-2 inline-block">Back</Link>
      </div>
    );
  }

  // Quiz nur, wenn der Lehrer es aktiviert hat UND Fragen hinterlegt sind.
  const quizOn = lesson.quizEnabled && lesson.quiz.length > 0;
  const q = lesson.quiz[step];
  const isCorrect = checked && selected === q?.correctOptionId;

  function check() {
    if (selected == null) return;
    setChecked(true);
    if (selected === q.correctOptionId) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (step + 1 < lesson!.quiz.length) {
      setStep(step + 1);
      setSelected(null);
      setChecked(false);
    } else {
      void completeLesson(lesson!.id, lesson!.xp);
      setFinished(true);
    }
  }

  // Lektion von vorn beginnen (wiederholen)
  function restart() {
    setWatched(false);
    setStep(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    setFinished(false);
  }

  // Video als angesehen markieren. Ohne Quiz ist die Lektion damit direkt fertig.
  function markWatched() {
    setWatched(true);
    if (!quizOn) {
      void completeLesson(lesson!.id, lesson!.xp);
      setFinished(true);
    }
  }

  // Schrittanzeige: mit Quiz 3 Schritte, ohne Quiz nur Watch → Done.
  const steps = quizOn ? ["1 · Watch", "2 · Practice", "3 · Done"] : ["1 · Watch", "2 · Done"];
  const phase = finished ? steps.length : watched ? 2 : 1;

  return (
    <div className="space-y-6">
      <Link href="/lessons" className="text-sm text-cream-dim hover:text-cream">← Learning path</Link>
      <div>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-cream-dim text-sm mt-1">{lesson.level} · {lesson.durationMin} min · +{lesson.xp} XP</p>
      </div>

      {/* Geführte Schritt-Anzeige: 1. Watch → 2. Practice → 3. Done */}
      <div className="flex items-center gap-2 text-sm">
        {steps.map((label, i) => (
          <span
            key={label}
            className={`px-3 py-1 rounded-full ${phase === i + 1 ? "bg-gold/25 text-cream" : "bg-bordeaux-soft text-cream-dim"}`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Video */}
      {!finished && <VideoPlayer videoId={lesson.videoId} title={lesson.title} />}

      {/* PDF-Lernmaterial */}
      {!finished && lesson.materials.length > 0 && (
        <div className="card p-4">
          <div className="text-sm font-medium mb-2">📄 Learning material</div>
          <div className="flex flex-wrap gap-2">
            {lesson.materials.map((m) => (
              <a key={m.url} href={m.url} target="_blank" rel="noreferrer" className="btn-outline px-4 py-2 text-sm">
                {m.title} ↓
              </a>
            ))}
          </div>
        </div>
      )}

      {!watched && (
        <button onClick={markWatched} className="btn-gold px-6 py-3 w-full">
          {quizOn ? "I've watched it — start the quiz ✅" : "I've watched it — mark as complete ✅"}
        </button>
      )}

      {/* Quiz / Test */}
      {watched && !finished && q && (
        <div className="card p-6 space-y-4">
          <div className="flex justify-between text-sm text-cream-dim">
            <span>Quiz</span>
            <span>Question {step + 1} / {lesson.quiz.length}</span>
          </div>
          <h2 className="text-lg font-semibold">{q.prompt}</h2>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const chosen = selected === opt.id;
              const showCorrect = checked && opt.id === q.correctOptionId;
              const showWrong = checked && chosen && opt.id !== q.correctOptionId;
              return (
                <button
                  key={opt.id}
                  disabled={checked}
                  onClick={() => setSelected(opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                    showCorrect
                      ? "border-green-400 bg-green-400/15"
                      : showWrong
                      ? "border-red-accent bg-red-accent/15"
                      : chosen
                      ? "border-gold bg-gold/15"
                      : "border-gold/25 hover:border-gold/50"
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {checked && (
            <div className={`rounded-lg p-4 text-sm ${isCorrect ? "bg-green-400/15" : "bg-red-accent/15"}`}>
              <strong>{isCorrect ? "Correct! 🎉" : "Not quite."}</strong>
              <p className="mt-1 text-cream-dim">{q.explanation}</p>
            </div>
          )}

          {!checked ? (
            <button onClick={check} disabled={selected == null} className="btn-gold px-6 py-2.5 w-full disabled:opacity-40">
              Check answer
            </button>
          ) : (
            <button onClick={next} className="btn-gold px-6 py-2.5 w-full">
              {step + 1 < lesson.quiz.length ? "Next question" : "Finish lesson"}
            </button>
          )}
        </div>
      )}

      {/* Abschluss – möglichst wenige Buttons */}
      {finished && (
        <div className="card p-8 text-center space-y-5">
          <div className="text-5xl">🏆</div>
          <h2 className="text-xl font-bold">Lesson complete!</h2>
          <p className="text-cream-dim">
            {quizOn
              ? `You got ${correctCount} of ${lesson.quiz.length} right and earned +${lesson.xp} XP.`
              : `Nicely done — you earned +${lesson.xp} XP.`}
          </p>
          {nextLesson ? (
            <button onClick={() => router.push(`/lessons/${nextLesson.id}`)} className="btn-gold px-8 py-3.5 text-lg w-full">
              Continue to next lesson →
            </button>
          ) : (
            <button onClick={() => router.push("/dashboard")} className="btn-gold px-8 py-3.5 text-lg w-full">
              Finish — back to overview
            </button>
          )}
          <button onClick={restart} className="text-sm text-cream-dim hover:text-cream underline underline-offset-4">
            Repeat this lesson
          </button>
        </div>
      )}
    </div>
  );
}
