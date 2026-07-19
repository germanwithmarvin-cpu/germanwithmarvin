"use client";

import { useEffect, useState } from "react";
import type { Lesson, QuizQuestion } from "@/lib/data";
import { getLessons, saveLesson, deleteLesson, saveLessonOrder, slugify } from "@/lib/lessons";
import PdfUpload from "@/components/PdfUpload";
import RichEditor from "@/components/RichEditor";

const LEVELS: Lesson["level"][] = ["Intro", "A1", "A2", "B1", "B2", "C1"];
const LEVEL_LABEL: Record<Lesson["level"], string> = {
  Intro: "Essentials · general lessons",
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
};
const OPTION_IDS = ["a", "b", "c"];

function emptyLesson(): Lesson {
  return {
    id: "",
    title: "",
    level: "A1",
    topic: "",
    description: "",
    videoId: "",
    durationMin: 0,
    xp: 100,
    body: "",
    materials: [],
    quizEnabled: false, // Aufgabenteil ist standardmäßig AUS – erst aktivieren.
    quiz: [],
    exercises: [],
  };
}

function emptyQuestion(n: number): QuizQuestion {
  return {
    id: `q${n}`,
    prompt: "",
    options: OPTION_IDS.map((id) => ({ id, text: "" })),
    correctOptionId: "a",
    explanation: "",
  };
}

const inputClass = "w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm";

