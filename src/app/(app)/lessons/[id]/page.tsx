"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Lesson, Exercise } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { completeLesson } from "@/lib/progress";
import VideoPlayer from "@/components/VideoPlayer";
import Exercises from "@/components/Exercises";
import { getUnitForLesson, type Unit as TrainingUnit } from "@/lib/training";

// Alte Multiple-Choice-Quizze weiter unterstützen: in Aufgaben umwandeln.
function quizToExercises(quiz: Lesson["quiz"]): Exercise[] {
  return quiz.map((q) => ({
    id: q.id,
    type: "mc" as const,
    prompt: q.prompt,
    options: q.options,
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
  }));
}

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [nextLesson, setNextLesson] = useState<Lesson | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const [watched, setWatched] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  // Passende Übungs-Einheit im Trainer. undefined = noch nicht nachgesehen.
  // Der Unterschied ist wichtig: solange das offen ist, darf die Seite noch
  // nicht entscheiden, ob sie die alten Aufgaben zeigt.
  const [trainingUnit, setTrainingUnit] = useState<TrainingUnit | null | undefined>(undefined);

  useEffect(() => {
    getLessons().then((all) => {
      const i = all.findIndex((l) => l.id === params.id);
      setLesson(i >= 0 ? all[i] : undefined);
      setNextLesson(i >= 0 ? all[i + 1] : undefined);
      setLoading(false);
    });
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    getUnitForLesson(params.id).then(setTrainingUnit).catch(() => setTrainingUnit(null));
  }, [params.id]);

  // Aufgabenliste: neue Aufgaben bevorzugt, sonst altes MC-Quiz.
  const items = useMemo<Exercise[]>(() => {
    if (!lesson) return [];
    return lesson.exercises.length > 0 ? lesson.exercises : quizToExercises(lesson.quiz);
  }, [lesson]);

  if (loading) return <p className="text-sm text-cream-dim">Loading lesson…</p>;

  if (!lesson) {
    return (
      <div className="space-y-4">
        <p>Lesson not found.</p>
        <Link href="/lessons" className="btn-outline px-4 py-2 inline-block">Back</Link>
      </div>
    );
  }

  // Gibt es zum Thema eine Trainingseinheit, ersetzt sie die alten Aufgaben in
  // der Lektion. Die Einheit ist gepflegt, erklaert bei Fehlern und merkt sich
  // den Fortschritt - das kann das eingebaute Quiz alles nicht.
  const trainerChecked = trainingUnit !== undefined;
  const exercisesOn = trainerChecked && !trainingUnit && lesson.quizEnabled && items.length > 0;

  function markWatched() {
    setWatched(true);
    if (!exercisesOn) {
      void completeLesson(lesson!.id, lesson!.xp);
      setFinished(true);
    }
  }

  function onExercisesDone(correct: number, total: number) {
    setScore({ correct, total });
    void completeLesson(lesson!.id, lesson!.xp);
    setFinished(true);
  }

  function restart() {
    setWatched(false);
    setFinished(false);
    setScore(null);
  }

  const steps = exercisesOn ? ["1 · Watch", "2 · Practice", "3 · Done"] : ["1 · Watch", "2 · Done"];
  const phase = finished ? steps.length : watched ? 2 : 1;

  return (
    <div className="space-y-6">
      <Link href="/lessons" className="text-sm text-cream-dim hover:text-cream">← Learning path</Link>
      <div>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-cream-dim text-sm mt-1">{lesson.level} · {lesson.durationMin} min · +{lesson.xp} XP</p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {steps.map((label, i) => (
          <span key={label} className={`px-3 py-1 rounded-full ${phase === i + 1 ? "bg-gold/25 text-cream" : "bg-bordeaux-soft text-cream-dim"}`}>
            {label}
          </span>
        ))}
      </div>

      {/* Video */}
      {!finished && <VideoPlayer videoId={lesson.videoId} title={lesson.title} />}

      {/* Freitext unter dem Video (Skool-Stil, formatiert) */}
      {!finished && lesson.body.trim() && (
        <div className="card p-5 richtext text-cream" dangerouslySetInnerHTML={{ __html: lesson.body }} />
      )}

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

      {/* Erst anzeigen, wenn feststeht, ob es eine Trainingseinheit gibt -
          sonst steht kurz die falsche Beschriftung auf dem Knopf. */}
      {!watched && trainerChecked && (
        <button onClick={markWatched} className="btn-gold px-6 py-3 w-full">
          {exercisesOn ? "I've watched it — start the exercises ✅" : "I've watched it — mark as complete ✅"}
        </button>
      )}

      {/* Aufgabenteil */}
      {watched && !finished && exercisesOn && (
        <Exercises items={items} onDone={onExercisesDone} />
      )}

      {/* Üben passiert im Trainer, nicht mehr in der Lektion. */}
      {trainingUnit && (
        <Link
          href={`/training/${trainingUnit.slug}`}
          className="card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 transition hover:border-gold/50"
          style={{ borderLeft: "5px solid var(--gold)" }}
        >
          <div className="text-4xl shrink-0">🎓</div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] mb-1" style={{ color: "var(--bordeaux)" }}>
              Now practise it
            </div>
            <div className="font-bold text-lg leading-tight">{trainingUnit.title}</div>
            <p className="text-sm text-cream-dim mt-1">
              The rule again in short, then {trainingUnit.subtitle ? trainingUnit.subtitle.toLowerCase() : "exercises"} — with an
              explanation for every mistake, and your progress is saved.
            </p>
          </div>
          <span className="text-gold-bright shrink-0 text-xl">→</span>
        </Link>
      )}

      {/* Abschluss */}
      {finished && (
        <div className="card p-8 text-center space-y-5">
          <div className="text-5xl">🏆</div>
          <h2 className="text-xl font-bold">Lesson complete!</h2>
          <p className="text-cream-dim">
            {score
              ? `You got ${score.correct} of ${score.total} right and earned +${lesson.xp} XP.`
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
