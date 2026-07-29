"use client";

import { useEffect, useRef, useState } from "react";
import { getDecks } from "@/lib/decks";
import { getCards, setCardAudio } from "@/lib/cards";
import { uploadMedia } from "@/lib/storage";
import type { Card, Deck } from "@/lib/types";

// Vertonungs-Workflow für den Lehrer: Karten-Liste, pro Karte Wort UND
// Beispielsatz nebeneinander. Aufnahme per Gedrückthalten (wie eine
// Sprachnachricht), Wiedergabe nur per Button (kein Autoplay). Die Aufnahme
// landet im Bucket 'card-media' und wird als audio_url bzw. example_audio_url
// an der Karte gespeichert.

type Kind = "word" | "example";
type Target = { cardId: string; kind: Kind };

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of MIME_CANDIDATES) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* nicht unterstützt */ }
  }
  return "";
}
function extFor(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  return "webm";
}
const keyOf = (t: Target) => `${t.cardId}:${t.kind}`;

export default function AudioAdmin() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckId, setDeckId] = useState<string>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [onlyMissing, setOnlyMissing] = useState(false);

  const [micReady, setMicReady] = useState(false);
  const [rec, setRec] = useState<Target | null>(null); // gerade aufgenommen
  const [busy, setBusy] = useState<Set<string>>(new Set()); // gerade am Hochladen
  const [error, setError] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState(0); // aktuelle Karte im Fokus-Modus
  const [focusMode, setFocusMode] = useState(false); // Eine-Karte-Ansicht ohne Scrollen

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const targetRef = useRef<Target | null>(null);
  const recRef = useRef<Target | null>(null); // synchron zum rec-State (für Tastatur-Guard)

  useEffect(() => {
    getDecks().then(setDecks);
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  useEffect(() => {
    if (!deckId) { setCards([]); return; }
    setLoadingCards(true);
    getCards(deckId).then((cs) => { setCards(cs); setLoadingCards(false); });
  }, [deckId]);

  async function enableMic() {
    setError(null);
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicReady(true);
    } catch {
      setError("Mikrofonzugriff wurde blockiert. Erlaube das Mikrofon im Browser und lade neu.");
    }
  }

  function markBusy(t: Target, on: boolean) {
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(keyOf(t)); else next.delete(keyOf(t));
      return next;
    });
  }

  function startRec(cardId: string, kind: Kind) {
    if (recRef.current || !streamRef.current) return;
    const mime = pickMime();
    let recorder: MediaRecorder;
    try {
      recorder = mime ? new MediaRecorder(streamRef.current, { mimeType: mime }) : new MediaRecorder(streamRef.current);
    } catch {
      setError("Aufnahme wird von diesem Browser nicht unterstützt.");
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => void handleStop();
    recorderRef.current = recorder;
    targetRef.current = { cardId, kind };
    startedAtRef.current = Date.now();
    setError(null);
    recorder.start();
    recRef.current = { cardId, kind };
    setRec({ cardId, kind });
  }

  function stopRec() {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    recRef.current = null;
    setRec(null);
  }

  async function handleStop() {
    const target = targetRef.current;
    const recorder = recorderRef.current;
    targetRef.current = null;
    recorderRef.current = null;
    if (!target) return;

    const durationMs = Date.now() - startedAtRef.current;
    const type = recorder?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];

    if (durationMs < 350 || blob.size < 800) {
      setError("Aufnahme war zu kurz – Button etwas länger gedrückt halten.");
      return;
    }

    markBusy(target, true);
    const ext = extFor(type);
    const file = new File([blob], `${target.kind}-${target.cardId}-${Date.now()}.${ext}`, { type });
    const { url, error: upErr } = await uploadMedia(file, "audio");
    if (upErr || !url) {
      setError(upErr || "Upload fehlgeschlagen.");
      markBusy(target, false);
      return;
    }
    const { error: saveErr } = await setCardAudio(target.cardId, target.kind, url);
    if (saveErr) {
      setError(saveErr);
      markBusy(target, false);
      return;
    }
    setCards((prev) => prev.map((c) => c.id === target.cardId
      ? { ...c, ...(target.kind === "word" ? { audioUrl: url } : { exampleAudioUrl: url }) }
      : c));
    markBusy(target, false);
  }

  function play(url: string | null) {
    if (!url) return;
    const a = new Audio(url); // kein Autoplay – nur auf Klick
    void a.play().catch(() => setError("Konnte die Aufnahme nicht abspielen."));
  }

  async function clearAudio(cardId: string, kind: Kind) {
    const { error: e } = await setCardAudio(cardId, kind, null);
    if (e) { setError(e); return; }
    setCards((prev) => prev.map((c) => c.id === cardId
      ? { ...c, ...(kind === "word" ? { audioUrl: null } : { exampleAudioUrl: null }) }
      : c));
  }

  const visible = onlyMissing
    ? cards.filter((c) => !c.audioUrl || (c.example.trim() !== "" && !c.exampleAudioUrl))
    : cards;
  const wordDone = cards.filter((c) => c.audioUrl).length;
  const withExample = cards.filter((c) => c.example.trim() !== "");
  const exampleDone = withExample.filter((c) => c.exampleAudioUrl).length;

  // Auswahl zuruecksetzen, wenn sich die Liste ändert.
  useEffect(() => { setFocusIdx(0); }, [deckId, onlyMissing]);

  // Falls die aktuelle Karte aus der Liste fällt (z. B. „nur ohne Audio"): einklammern.
  useEffect(() => { setFocusIdx((i) => Math.min(i, Math.max(0, visible.length - 1))); }, [visible.length]);

  // Fokus-Modus: Tastatur aktiv. ←/→ (bzw. Enter) blättern, 1 halten = Wort, 2 halten = Satz.
  useEffect(() => {
    if (!focusMode) return;
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (visible.length === 0) return;
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); setFocusIdx((i) => Math.min(i + 1, visible.length - 1)); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0)); }
      else if (!e.repeat && (e.key === "1" || e.key === "2")) {
        if (!micReady) return;
        const card = visible[focusIdx];
        if (!card) return;
        const kind: Kind = e.key === "1" ? "word" : "example";
        if (kind === "example" && card.example.trim() === "") return;
        e.preventDefault();
        startRec(card.id, kind);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "1" || e.key === "2") stopRec();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // startRec/stopRec sind über Refs stabil genug – nur die Lesewerte in den Deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMode, visible, focusIdx, micReady]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Pronunciation recordings 🎙️</h2>
        <p className="text-sm text-cream-dim mt-0.5">
          Pick a deck, then <b className="text-cream">press and hold</b> a mic button to record — release to save.
          Word and example sentence are separate. Nothing plays automatically; use ▶ to check.
        </p>
        <p className="text-xs text-cream-dim mt-1.5">
          Tip: <b className="text-cream">Focus mode</b> shows one card at a time (no scrolling). Then hands-free: hold <b className="text-cream">1</b> = word · hold <b className="text-cream">2</b> = sentence · <b className="text-cream">→</b> next.
        </p>
      </div>

      {/* Mikrofon + Deck-Auswahl */}
      <div className="flex flex-wrap items-center gap-3">
        {!micReady ? (
          <button onClick={enableMic} className="btn-gold px-4 py-2 text-sm">Enable microphone</button>
        ) : (
          <span className="text-xs text-green-accent font-semibold">● Microphone ready</span>
        )}
        <select
          value={deckId}
          onChange={(e) => setDeckId(e.target.value)}
          className="rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">— choose a deck —</option>
          {["A1", "A2", "B1", "B2", "C1"].map((lv) => {
            const group = decks.filter((d) => d.level === lv);
            if (group.length === 0) return null;
            return (
              <optgroup key={lv} label={lv}>
                {group.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </optgroup>
            );
          })}
        </select>
        {deckId && (
          <label className="flex items-center gap-1.5 text-xs text-cream-dim cursor-pointer">
            <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} className="accent-[color:var(--gold)]" />
            Only cards missing audio
          </label>
        )}
        {deckId && visible.length > 0 && (
          <button
            onClick={() => {
              const idx = visible.findIndex((c) => !c.audioUrl || (c.example.trim() !== "" && !c.exampleAudioUrl));
              setFocusIdx(idx >= 0 ? idx : 0);
              setFocusMode(true);
            }}
            className="btn-gold px-3 py-1.5 text-sm"
          >
            🎯 Focus mode
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}

      {deckId && cards.length > 0 && (
        <div className="flex gap-4 text-xs text-cream-dim">
          <span>Words: <b className="text-cream">{wordDone}/{cards.length}</b></span>
          <span>Sentences: <b className="text-cream">{exampleDone}/{withExample.length}</b></span>
        </div>
      )}

      {loadingCards && <p className="text-sm text-cream-dim">Loading cards…</p>}
      {deckId && !loadingCards && visible.length === 0 && (
        <p className="text-sm text-cream-dim">Nothing to show here.</p>
      )}

      {focusMode && (() => {
        const c = visible[focusIdx];
        if (!c) return (
          <div className="card p-6 text-center space-y-3">
            <p className="text-sm text-cream-dim">Nothing to record here.</p>
            <button onClick={() => setFocusMode(false)} className="btn-outline px-4 py-2 text-sm">Back to list</button>
          </div>
        );
        const pct = Math.round(((focusIdx + 1) / visible.length) * 100);
        return (
          <div className="card p-6 space-y-4 max-w-xl mx-auto">
            <div className="flex items-center justify-between text-xs text-cream-dim">
              <span>Card <b className="text-cream">{focusIdx + 1}</b> / {visible.length}</span>
              <button onClick={() => setFocusMode(false)} className="underline hover:text-cream">Exit focus</button>
            </div>
            <div className="h-1.5 rounded-full bg-bordeaux-deep/60">
              <div className="h-1.5 rounded-full bg-gold-bright transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-center text-sm text-cream-dim italic">means: {c.back}</div>
            <AudioCell
              label="Word (German) · hold key 1"
              text={c.front}
              url={c.audioUrl}
              recording={rec?.cardId === c.id && rec?.kind === "word"}
              busy={busy.has(`${c.id}:word`)}
              disabled={!micReady}
              onDown={() => startRec(c.id, "word")}
              onUp={stopRec}
              onPlay={() => play(c.audioUrl)}
              onClear={() => clearAudio(c.id, "word")}
            />
            <AudioCell
              label="Example sentence (German) · hold key 2"
              text={c.example || "— no example —"}
              url={c.exampleAudioUrl}
              recording={rec?.cardId === c.id && rec?.kind === "example"}
              busy={busy.has(`${c.id}:example`)}
              disabled={!micReady || c.example.trim() === ""}
              onDown={() => startRec(c.id, "example")}
              onUp={stopRec}
              onPlay={() => play(c.exampleAudioUrl)}
              onClear={() => clearAudio(c.id, "example")}
            />
            <div className="flex items-center justify-between pt-1">
              <button onClick={() => setFocusIdx((i) => Math.max(i - 1, 0))} disabled={focusIdx === 0} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-[11px] text-cream-dim text-center">hold 1 / 2 to record</span>
              <button onClick={() => setFocusIdx((i) => Math.min(i + 1, visible.length - 1))} disabled={focusIdx >= visible.length - 1} className="btn-gold px-4 py-2 text-sm disabled:opacity-40">Next →</button>
            </div>
          </div>
        );
      })()}

      {!focusMode && (
      <div className="space-y-3">
        {visible.map((c, i) => (
          <div key={c.id} className="card p-4">
            <div className="text-[11px] text-cream-dim mb-2">
              #{i + 1} · <span className="italic">means: {c.back}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <AudioCell
                label="Word (German)"
                text={c.front}
                url={c.audioUrl}
                recording={rec?.cardId === c.id && rec?.kind === "word"}
                busy={busy.has(`${c.id}:word`)}
                disabled={!micReady}
                onDown={() => startRec(c.id, "word")}
                onUp={stopRec}
                onPlay={() => play(c.audioUrl)}
                onClear={() => clearAudio(c.id, "word")}
              />
              <AudioCell
                label="Example sentence (German)"
                text={c.example || "— no example —"}
                url={c.exampleAudioUrl}
                recording={rec?.cardId === c.id && rec?.kind === "example"}
                busy={busy.has(`${c.id}:example`)}
                disabled={!micReady || c.example.trim() === ""}
                onDown={() => startRec(c.id, "example")}
                onUp={stopRec}
                onPlay={() => play(c.exampleAudioUrl)}
                onClear={() => clearAudio(c.id, "example")}
              />
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

function AudioCell({
  label, text, url, recording, busy, disabled, onDown, onUp, onPlay, onClear,
}: {
  label: string;
  text: string;
  url: string | null;
  recording: boolean;
  busy: boolean;
  disabled: boolean;
  onDown: () => void;
  onUp: () => void;
  onPlay: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg border border-gold/15 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] uppercase tracking-wide text-cream-dim">{label}</span>
        {url ? <span className="text-[11px] text-green-accent font-semibold">✓ recorded</span>
             : <span className="text-[11px] text-cream-dim">not yet</span>}
      </div>
      <div className="text-sm text-cream mb-3 line-clamp-2 min-h-[1.25rem]">{text}</div>
      <div className="flex items-center gap-2">
        <button
          onPointerDown={(e) => { if (disabled || busy) return; e.preventDefault(); (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId); onDown(); }}
          onPointerUp={() => { if (recording) onUp(); }}
          onPointerCancel={() => { if (recording) onUp(); }}
          onContextMenu={(e) => e.preventDefault()}
          disabled={disabled || busy}
          style={{ touchAction: "none", userSelect: "none" }}
          className={`px-3 py-2 text-sm rounded-lg font-semibold transition select-none ${
            recording ? "bg-red-accent text-white animate-pulse"
            : disabled ? "opacity-40 cursor-not-allowed border border-gold/20"
            : "btn-gold"
          }`}
        >
          {busy ? "⏳ Saving…" : recording ? "● Recording — release" : "🎙️ Hold to record"}
        </button>
        <button onClick={onPlay} disabled={!url} className={`w-9 h-9 grid place-items-center rounded-lg border ${url ? "border-gold/40 hover:border-gold text-cream" : "border-gold/15 opacity-40 cursor-not-allowed"}`} title="Play">▶</button>
        {url && <button onClick={onClear} className="text-xs text-red-700 hover:underline" title="Remove recording">✕</button>}
      </div>
    </div>
  );
}