export default function LessonsAdmin() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setLessons(await getLessons());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function startNew() {
    setEditing(emptyLesson());
    setIsNew(true);
    setError(null);
  }
  function startEdit(l: Lesson) {
    setEditing(JSON.parse(JSON.stringify(l)));
    setIsNew(false);
    setError(null);
  }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) { setError("Please enter a title."); return; }
    setSaving(true);
    const lesson = { ...editing, id: editing.id || slugify(editing.title) };
    // Neue Lektion ans Ende des Pfads, sonst Reihenfolge beibehalten.
    const sortOrder = isNew ? lessons.length + 1 : undefined;
    const { error } = await saveLesson(lesson, sortOrder);
    setSaving(false);
    if (error) { setError(error); return; }
    setEditing(null);
    refresh();
  }

  async function remove(l: Lesson) {
    if (!confirm(`Delete lesson “${l.title}”? This cannot be undone.`)) return;
    const { error } = await deleteLesson(l.id);
    if (error) { setError(error); return; }
    refresh();
  }

  // Lektion INNERHALB ihres Levels verschieben (−1 = hoch, +1 = runter).
  async function move(level: Lesson["level"], indexInLevel: number, dir: -1 | 1) {
    const groups = LEVELS.map((lv) => lessons.filter((l) => l.level === lv));
    const gi = LEVELS.indexOf(level);
    const group = groups[gi];
    const j = indexInLevel + dir;
    if (j < 0 || j >= group.length) return;
    [group[j], group[indexInLevel]] = [group[indexInLevel], group[j]];
    const full = groups.flat();
    setLessons(full); // sofort sichtbar
    const { error } = await saveLessonOrder(full.map((l) => l.id));
    if (error) { setError(error); refresh(); }
  }

  // ---- Editor-Hilfen ----
  function setField<K extends keyof Lesson>(key: K, value: Lesson[K]) {
    setEditing((e) => (e ? { ...e, [key]: value } : e));
  }
  function addQuestion() {
    setEditing((e) => (e ? { ...e, quiz: [...e.quiz, emptyQuestion(e.quiz.length + 1)] } : e));
  }
  function updateQuestion(qi: number, patch: Partial<QuizQuestion>) {
    setEditing((e) => (e ? { ...e, quiz: e.quiz.map((q, i) => (i === qi ? { ...q, ...patch } : q)) } : e));
  }
  function removeQuestion(qi: number) {
    setEditing((e) => (e ? { ...e, quiz: e.quiz.filter((_, i) => i !== qi) } : e));
  }
  function addMaterial() {
    setEditing((e) => (e ? { ...e, materials: [...e.materials, { title: "", url: "" }] } : e));
  }
  function updateMaterial(mi: number, patch: Partial<{ title: string; url: string }>) {
    setEditing((e) => (e ? { ...e, materials: e.materials.map((m, i) => (i === mi ? { ...m, ...patch } : m)) } : e));
  }
  function removeMaterial(mi: number) {
    setEditing((e) => (e ? { ...e, materials: e.materials.filter((_, i) => i !== mi) } : e));
  }

  // ---------------- LISTE ----------------
  if (!editing) {
    return (
      <div className="space-y-4">
        <button onClick={startNew} className="btn-gold px-5 py-2.5">+ Add new lesson / video</button>
        {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}
        {loading && <p className="text-sm text-cream-dim">Loading…</p>}
        {!loading && lessons.length === 0 && <p className="text-sm text-cream-dim">No lessons yet — add your first one.</p>}
        {!loading && lessons.length > 0 && (
          <p className="text-xs text-cream-dim">Grouped by level. Use ▲ / ▼ to reorder lessons within a level.</p>
        )}

        {LEVELS.map((lv) => {
          const items = lessons.filter((l) => l.level === lv);
          if (items.length === 0) return null;
          return (
            <section key={lv} className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <h2 className="text-xl font-bold text-gold-bright">{lv === "Intro" ? "⭐ Essentials" : lv}</h2>
                <span className="text-sm text-cream-dim">{LEVEL_LABEL[lv]}</span>
                <span className="text-xs text-cream-dim">· {items.length}</span>
              </div>

              {items.map((l, i) => (
                <div key={l.id} className="card p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-cream-dim">
                      <span>{l.topic || "Lesson"} · {l.durationMin} min · +{l.xp} XP</span>
                      {l.quizEnabled && (l.exercises.length > 0 || l.quiz.length > 0) && (
                        <span className="text-gold-bright">· ⚡ exercises ({l.exercises.length || l.quiz.length})</span>
                      )}
                    </div>
                    <div className="text-lg font-semibold mt-1 truncate">{l.title}</div>
                    {l.description && <div className="text-sm text-cream-dim truncate">{l.description}</div>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(lv, i, -1)}
                        disabled={i === 0}
                        className="px-2 leading-none text-cream-dim hover:text-cream disabled:opacity-30"
                        title="Move up"
                        aria-label="Move up"
                      >▲</button>
                      <button
                        onClick={() => move(lv, i, 1)}
                        disabled={i === items.length - 1}
                        className="px-2 leading-none text-cream-dim hover:text-cream disabled:opacity-30"
                        title="Move down"
                        aria-label="Move down"
                      >▼</button>
                    </div>
                    <button onClick={() => startEdit(l)} className="btn-outline px-3 py-1.5 text-sm">Edit</button>
                    <button onClick={() => remove(l)} className="btn-outline px-3 py-1.5 text-sm text-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    );
  }

  // ---------------- EDITOR ----------------
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{isNew ? "New lesson" : "Edit lesson"}</h2>
        <button onClick={() => setEditing(null)} className="text-sm text-cream-dim hover:text-cream">← Back to list</button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}

      {/* Grunddaten */}
      <div className="card p-5 space-y-3">
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Title</label>
          <input className={inputClass} value={editing.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. The Perfekt — talking about the past" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Level</label>
            <select className={inputClass} value={editing.level} onChange={(e) => setField("level", e.target.value as Lesson["level"])}>
              {LEVELS.map((lv) => <option key={lv} value={lv}>{lv === "Intro" ? "Essentials (top category)" : lv}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Topic</label>
            <input className={inputClass} value={editing.topic} onChange={(e) => setField("topic", e.target.value)} placeholder="Grammar" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Minutes</label>
            <input type="number" className={inputClass} value={editing.durationMin} onChange={(e) => setField("durationMin", Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-cream-dim">XP reward</label>
            <input type="number" className={inputClass} value={editing.xp} onChange={(e) => setField("xp", Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Description</label>
          <textarea rows={2} className={inputClass} value={editing.description} onChange={(e) => setField("description", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">YouTube video ID</label>
          <input className={inputClass} value={editing.videoId} onChange={(e) => setField("videoId", e.target.value)} placeholder="From youtube.com/watch?v=ABC123 → ABC123" />
          <p className="text-xs text-cream-dim mt-1">Upload your video to YouTube as “Unlisted”, then paste only the ID here.</p>
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Text below the video</label>
          <RichEditor
            value={editing.body}
            onChange={(html) => setField("body", html)}
            placeholder="Write explanations, tasks or links. Use the H / B / I buttons to format."
          />
          <p className="text-xs text-cream-dim mt-1">Select text, then click <b>H</b> (heading), <b>B</b> (bold) or <b>I</b> (italic). Leave empty to hide.</p>
        </div>
      </div>

      {/* PDF-Material (Download nach der Stunde) */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-medium text-sm">📄 Learning material (PDF / PNG / JPG)</span>
          <div className="flex items-center gap-2">
            <PdfUpload
              folder="lesson-materials"
              onUploaded={(url, name) =>
                setEditing((e) => (e ? { ...e, materials: [...e.materials, { title: name.replace(/\.pdf$/i, ""), url }] } : e))
              }
            />
            <button onClick={addMaterial} className="btn-outline px-3 py-1.5 text-sm">+ Link</button>
          </div>
        </div>
        <p className="text-xs text-cream-dim">Upload a PDF or image (PNG/JPG) for students to download, or add an external link.</p>
        {editing.materials.length === 0 && <p className="text-xs text-cream-dim">No PDFs yet (optional).</p>}
        {editing.materials.map((m, mi) => (
          <div key={mi} className="flex gap-2 items-center">
            <input className={inputClass} value={m.title} onChange={(e) => updateMaterial(mi, { title: e.target.value })} placeholder="Title shown to students" />
            <input className={inputClass} value={m.url} onChange={(e) => updateMaterial(mi, { url: e.target.value })} placeholder="https://… or uploaded file" />
            <button onClick={() => removeMaterial(mi)} className="text-red-700 text-sm px-2 shrink-0">✕</button>
          </div>
        ))}
      </div>

      {/* Quiz */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-sm">⚡ Quiz</span>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editing.quizEnabled}
              onChange={(e) => setField("quizEnabled", e.target.checked)}
              className="w-4 h-4 accent-[var(--gold)]"
            />
            <span className={editing.quizEnabled ? "text-cream" : "text-cream-dim"}>
              {editing.quizEnabled ? "Quiz is ON for this lesson" : "Quiz is OFF for this lesson"}
            </span>
          </label>
        </div>

        {!editing.quizEnabled && (
          <p className="text-xs text-cream-dim">
            The quiz is switched off — students go straight from the video to “complete”. Your questions
            below are kept and will reappear when you switch it back on.
          </p>
        )}

        <div className={`space-y-4 ${editing.quizEnabled ? "" : "opacity-50 pointer-events-none"}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-cream-dim">Questions</span>
            <button onClick={addQuestion} className="btn-outline px-3 py-1.5 text-sm">+ Add question</button>
          </div>
          {editing.quiz.length === 0 && <p className="text-xs text-cream-dim">No questions yet.</p>}
        {editing.quiz.map((q, qi) => (
          <div key={qi} className="rounded-lg border border-gold/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cream-dim">Question {qi + 1}</span>
              <button onClick={() => removeQuestion(qi)} className="text-red-700 text-xs">Remove</button>
            </div>
            <input className={inputClass} value={q.prompt} onChange={(e) => updateQuestion(qi, { prompt: e.target.value })} placeholder="Question text" />
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctOptionId === opt.id}
                    onChange={() => updateQuestion(qi, { correctOptionId: opt.id })}
                    title="Mark as correct answer"
                  />
                  <input
                    className={inputClass}
                    value={opt.text}
                    onChange={(e) => updateQuestion(qi, { options: q.options.map((o, i) => (i === oi ? { ...o, text: e.target.value } : o)) })}
                    placeholder={`Option ${opt.id.toUpperCase()}`}
                  />
                </div>
              ))}
              <p className="text-xs text-cream-dim">● Select the radio button next to the correct answer.</p>
            </div>
            <input className={inputClass} value={q.explanation} onChange={(e) => updateQuestion(qi, { explanation: e.target.value })} placeholder="Explanation (shown after answering)" />
          </div>
        ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="btn-gold px-6 py-2.5 disabled:opacity-50">
          {saving ? "Saving…" : "Save lesson"}
        </button>
        <button onClick={() => setEditing(null)} className="btn-outline px-6 py-2.5">Cancel</button>
      </div>
    </div>
  );
}
