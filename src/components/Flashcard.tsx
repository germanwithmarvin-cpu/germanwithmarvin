"use client";

/* eslint-disable @next/next/no-img-element */
import type { Card } from "@/lib/types";
import { caseFromTags } from "@/lib/grammar";

export type Direction = "de-en" | "en-de";

// Kleines Kasus-Symbol (z. B. ⭐ Dativ), falls die Karte einen Kasus-Tag hat.
function CaseBadge({ tags }: { tags: string[] }) {
  const marker = caseFromTags(tags);
  if (!marker) return null;
  return (
    <span
      title={marker.title}
      className="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full align-middle"
      style={{ background: marker.bg, color: marker.fg }}
    >
      <span>{marker.symbol}</span>
      <span className="text-xs">{marker.short}</span>
    </span>
  );
}

// Karteikarte mit 3D-Flip. `direction` bestimmt, welche Seite die Frage ist.
// Konvention: card.front = Deutsch, card.back = Englisch.
export default function Flashcard({
  card,
  revealed,
  direction = "de-en",
  feedback = null,
  children,
}: {
  card: Card;
  revealed: boolean;
  direction?: Direction;
  // Optische Rückmeldung bei aktiven Modi (Tippen/Auswahl).
  feedback?: "correct" | "wrong" | null;
  // Optionaler Inhalt unter der Frage (z. B. Eingabefeld/Antwortoptionen).
  children?: React.ReactNode;
}) {
  const german = card.front;
  const english = card.back;
  const promptIsGerman = direction === "de-en";
  const promptText = promptIsGerman ? german : english;
  const answerText = promptIsGerman ? english : german;

  const faceCls = "flip-face card p-8 w-full min-h-[19rem] flex flex-col items-center justify-center gap-4 text-center";
  const fbCls = feedback === "correct" ? "fb-correct" : feedback === "wrong" ? "fb-wrong" : "";

  return (
    <div className="flip-scene w-full max-w-xl mx-auto">
      <div className={`flip-card ${fbCls} ${revealed ? "is-flipped" : ""}`}>
        {/* ---------- Vorderseite: Frage ---------- */}
        <div className={faceCls}>
          {card.imageUrl && <img src={card.imageUrl} alt="" className="max-h-40 rounded-lg object-contain" />}

          <div className="text-2xl font-semibold flex items-center justify-center gap-2 flex-wrap">
            <span>{promptText}</span>
            {promptIsGerman && <CaseBadge tags={card.tags} />}
          </div>

          {card.audioUrl && (
            <audio controls src={card.audioUrl} className="w-full max-w-xs">
              Your browser does not support audio.
            </audio>
          )}

          {children}

          {!children && <div className="text-xs text-cream-dim mt-2">Tap or press Space to flip</div>}
        </div>

        {/* ---------- Rückseite: Antwort mit Kontext ---------- */}
        <div className={`${faceCls} flip-back`}>
          <div className="text-sm text-cream-dim flex items-center justify-center gap-2 flex-wrap">
            <span>{promptText}</span>
            {promptIsGerman && <CaseBadge tags={card.tags} />}
          </div>
          <div className="w-16 border-t border-gold/25" />
          <div className="text-3xl text-gold-bright font-bold flex items-center justify-center gap-2 flex-wrap">
            <span>{answerText}</span>
            {!promptIsGerman && <CaseBadge tags={card.tags} />}
          </div>
          {card.notes && <p className="text-sm text-cream-dim whitespace-pre-wrap">{card.notes}</p>}
          {card.example && (
            <div className="mt-1 w-full rounded-lg bg-bordeaux-deep/50 border border-gold/20 px-4 py-3 text-left">
              <div className="text-[11px] uppercase tracking-wide text-gold-bright/80 mb-1">Example</div>
              <p className="text-base">{card.example}</p>
              {card.exampleEn && <p className="text-sm text-cream-dim mt-0.5">{card.exampleEn}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
