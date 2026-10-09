"use client";

import { useEffect, useState } from "react";
import { getPapers, getPaperFull, setItemAudio, updatePaper, type ExamPaper, type ExamFull } from "@/lib/exams";
import AudioRecorder from "@/components/AudioRecorder";

// Lehrer-Verwaltung für den Prüfungstrainer. Inhalte erzeugt Marvin per Seed
// (Claude). Hier: Hör-Audios je Item aufnehmen + Prüfung veröffentlichen /
// als Trial-Beispiel markieren. Lese-/Schreibteile sind Vorschau.

const MODULE_LABEL: Record<string, string> = { reading: "📖 Lesen", listening: "🎧 Hören", writing: "✍️ Schreiben" };

export default function ExamsAdmin() {
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [full, setFull] = useState<ExamFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getPapers().then((p) => { setPapers(p); setLoading(false); }); }, []);

  async function open(id: string) {
    if (openId === id) { setOpenId(null); setFull(null); return; }
    setOpenId(id); setFull(null);
    setFull(await getPaperFull(id));
  }

  async function toggle(p: ExamPaper, field: "isPublished" | "isSample") {
    const next = !p[field];
    await updatePaper(p.id, { [field]: next });
    setPapers((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: next } : x)));
  }

  const byLevel = ["A1", "A2", "B1", "B2"].map((lv) => ({ lv, items: papers.filter((p) => p.level === lv) }));
  const audioMissing = (f: ExamFull) =>
    f.sections.filter((s) => s.section.module === "listening")
      .flatMap((s) => s.items).filter((i) => i.kind === "audio" && !i.audioUrl).length;

  if (loading) return <p className="text-sm text-cream-dim">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Exam trainer 📝</h2>
        <p className="text-sm text-cream-dim mt-0.5">
          Mock exams (Goethe/telc mix) per level. The content is seeded for you — your job here:
          <b className="text-cream"> record the listening clips</b>, then <b className="text-cream">publish</b>.
          Mark one paper per level as a <b className="text-cream">sample</b> so trial users get a taste.
        </p>
      </div>

      {papers.length === 0 && (
        <p className="text-sm text-cream-dim bg-bordeaux-deep/40 rounded-lg p-3">
          No exams yet. Run <code className="text-cream">supabase/exams.sql</code> + the B1 seed, then reload.
        </p>
      )}

      {byLevel.map(({ lv, items }) => items.length > 0 && (
        <div key={lv} className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wide text-gold-bright">{lv}</div>
          {items.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => open(p.id)} className="text-left">
                  <div className="font-semibold">{p.title} <span className="text-cream-dim text-sm">· Variante {p.variant}</span></div>
                  <div className="text-xs text-cream-dim">{p.subtitle}</div>
                </button>
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={p.isSample} onChange={() => toggle(p, "isSample")} className="accent-[color:var(--gold)]" />
                    <span className="text-cream-dim">Trial sample</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={p.isPublished} onChange={() => toggle(p, "isPublished")} className="accent-[color:var(--gold)]" />
                    <span className={p.isPublished ? "text-green-accent font-semibold" : "text-cream-dim"}>
                      {p.isPublished ? "Published" : "Publish"}
                    </span>
                  </label>
                  <button onClick={() => open(p.id)} className="btn-outline px-3 py-1.5 text-sm">
                    {openId === p.id ? "Close" : "Open"}
                  </button>
                </div>
              </div>

              {openId === p.id && (
                <div className="mt-4 border-t border-gold/15 pt-4">
                  {!full ? <p className="text-sm text-cream-dim">Loading…</p> : (
                    <div className="space-y-5">
                      {audioMissing(full) > 0 && (
                        <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">
                          {audioMissing(full)} listening clip(s) still need audio before this feels complete.
                        </p>
                      )}
                      {full.sections.map(({ section, items: its }) => (
                        <div key={section.id} className="space-y-3">
                          <div className="font-semibold">{MODULE_LABEL[section.module] ?? section.module}
                            <span className="text-xs text-cream-dim font-normal"> · {section.timeMinutes} min · {its.filter((i) => i.kind === "choice" || i.kind === "gap" || i.kind === "writing").length} Aufgaben</span>
                          </div>
                          {its.map((it) => {
                            if (it.kind === "audio") return (
                              <div key={it.id} className="rounded-lg bg-bordeaux-deep/30 p-3">
                                <div className="text-xs text-cream-dim mb-1">Transcript (read this aloud):</div>
                                <div className="text-sm mb-2 whitespace-pre-wrap">{it.body}</div>
                                <AudioRecorder url={it.audioUrl} slug={it.id.slice(0, 8)}
                                  label="Listening clip" onUploaded={async (u) => {
                                    await setItemAudio(it.id, u);
                                    setFull((f) => f && { ...f, sections: f.sections.map((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, audioUrl: u } : x) })) });
                                  }} />
                              </div>
                            );
                            if (it.kind === "passage") return (
                              <div key={it.id} className="rounded-lg bg-bordeaux-deep/20 p-3 text-sm whitespace-pre-wrap text-cream-dim">{it.body}</div>
                            );
                            if (it.kind === "writing") return (
                              <div key={it.id} className="text-sm pl-3 border-l-2 border-gold/30">
                                <b>✍️ {it.prompt}</b> <span className="text-cream-dim">({it.minWords ?? "?"}–{it.maxWords ?? "?"} Wörter, {it.points} P.)</span>
                              </div>
                            );
                            // choice / gap preview
                            return (
                              <div key={it.id} className="text-sm pl-3 border-l-2 border-gold/15">
                                <span className="text-cream-dim">Q:</span> {it.prompt}
                                {it.options.length > 0 && (
                                  <span className="text-cream-dim"> — {it.options.map((o, i) => `${i === it.correct ? "✓" : ""}${o}`).join(" / ")}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
