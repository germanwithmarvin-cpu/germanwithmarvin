"use client";

import { useEffect, useState } from "react";
import type { Lesson, QuizQuestion } from "@/lib/data";
import { getLessons, saveLesson, deleteLesson, saveLessonOrder, slugify } from "@/lib/lessons";
import PdfUpload from "@/components/PdfUpload";

const LEVELS: Lesson["level"][] = ["Intro", "A1", "A2", "B1", "B2", "C1"];
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
    quizEnabled: false, // Quiz ist standardmäßig AUS – erst aktivieren, dann Fragen anlegen.
    quiz: [],
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

  // Lektion in der Reihenfolge verschieben (−1 = hoch, +1 = runter).
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= lessons.length) return;
    const next = [...lessons];
    [next[i], next[j]] = [next[j], next[i]];
    setLessons(next); // sofort sichtbar
    const { error } = await saveLessonOrder(next.map((l) => l.id));
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
        {error && <p className="text-sm text-red-300 bg-red-accent/15 rounded-lg p-3">{error}</p>}
        {loading && <p className="text-sm text-cream-dim">Loading…</p>}
        {!loading && lessons.length === 0 && <p className="text-sm text-cream-dim">No lessons yet — add your first one.</p>}
        {!loading && lessons.length > 0 && (
          <p className="text-xs text-cream-dim">Use ↑ / ↓ to change the order of the learning path.</p>
        )}
        {lessons.map((l, i) => (
          <div key={l.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="px-2 leading-none text-cream-dim hover:text-cream disabled:opacity-30"
                  title="Move up"
                  aria-label="Move up"
                >▲</button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === lessons.length - 1}
                  className="px-2 leading-none text-cream-dim hover:text-cream disabled:opacity-30"
                  title="Move down"
                  aria-label="Move down"
                >▼</button>
              </div>
              <span className="grid place-items-center w-7 h-7 rounded-full border border-gold/40 text-gold-bright text-xs font-semibold shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <div className="font-medium truncate">{l.title}</div>
                <div className="text-xs text-cream-dim">
                  {l.level} · {l.durationMin} min · +{l.xp} XP · {l.quizEnabled && l.quiz.length > 0 ? `⚡ quiz on (${l.quiz.length})` : "quiz off"}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(l)} className="btn-outline px-3 py-1.5 text-sm">Edit</button>
              <button onClick={() => remove(l)} className="btn-outline px-3 py-1.5 text-sm text-red-300">Delete</button>
            </div>
          </div>
        ))}
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

      {error && <p className="text-sm text-red-300 bg-red-accent/15 rounded-lg p-3">{error}</p>}

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
          <label className="block text-sm mb-1 text-cream-dim">Text below the video (Skool-style)</label>
          <textarea
            rows={6}
            className={inputClass}
            value={editing.body}
            onChange={(e) => setField("body", e.target.value)}
            placeholder={"Write anything to show under the video:\n\n• explanations & examples\n• homework or tasks\n• links\n\nLine breaks are kept."}
          />
          <p className="text-xs text-cream-dim mt-1">Shown to students right below the video. Leave empty to hide.</p>
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
            <button onClick={() => removeMaterial(mi)} className="text-red-300 text-sm px-2 shrink-0">✕</button>
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
              <button onClick={() => removeQuestion(qi)} className="text-red-300 text-xs">Remove</button>
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
