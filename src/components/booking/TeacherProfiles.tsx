"use client";

import { useEffect, useState } from "react";
import { getTeachers, type TeacherProfile } from "@/lib/booking";

// „Meet your teachers" — Profilkarten auf der 1:1-Seite. Rein informativ (Phase 3);
// die lehrer-spezifische Buchung folgt. Inaktive Lehrer erscheinen mit dem Badge
// „Booking opens soon".
export default function TeacherProfiles() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTeachers().then((t) => { setTeachers(t); setLoaded(true); });
  }, []);

  if (!loaded || teachers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="font-semibold text-lg">Meet your teachers</div>
      <div className="grid gap-4 sm:grid-cols-2">
        {teachers.map((t) => (
          <TeacherCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function TeacherCard({ t }: { t: TeacherProfile }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={`card p-5 flex flex-col gap-3 ${t.active ? "" : "opacity-95"}`}>
      <div className="flex items-start gap-4">
        {/* Foto (object-top hält das Gesicht im Bild) oder Initialen-Fallback */}
        <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-bordeaux-deep/60 grid place-items-center"
             style={{ border: "1.5px solid color-mix(in srgb, var(--gold) 35%, transparent)" }}>
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" style={{ objectPosition: "center top" }} onError={() => setImgOk(false)} />
          ) : (
            <span className="text-xl font-bold text-gold-bright">{initials(t.name)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-cream">{t.name}</span>
            {!t.active && (
              <span className="text-[11px] uppercase tracking-wide rounded-full px-2 py-0.5"
                    style={{ background: "color-mix(in srgb, var(--gold) 18%, transparent)", color: "var(--gold-bright)" }}>
                Booking opens soon
              </span>
            )}
          </div>
          <div className="text-sm text-cream-dim mt-0.5">{t.role}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
            {t.languages && (
              <span className="rounded-full px-2 py-0.5 bg-bordeaux-deep/60 text-cream-dim">🗣 {t.languages}</span>
            )}
            {t.hourlyRate != null && (
              <span className="rounded-full px-2 py-0.5 bg-bordeaux-deep/60 text-cream-dim">${t.hourlyRate % 1 === 0 ? t.hourlyRate : t.hourlyRate.toFixed(2)}/hour</span>
            )}
          </div>
        </div>
      </div>

      {t.bio && <p className="text-sm text-cream-dim leading-relaxed">{t.bio}</p>}

      {t.highlights.length > 0 && (
        <ul className="text-sm text-cream-dim space-y-1">
          {t.highlights.map((h, i) => (
            <li key={i} className="flex gap-2"><span className="text-gold-bright shrink-0">✓</span><span>{h}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}
