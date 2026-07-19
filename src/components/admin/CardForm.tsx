"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { Card } from "@/lib/types";
import { uploadMedia } from "@/lib/storage";
import { caseFromTags, CASE_MARKERS, type CaseTag } from "@/lib/grammar";

const CASE_KEYS: CaseTag[] = ["akk", "dat", "gen", "wechsel"];

type Draft = {
  front: string;
  back: string;
  imageUrl: string | null;
  audioUrl: string | null;
  caseTag: "" | CaseTag;
  tags: string; // freie Tags (ohne den Kasus-Tag)
  notes: string;
  example: string;
  exampleEn: string;
};

// Erkennt den gewählten Kasus aus den Tags (für die Auswahl).
function detectCaseKey(tags: string[]): "" | CaseTag {
  const marker = caseFromTags(tags);
  if (!marker) return "";
  const entry = (Object.keys(CASE_MARKERS) as CaseTag[]).find((k) => CASE_MARKERS[k] === marker);
  return entry ?? "";
}

function toDraft(card?: Partial<Card>): Draft {
  const allTags = card?.tags ?? [];
  const caseKey = detectCaseKey(allTags);
  const freeTags = allTags.filter((t) => !(CASE_KEYS as string[]).includes(t.trim().toLowerCase()));
  return {
    front: card?.front ?? "",
    back: card?.back ?? "",
    imageUrl: card?.imageUrl ?? null,
    audioUrl: card?.audioUrl ?? null,
    caseTag: caseKey,
    tags: freeTags.join(", "),
    notes: card?.notes ?? "",
    example: card?.example ?? "",
    exampleEn: card?.exampleEn ?? "",
  };
}

// Formular zum Anlegen/Bearbeiten einer Karte. Ruft onSave mit den Feldern auf.
export default function CardForm({
  card,
  onSave,
  onCancel,
}: {
  card?: Partial<Card>;
  onSave: (fields: Partial<Card>) => Promise<void>;
  onCancel?: () => void;
}) {
  const [d, setD] = useState<Draft>(toDraft(card));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"image" | "audio" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setD((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(kind: "image" | "audio", file: File) {
    setError(null);
    setUploading(kind);
    const { url, error } = await uploadMedia(file, kind);
    setUploading(null);
    if (error) {
      setError(error);
      return;
    }
    if (kind === "image") set("imageUrl", url ?? null);
    else set("audioUrl", url ?? null);
  }

  async function handleSave() {
    if (!d.front.trim() || !d.back.trim()) {
      setError("Front and back are required.");
      return;
    }
    setSaving(true);
    const freeTags = d.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const tags = d.caseTag ? [d.caseTag, ...freeTags] : freeTags;
    await onSave({
      front: d.front.trim(),
      back: d.back.trim(),
      imageUrl: d.imageUrl,
      audioUrl: d.audioUrl,
      tags,
      notes: d.notes.trim(),
      example: d.example.trim(),
      exampleEn: d.exampleEn.trim(),
    });
    setSaving(false);
    if (!card?.id) setD(toDraft()); // beim Neuanlegen Formular leeren
  }

  const inputCls = "w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold";

  return (
    <div className="card p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-cream-dim">German (with article)</label>
          <input value={d.front} onChange={(e) => set("front", e.target.value)} className={inputCls} placeholder="das Haus" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">English translation</label>
          <input value={d.back} onChange={(e) => set("back", e.target.value)} className={inputCls} placeholder="the house" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload("image", e.target.files[0])} className="text-sm text-cream-dim" />
          {uploading === "image" && <p className="text-xs text-cream-dim mt-1">Uploading…</p>}
          {d.imageUrl && (
            <div className="mt-2 flex items-center gap-2">
              <img src={d.imageUrl} alt="" className="h-12 rounded object-contain" />
              <button onClick={() => set("imageUrl", null)} className="text-xs text-red-700">remove</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Audio (optional)</label>
          <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && handleUpload("audio", e.target.files[0])} className="text-sm text-cream-dim" />
          {uploading === "audio" && <p className="text-xs text-cream-dim mt-1">Uploading…</p>}
          {d.audioUrl && (
            <div className="mt-2 flex items-center gap-2">
              <audio controls src={d.audioUrl} className="h-8 max-w-[12rem]" />
              <button onClick={() => set("audioUrl", null)} className="text-xs text-red-700">remove</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Fixed case (optional)</label>
          <select value={d.caseTag} onChange={(e) => set("caseTag", e.target.value as Draft["caseTag"])} className={inputCls}>
            <option value="">— none —</option>
            {CASE_KEYS.map((k) => (
              <option key={k} value={k}>{CASE_MARKERS[k].symbol} {CASE_MARKERS[k].title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Tags (comma separated)</label>
          <input value={d.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} placeholder="nouns, household" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Notes / hint (English)</label>
          <input value={d.notes} onChange={(e) => set("notes", e.target.value)} className={inputCls} placeholder="neuter noun" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Example sentence (German)</label>
          <input value={d.example} onChange={(e) => set("example", e.target.value)} className={inputCls} placeholder="Ich esse jeden Tag Brot." />
        </div>
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Example translation (English)</label>
          <input value={d.exampleEn} onChange={(e) => set("exampleEn", e.target.value)} className={inputCls} placeholder="I eat bread every day." />
        </div>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving || uploading !== null} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
          {saving ? "Saving…" : card?.id ? "Save changes" : "Add card"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="btn-outline px-4 py-2 text-sm">Cancel</button>
        )}
      </div>
    </div>
  );
}
