"use client";

import { useState } from "react";
import type { TeacherProfile } from "@/lib/booking";

// Ruhiger „Lehrer wählen"-Auswähler: kompakte Karten (großes Foto, Name, Rolle,
// Sprache, Preis). Klick wählt den Lehrer aus; die ausführliche Vorstellung +
// Buchung erscheinen darunter (in der Buchungsseite). Inaktive Lehrer sind
// wählbar (zeigen ihre Vorstellung + „Booking opens soon").
export default function TeacherProfiles({
  teachers,
  selectedId,
  onSelect,
}: {
  teachers: TeacherProfile[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  if (teachers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="font-semibold text-lg">Choose your teacher</div>
      <div className="grid gap-4 sm:grid-cols-2">
        {teachers.map((t) => (
          <TeacherCard key={t.id} t={t} selected={t.id === selectedId} onSelect={() => onSelect(t.id)} />
        ))}
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function TeacherCard({ t, selected, onSelect }: { t: TeacherProfile; selected: boolean; onSelect: () => void }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="card w-full text-center p-7 flex flex-col items-center gap-4 transition hover:brightness-[1.03]"
      style={selected ? { outline: "2px solid var(--gold)", outlineOffset: "2px" } : undefined}
    >
      {/* Großes Foto, ruhig zentriert */}
      <div className="w-28 h-28 rounded-3xl overflow-hidden bg-bordeaux-deep/60 grid place-items-center"
           style={{ border: "1.5px solid color-mix(in srgb, var(--gold) 35%, transparent)" }}>
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" style={{ objectPosition: "center top" }} onError={() => setImgOk(false)} />
        ) : (
          <span className="text-2xl font-bold text-gold-bright">{initials(t.name)}</span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-xl font-bold text-cream leading-tight">{t.name}</div>
        <div className="text-cream-dim">{t.role}</div>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-cream-dim">
        {t.languages && <span>🗣 {t.languages}</span>}
        {t.hourlyRate != null && (
          <span>· <span className="text-cream font-semibold">${t.hourlyRate % 1 === 0 ? t.hourlyRate : t.hourlyRate.toFixed(2)}</span>/lesson</span>
        )}
      </div>

      {/* Status / Auswahl */}
      {!t.active ? (
        <span className="text-sm rounded-full px-4 py-1.5 mt-1"
              style={{ background: "color-mix(in srgb, var(--gold) 14%, transparent)", color: "var(--gold-bright)" }}>
          Booking opens soon
        </span>
      ) : selected ? (
        <span className="text-sm font-semibold rounded-full px-4 py-1.5 mt-1"
              style={{ background: "color-mix(in srgb, var(--gold) 22%, transparent)", color: "var(--gold-bright)" }}>
          ✓ Selected
        </span>
      ) : (
        <span className="text-sm rounded-full px-4 py-1.5 mt-1 border"
              style={{ borderColor: "color-mix(in srgb, var(--gold) 40%, transparent)", color: "var(--cream)" }}>
          Choose
        </span>
      )}
    </button>
  );
}
