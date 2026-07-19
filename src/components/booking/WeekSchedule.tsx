"use client";

import { useMemo, useState } from "react";
import type { Booking, ExternalEvent } from "@/lib/schedule";

// Wochenansicht wie bei Preply: Mo–So × Uhrzeit, Buchungen als Blöcke.
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_H = 6;
const END_H = 24;
const HOUR_PX = 46;
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

function mondayOf(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const hm = (d: Date) => d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export default function WeekSchedule({ bookings, names, external = [] }: { bookings: Booking[]; names: Record<string, string>; external?: ExternalEvent[] }) {
  // Start bei der Woche der nächsten kommenden Buchung (sonst diese Woche).
  const [weekStart, setWeekStart] = useState(() => {
    const next = bookings
      .filter((b) => b.status === "booked" && new Date(b.startsAt).getTime() > Date.now())
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
    return mondayOf(next ? new Date(next.startsAt) : new Date());
  });

  const active = useMemo(() => bookings.filter((b) => b.status === "booked"), [bookings]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }), [weekStart]);

  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekCount = active.filter((b) => { const t = new Date(b.startsAt).getTime(); return t >= weekStart.getTime() && t < weekEnd.getTime(); }).length;

  const shift = (w: number) => { const d = new Date(weekStart); d.setDate(d.getDate() + w * 7); setWeekStart(d); };
  const rangeLabel = `${days[0].toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
  const height = (END_H - START_H) * HOUR_PX;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shift(-1)} className="btn-outline w-9 h-9 grid place-items-center" aria-label="Previous week">‹</button>
        <div className="font-semibold text-sm">{rangeLabel} <span className="text-cream-dim font-normal">· {tz}</span></div>
        <button onClick={() => shift(1)} className="btn-outline w-9 h-9 grid place-items-center" aria-label="Next week">›</button>
      </div>
      <div className="flex items-center justify-center gap-4 text-[11px] text-cream-dim mb-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "var(--bordeaux)" }} /> App lessons</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "color-mix(in srgb, var(--cream) 16%, transparent)", border: "1px solid color-mix(in srgb, var(--cream) 20%, transparent)" }} /> Your Google calendar</span>
      </div>
      {weekCount === 0 && <p className="text-xs text-cream-dim mb-2 text-center">No app bookings this week — use ‹ › to browse other weeks.</p>}

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Kopf */}
          <div className="grid" style={{ gridTemplateColumns: "44px repeat(7, 1fr)" }}>
            <div />
            {days.map((d, i) => (
              <div key={i} className={`text-center text-xs pb-1 ${sameDay(d, new Date()) ? "text-gold-bright font-bold" : "text-cream-dim"}`}>
                {DAY_LABELS[i]} {d.getDate()}
              </div>
            ))}
          </div>
          {/* Raster */}
          <div className="grid" style={{ gridTemplateColumns: "44px repeat(7, 1fr)" }}>
            {/* Zeit-Spalte */}
            <div style={{ height }} className="relative">
              {Array.from({ length: END_H - START_H }, (_, h) => (
                <div key={h} className="absolute right-1 text-[10px] text-cream-dim" style={{ top: h * HOUR_PX - 6 }}>{String(START_H + h).padStart(2, "0")}:00</div>
              ))}
            </div>
            {/* Tage */}
            {days.map((day, di) => {
              const items = active.filter((b) => sameDay(new Date(b.startsAt), day));
              const ext = external.filter((e) => sameDay(new Date(e.start), day));
              const topOf = (iso: string) => { const d = new Date(iso); return ((d.getHours() * 60 + d.getMinutes()) - START_H * 60) / 60 * HOUR_PX; };
              const heightOf = (a: string, b: string) => Math.max(18, (new Date(b).getTime() - new Date(a).getTime()) / 60000 / 60 * HOUR_PX - 2);
              return (
                <div key={di} className="relative border-l" style={{ height, borderLeftColor: "color-mix(in srgb, var(--cream) 8%, transparent)" }}>
                  {Array.from({ length: END_H - START_H }, (_, h) => (
                    <div key={h} className="absolute left-0 right-0 border-t" style={{ top: h * HOUR_PX, borderTopColor: "color-mix(in srgb, var(--cream) 6%, transparent)" }} />
                  ))}
                  {/* Google-Termine (grau, im Hintergrund) */}
                  {ext.map((e, k) => (
                    <div key={`x${k}`} className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 overflow-hidden text-[10px] leading-tight" style={{ top: topOf(e.start), height: heightOf(e.start, e.end), background: "color-mix(in srgb, var(--cream) 14%, transparent)", color: "var(--cream-dim)", border: "1px solid color-mix(in srgb, var(--cream) 18%, transparent)" }} title={`${hm(new Date(e.start))}–${hm(new Date(e.end))} · ${e.summary}`}>
                      <div className="truncate">{e.summary}</div>
                    </div>
                  ))}
                  {items.map((b) => {
                    const s = new Date(b.startsAt), e = new Date(b.endsAt);
                    const top = ((s.getHours() * 60 + s.getMinutes()) - START_H * 60) / 60 * HOUR_PX;
                    const dur = Math.max(20, (e.getTime() - s.getTime()) / 60000);
                    return (
                      <div key={b.id} className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 overflow-hidden text-white text-[11px] leading-tight" style={{ top, height: dur / 60 * HOUR_PX - 2, background: "var(--bordeaux)" }} title={`${hm(s)}–${hm(e)} · ${names[b.studentId] ?? "Student"}`}>
                        <div className="opacity-80">{hm(s)}</div>
                        <div className="font-semibold truncate">{names[b.studentId] ?? "Student"}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
