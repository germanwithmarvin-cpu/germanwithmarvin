"use client";

import type { Card } from "@/lib/types";
import PlayButton from "@/components/PlayButton";

// Vokabelliste (Zusammenfassung / Gesamtliste). Deutsches Wort + kleiner
// Play-Button, englische Übersetzung, Beispielsatz mit eigenem Play-Button.
// Ausspielen NUR per Button (kein Autoplay).
export default function WordList({ cards }: { cards: Card[] }) {
  if (cards.length === 0) {
    return <p className="text-sm text-cream-dim">No words here yet.</p>;
  }
  return (
    <ul className="divide-y divide-gold/10">
      {cards.map((c) => (
        <li key={c.id} className="py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-cream">{c.front}</span>
            <PlayButton url={c.audioUrl} label="Play word" size="sm" />
            {c.back && <span className="text-sm text-cream-dim">— {c.back}</span>}
          </div>
          {c.example && (
            <div className="flex items-start gap-2 mt-1">
              <p className="text-sm text-cream-dim flex-1 min-w-0">{c.example}</p>
              <PlayButton url={c.exampleAudioUrl} label="Play sentence" size="sm" />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
