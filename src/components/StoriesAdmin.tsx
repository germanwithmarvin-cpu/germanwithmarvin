"use client";

import { useEffect, useState } from "react";
import type { Story } from "@/lib/data";
import { getStories, saveStory, deleteStory, saveStoryOrder, slugify } from "@/lib/stories";
import PdfUpload from "@/components/PdfUpload";
import RichEditor from "@/components/RichEditor";

const LEVELS: Story["level"][] = ["A1", "A2", "B1", "B2", "C1"];
const inputClass = "w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm";

function emptyStory(): Story {
  return { id: "", title: "", level: "A1", intro: "", body: "", fileUrl: "" };
}

export default function StoriesAdmin() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Story | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setStories(await getStories());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function startNew() { setEditing(emptyStory()); setIsNew(true); setError(null); }
  function startEdit(s: Story) { setEditing(JSON.parse(JSON.stringify(s))); setIsNew(false); setError(null); }

  function setField<K extends keyof Story>(key: K, value: Story[K]) {
    setEditing((e) => (e ? { ...e, [key]: value } : e));
  }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) { setError("Please enter a title."); return; }
    setSaving(true);
    const story = { ...editing, id: editing.id || slugify(editing.title) };
    const sortOrder = isNew ? stories.length + 1 : undefined;
    const { error } = await saveStory(story, sortOrder);
    setSaving(false);
    if (error) { setError(error); return; }
    setEditing(null);
    refresh();
  }

  async function remove(s: Story) {
    if (!confirm(`Delete story “${s.title}”? This cannot be undone.`)) return;
    const { error } = await deleteStory(s.id);
    if (error) { setError(error); return; }
    refresh();
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= stories.length) return;
    const next = [...stories];
    [next[i], next[j]] = [next[j], next[i]];
    setStories(next);
    const { error } = await saveStoryOrder(next.map((s) => s.id));
    if (error) { setError(error); refresh(); }
  }

  // ---------------- LIST ----------------
  if (!editing) {
    return (
      <div className="space-y-4">
        <button onClick={startNew} className="btn-gold px-5 py-2.5">+ Add new story</button>
        {error && <p className="text-sm text-red-300 bg-red-accent/15 rounded-lg p-3">{error}</p>}
        {loading && <p className="text-sm text-cream-dim">Loading…</p>}
        {!loading && stories.length === 0 && <p className="text-sm text-cream-dim">No stories yet — add your first one.</p>}
        {stories.map((s, i) => (
          <div key={s.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="px-2 leading-none text-cream-dim hover:text-cream disabled:opacity-30" aria-label="Move up">▲</button>
                <button onClick={() => move(i, 1)} disabled={i === stories.length - 1} className="px-2 leading-none text-cream-dim hover:text-cream disabled:opacity-30" aria-label="Move down">▼</button>
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-cream-dim">{s.level} · {s.body.trim().split(/\s+/).filter(Boolean).length} words</div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(s)} className="btn-outline px-3 py-1.5 text-sm">Edit</button>
              <button onClick={() => remove(s)} className="btn-outline px-3 py-1.5 text-sm text-red-300">Delete</button>
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
        <h2 className="text-lg font-semibold">{isNew ? "New story" : "Edit story"}</h2>
        <button onClick={() => setEditing(null)} className="text-sm text-cream-dim hover:text-cream">← Back to list</button>
      </div>

      {error && <p className="text-sm text-red-300 bg-red-accent/15 rounded-lg p-3">{error}</p>}

      <div className="card p-5 space-y-3">
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Title</label>
          <input className={inputClass} value={editing.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Ein Tag in Berlin" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Level</label>
            <select className={inputClass} value={editing.level} onChange={(e) => setField("level", e.target.value as Story["level"])}>
              {LEVELS.map((lv) => <option key={lv}>{lv}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Short intro (shown in the list)</label>
          <input className={inputClass} value={editing.intro} onChange={(e) => setField("intro", e.target.value)} placeholder="One sentence about the story (optional)" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Story text (optional)</label>
          <RichEditor
            value={editing.body}
            onChange={(html) => setField("body", html)}
            placeholder="Write the story here, or leave empty for a download-only book."
          />
          <p className="text-xs text-cream-dim mt-1">Select text, then click <b>H</b>, <b>B</b> or <b>I</b> to format.</p>
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Book download (PDF / PNG / JPG, optional)</label>
          {editing.fileUrl ? (
            <div className="flex items-center gap-3 text-sm">
              <a href={editing.fileUrl} target="_blank" rel="noreferrer" className="text-gold-bright underline underline-offset-4">📕 View uploaded file</a>
              <button onClick={() => setField("fileUrl", "")} className="text-red-300 text-xs">Remove</button>
            </div>
          ) : (
            <PdfUpload folder="story-books" label="⬆ Upload book (PDF/PNG/JPG)" onUploaded={(url) => setField("fileUrl", url)} />
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="btn-gold px-6 py-2.5 disabled:opacity-50">
          {saving ? "Saving…" : "Save story"}
        </button>
        <button onClick={() => setEditing(null)} className="btn-outline px-6 py-2.5">Cancel</button>
      </div>
    </div>
  );
}
