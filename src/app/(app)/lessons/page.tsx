"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress } from "@/lib/progress";
import { getAccess, type AccessTier } from "@/lib/access";
import Paywall from "@/components/Paywall";
import { youTubeId } from "@/components/VideoPlayer";

// Level in fester Reihenfolge – "Intro" (Essentials) ganz oben.
const LEVELS: Lesson["level"][] = ["Intro", "A1", "A2", "B1", "B2", "C1"];
const LEVEL_LABEL: Record<Lesson["level"], string> = {
  Intro: "Start here & study tips",
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
};

export default function LessonsPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tier, setTier] = useState<AccessTier>("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccess().then((a) => setTier(a.tier));
    Promise.all([loadProgress(), getLessons()]).then(([p, ls]) => {
      setCompleted(p.completedLessons);
      setLessons(ls);
      setLoading(false);
    });
  }, []);

  const ordered = LEVELS.flatMap((lv) => lessons.filter((l) => l.level === lv));
  const doneSet = new Set(completed);
  const doneCount = ordered.filter((l) => doneSet.has(l.id)).length;
  const pct = ordered.length ? Math.round((doneCount / ordered.length) * 100) : 0;
  const nextId = ordered.find((l) => !doneSet.has(l.id))?.id;

  if (!loading && tier !== "full") return <Paywall title="Unlock all video lessons" />;

  return (
    <div className="space-y-8">
      {/* Kopf + Fortschritt */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Video lessons 🎬</h1>
          <p className="text-cream-dim text-sm mt-1">Browse lessons by level — watch in any order.</p>
        </div>
        {ordered.length > 0 && (
          <div className="flex items-center gap-3 card px-4 py-2.5">
            <div>
              <div className="text-2xl font-bold text-gold-bright leading-none">{pct}%</div>
              <div className="text-[11px] text-cream-dim mt-0.5">{doneCount}/{ordered.length} done</div>
            </div>
            <div className="w-20 h-2 rounded-full bg-bordeaux-deep/60 self-center">
              <div className="h-2 rounded-full bg-gold-bright transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-cream-dim">Loading lessons…</p>}
      {!loading && ordered.length === 0 && <p className="text-sm text-cream-dim">No lessons yet — check back soon!</p>}

      {LEVELS.map((lv) => {
        const items = lessons.filter((l) => l.level === lv);
        if (items.length === 0) return null;
        return (
          <section key={lv}>
            {/* Level-Überschrift */}
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center rounded-lg px-2.5 py-1 text-sm font-extrabold" style={{ background: "linear-gradient(160deg, var(--gold-bright), var(--gold))", color: "#3b2116" }}>
                {lv === "Intro" ? "⭐" : lv}
              </span>
              <span className="font-semibold text-cream">{LEVEL_LABEL[lv]}</span>
              <span className="text-xs text-cream-dim">{items.length} {items.length === 1 ? "lesson" : "lessons"}</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--gold) 40%, transparent), transparent)" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((l) => (
                <LessonTile key={l.id} lesson={l} done={doneSet.has(l.id)} isNext={l.id === nextId} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LessonTile({ lesson, done, isNext }: { lesson: Lesson; done: boolean; isNext: boolean }) {
  const hasQuiz = lesson.quizEnabled && (lesson.exercises.length > 0 || lesson.quiz.length > 0);
  const id = youTubeId(lesson.videoId);
  // Quellen-Kette: hqdefault ist fast immer da; fehlt es, liefert YouTube ein
  // graues 120px-Platzhalterbild (kein Fehler!) – dann auf mqdefault ausweichen.
  const srcs = id
    ? [`https://img.youtube.com/vi/${id}/hqdefault.jpg`, `https://img.youtube.com/vi/${id}/mqdefault.jpg`]
    : [];
  const [srcIdx, setSrcIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const thumb = !failed ? srcs[srcIdx] : undefined;
  const nextSrc = () => (srcIdx < srcs.length - 1 ? setSrcIdx(srcIdx + 1) : setFailed(true));

  return (
    <Link href={`/lessons/${lesson.id}`} className="card overflow-hidden group transition hover:border-gold/50 flex flex-col">
      {/* Vorschaubild */}
      <div className="relative aspect-video bg-bordeaux-deep/50 overflow-hidden">
        {thumb && (
          <img
            src={thumb}
            alt=""
            /* eager: die Bilder sollen sofort da sein, nicht erst beim Scrollen */
            loading="eager"
            decoding="async"
            onLoad={(e) => (e.currentTarget.naturalWidth <= 120 ? nextSrc() : setLoaded(true))}
            onError={nextSrc}
            className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {/* sanfter Platzhalter, solange geladen wird – wirkt nicht wie "kaputt" */}
        {!loaded && !failed && (
          <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(100deg, var(--bordeaux-deep), var(--bordeaux-soft), var(--bordeaux-deep))" }} />
        )}
        {failed && <div className="absolute inset-0 grid place-items-center text-4xl">🎬</div>}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(59,41,34,0.55))" }} />
        {/* Play-Overlay */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="w-12 h-12 rounded-full grid place-items-center text-xl transition group-hover:scale-110" style={{ background: "rgba(255,255,255,0.9)", color: "var(--bordeaux)" }}>▶</span>
        </div>
        {/* Dauer */}
        <span className="absolute bottom-2 right-2 text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: "rgba(59,41,34,0.8)", color: "#fff" }}>{lesson.durationMin} min</span>
        {/* Status */}
        {done && <span className="absolute top-2 left-2 w-6 h-6 grid place-items-center rounded-full text-xs" style={{ background: "var(--green-accent)", color: "#fff" }}>✓</span>}
        {isNext && !done && <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full btn-gold">▶ Up next</span>}
      </div>
      {/* Text */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-cream-dim">
          <span>{lesson.topic}</span>
          {hasQuiz && <span className="text-gold-bright">⚡ exercises</span>}
        </div>
        <div className="font-semibold mt-1 leading-tight group-hover:text-cream">{lesson.title}</div>
        {lesson.description && <div className="text-xs text-cream-dim mt-1 line-clamp-2">{lesson.description}</div>}
      </div>
    </Link>
  );
}
