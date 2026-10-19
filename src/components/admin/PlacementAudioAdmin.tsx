"use client";

import { useEffect, useState } from "react";
import { getPlacement, setPlacementAudio, type PItem } from "@/lib/placementTest";
import AudioRecorder from "@/components/AudioRecorder";

// Lehrer-Tab: die Hör-Clips des öffentlichen Einstufungstests (/level-test)
// einsprechen. Ohne Audio erscheint der Hör-Teil auf der Landingpage nicht.

export default function PlacementAudioAdmin() {
  const [clips, setClips] = useState<PItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlacement(true).then((all) => {
      setClips(all.filter((i) => i.section === "listening" && i.kind === "audio"));
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-cream-dim">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Level-test audio 🎙️</h2>
        <p className="text-sm text-cream-dim mt-0.5">
          Record the listening clips for the free placement test on{" "}
          <a href="/level-test" target="_blank" rel="noreferrer" className="text-gold-bright underline underline-offset-2">/level-test</a>.
          Read each transcript aloud and record. <b className="text-cream">The listening part only appears publicly once every clip has audio.</b>
        </p>
      </div>

      {clips.length === 0 && (
        <p className="text-sm text-cream-dim bg-bordeaux-deep/40 rounded-lg p-3">
          No test yet. Run <code className="text-cream">supabase/placement.sql</code> + the content seed, then reload.
        </p>
      )}

      {clips.map((c, i) => (
        <div key={c.id} className="card p-4 space-y-3">
          <div className="text-xs text-cream-dim">Clip {i + 1} · {c.level} · <span className="italic">{c.prompt}</span></div>
          <div className="text-sm whitespace-pre-wrap rounded-lg bg-bordeaux-deep/30 p-3">{c.body}</div>
          <AudioRecorder url={c.audioUrl} slug={`plc-${c.id.slice(0, 8)}`}
            label="Listening clip" onUploaded={async (u) => {
              await setPlacementAudio(c.id, u);
              setClips((prev) => prev.map((x) => (x.id === c.id ? { ...x, audioUrl: u } : x)));
            }} />
        </div>
      ))}
    </div>
  );
}
