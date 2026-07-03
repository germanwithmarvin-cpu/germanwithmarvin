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

// Zeigt eine Karte. `direction` bestimmt, welche Seite die Frage ist.
// Konvention: front = Deutsch, back = Englisch.
export default function Flashcard({
  card,
  revealed,
  direction = "de-en",
}: {
  card: Card;
  revealed: boolean;
  direction?: Direction;
}) {
  const german = card.front;
  const english = card.back;
  const promptIsGerman = direction === "de-en";
  const promptText = promptIsGerman ? german : english;
  const answerText = promptIsGerman ? english : german;

  return (
    <div className="card p-8 w-full max-w-xl mx-auto text-center min-h-[18rem] flex flex-col items-center justify-center gap-4">
      {card.imageUrl && (
        <img src={card.imageUrl} alt="" className="max-h-40 rounded-lg object-contain" />
      )}

      <div className="text-2xl font-semibold flex items-center justify-center gap-2 flex-wrap">
        <span>{promptText}</span>
        {promptIsGerman && <CaseBadge tags={card.tags} />}
      </div>

      {card.audioUrl && (
        <audio controls src={card.audioUrl} className="w-full max-w-xs">
          Your browser does not support audio.
        </audio>
      )}

      {revealed && (
        <>
          <div className="w-full border-t border-gold/20 my-1" />
          <div className="text-2xl text-gold-bright font-bold flex items-center justify-center gap-2 flex-wrap">
            <span>{answerText}</span>
            {!promptIsGerman && <CaseBadge tags={card.tags} />}
          </div>
          {card.notes && <p className="text-sm text-cream-dim whitespace-pre-wrap">{card.notes}</p>}
          {card.example && (
            <div className="mt-2 w-full rounded-lg bg-bordeaux-deep/50 border border-gold/20 px-4 py-3 text-left">
              <div className="text-[11px] uppercase tracking-wide text-gold-bright/80 mb-1">Example</div>
              <p className="text-base">{card.example}</p>
              {card.exampleEn && <p className="text-sm text-cream-dim mt-0.5">{card.exampleEn}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
