"use client";

import { useEffect, useState } from "react";
import { getStudents, getStudentLessonIds, getStudentCardsByLevel, type StudentOverview, type CardsByLevel } from "@/lib/teacher";
import { getLessons } from "@/lib/lessons";
import type { Lesson } from "@/lib/data";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString();
}

export default function StudentsAdmin() {
  const [students, setStudents] = useState<StudentOverview[] | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getStudents().then(setStudents);
    getLessons().then(setLessons);
  }, []);

  if (students === null) return <p className="text-sm text-cream-dim">Loading students…</p>;
  if (students.length === 0) {
    return (
      <p className="text-sm text-cream-dim">
        No students yet — or the teacher functions aren’t installed. Run <code>supabase/teacher-analytics.sql</code> once.
      </p>
    );
  }

  const totalLessons = lessons.length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-cream-dim">
        {students.length} student{students.length === 1 ? "" : "s"}. Tap a student to see completed lessons and flashcard progress.
      </p>

      {students.map((s) => {
        const open = openId === s.studentId;
        return (
          <div key={s.studentId} className="card p-0 overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : s.studentId)}
              className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-gold/5"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{s.fullName || s.email || "Student"}</div>
                <div className="text-xs text-cream-dim truncate">{s.email}</div>
              </div>
              <div className="flex items-center gap-4 text-sm shrink-0">
                <div className="text-center">
                  <div className="text-gold-bright font-semibold">🎬 {s.lessonsCompleted}{totalLessons ? `/${totalLessons}` : ""}</div>
                  <div className="text-[11px] text-cream-dim">lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-gold-bright font-semibold">🗂️ {s.cardsLearned}</div>
                  <div className="text-[11px] text-cream-dim">cards learned</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-cream">{timeAgo(s.lastActive)}</div>
                  <div className="text-[11px] text-cream-dim">last active</div>
                </div>
                <span className="text-cream-dim">{open ? "▲" : "▼"}</span>
              </div>
            </button>

            {open && <StudentDetail student={s} lessons={lessons} />}
          </div>
        );
      })}
    </div>
  );
}

function StudentDetail({ student, lessons }: { student: StudentOverview; lessons: Lesson[] }) {
  const [lessonIds, setLessonIds] = useState<string[] | null>(null);
  const [cards, setCards] = useState<CardsByLevel[] | null>(null);

  useEffect(() => {
    getStudentLessonIds(student.studentId).then(setLessonIds);
    getStudentCardsByLevel(student.studentId).then(setCards);
  }, [student.studentId]);

  const doneSet = new Set(lessonIds ?? []);

  return (
    <div className="border-t border-gold/15 p-4 grid sm:grid-cols-2 gap-6 bg-bordeaux-deep/30">
      {/* Videos */}
      <div>
        <div className="text-sm font-semibold mb-2">🎬 Video lessons</div>
        {lessonIds === null ? (
          <p className="text-xs text-cream-dim">Loading…</p>
        ) : lessons.length === 0 ? (
          <p className="text-xs text-cream-dim">No lessons yet.</p>
        ) : (
          <ul className="space-y-1">
            {lessons.map((l) => {
              const done = doneSet.has(l.id);
              return (
                <li key={l.id} className="flex items-center gap-2 text-sm">
                  <span>{done ? "✅" : "⬜"}</span>
                  <span className={done ? "text-cream" : "text-cream-dim"}>
                    <span className="text-xs text-gold-bright">{l.level}</span> · {l.title}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Flashcards */}
      <div>
        <div className="text-sm font-semibold mb-2">🗂️ Flashcards by level</div>
        {cards === null ? (
          <p className="text-xs text-cream-dim">Loading…</p>
        ) : cards.length === 0 ? (
          <p className="text-xs text-cream-dim">No flashcards studied yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {cards.map((c) => (
              <li key={c.level} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gold-bright">{c.level}</span>
                  <span className="text-cream-dim">{c.learned} learned · {c.seen} seen</span>
                </div>
                <div className="h-1.5 rounded-full bg-bordeaux-deep/70 mt-1">
                  <div className="h-1.5 rounded-full bg-gold-bright" style={{ width: `${c.seen ? (c.learned / c.seen) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
