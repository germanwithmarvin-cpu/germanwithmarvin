"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMedia } from "@/lib/storage";

// Wiederverwendbarer Aufnahme-Button (Gedrückthalten wie eine Sprachnachricht).
// Lädt die Aufnahme ins Bucket 'card-media' und meldet die öffentliche URL per
// onUploaded zurück. Playback nur auf Klick. (Logik aus AudioAdmin extrahiert.)

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of MIME_CANDIDATES) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* nope */ } }
  return "";
}
const extFor = (m: string) => (m.includes("webm") ? "webm" : m.includes("mp4") ? "m4a" : m.includes("mpeg") ? "mp3" : "webm");

export default function AudioRecorder({
  url, onUploaded, label = "Audio", slug = "clip",
}: {
  url: string | null;
  onUploaded: (url: string | null) => void;
  label?: string;
  slug?: string;
}) {
  const [micReady, setMicReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  async function enableMic() {
    setError(null);
    try { streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true }); setMicReady(true); }
    catch { setError("Mikrofonzugriff blockiert. Im Browser erlauben und neu laden."); }
  }

  function startRec() {
    if (activeRef.current || !streamRef.current || busy) return;
    const mime = pickMime();
    let r: MediaRecorder;
    try { r = mime ? new MediaRecorder(streamRef.current, { mimeType: mime }) : new MediaRecorder(streamRef.current); }
    catch { setError("Aufnahme wird von diesem Browser nicht unterstützt."); return; }
    chunksRef.current = [];
    r.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    r.onstop = () => void handleStop();
    recorderRef.current = r;
    startedAtRef.current = Date.now();
    setError(null);
    r.start();
    activeRef.current = true;
    setRecording(true);
  }
  function stopRec() {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    activeRef.current = false;
    setRecording(false);
  }

  async function handleStop() {
    const r = recorderRef.current;
    recorderRef.current = null;
    const type = r?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];
    if (Date.now() - startedAtRef.current < 350 || blob.size < 800) { setError("Zu kurz – länger halten."); return; }
    setBusy(true);
    const file = new File([blob], `exam-${slug}-${Date.now()}.${extFor(type)}`, { type });
    const { url: up, error: upErr } = await uploadMedia(file, "audio");
    setBusy(false);
    if (upErr || !up) { setError(upErr || "Upload fehlgeschlagen."); return; }
    onUploaded(up);
  }

  function play() { if (url) { const a = new Audio(url); void a.play().catch(() => setError("Konnte nicht abspielen.")); } }

  return (
    <div className="rounded-lg border border-gold/15 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wide text-cream-dim">{label}</span>
        {url ? <span className="text-[11px] text-green-accent font-semibold">✓ recorded</span>
             : <span className="text-[11px] text-cream-dim">not yet</span>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {!micReady ? (
          <button onClick={enableMic} className="btn-gold px-3 py-1.5 text-sm">Enable mic</button>
        ) : (
          <button
            onPointerDown={(e) => { if (busy) return; e.preventDefault(); (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId); startRec(); }}
            onPointerUp={() => { if (recording) stopRec(); }}
            onPointerCancel={() => { if (recording) stopRec(); }}
            onContextMenu={(e) => e.preventDefault()}
            disabled={busy}
            style={{ touchAction: "none", userSelect: "none" }}
            className={`px-3 py-2 text-sm rounded-lg font-semibold transition select-none ${
              recording ? "bg-red-accent text-white animate-pulse" : "btn-gold"
            }`}
          >
            {busy ? "⏳ Saving…" : recording ? "● Recording — release" : "🎙️ Hold to record"}
          </button>
        )}
        <button onClick={play} disabled={!url} className={`w-9 h-9 grid place-items-center rounded-lg border ${url ? "border-gold/40 hover:border-gold text-cream" : "border-gold/15 opacity-40 cursor-not-allowed"}`} title="Play">▶</button>
        {url && <button onClick={() => onUploaded(null)} className="text-xs text-red-700 hover:underline" title="Remove">✕ remove</button>}
      </div>
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  );
}
