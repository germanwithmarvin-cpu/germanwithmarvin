"use client";

import { useMemo, useState } from "react";
import type { Booking } from "@/lib/schedule";

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: tz });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function LessonCalendar({ bookings }: { bookings: Booking[] }) {
  const active = useMemo(() => bookings.filter((b) => b.status === "booked"), [bookings]);

  // Karte je Tag → Buchungen.
  const byDay = useMemo(() => {
    const m = new Map<string, Booking[]>();
    for (const b of active) {
      const k = localKey(b.startsAt);
      (m.get(k) ?? m.set(k, []).get(k)!).push(b);
    }
    return m;
  }, [active]);

  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() }); // m: 0-11

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const first = new Date(view.y, view.m, 1);
  const offset = (first.getDay() + 6) % 7; // Montag = 0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const todayKey = today.toLocaleDateString("en-CA", { timeZone: tz });

  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const next = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const keyFor = (day: number) => `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="btn-outline w-9 h-9 grid place-items-center" aria-label="Previous month">‹</button>
        <div className="font-semibold">{monthLabel}</div>
        <button onClick={next} className="btn-outline w-9 h-9 grid place-items-center" aria-label="Next month">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-cream-dim mb-1">
        {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const k = keyFor(day);
          const items = byDay.get(k) ?? [];
          const isToday = k === todayKey;
          return (
            <div
              key={i}
              className="min-h-[3.6rem] rounded-lg p-1 text-left border"
              style={{
                borderColor: items.length ? "color-mix(in srgb, var(--gold) 45%, transparent)" : "color-mix(in srgb, var(--cream) 8%, transparent)",
                background: items.length ? "color-mix(in srgb, var(--gold) 14%, var(--surface))" : "transparent",
              }}
            >
              <div className={`text-xs ${isToday ? "font-bold text-gold-bright" : "text-cream-dim"}`}>{day}</div>
              {items.slice(0, 2).map((b) => (
                <div key={b.id} className="mt-0.5 text-[11px] font-medium leading-tight rounded px-1 py-0.5 truncate" style={{ background: "var(--bordeaux)", color: "#fff" }} title={timeOf(b.startsAt)}>
                  {timeOf(b.startsAt)}
                </div>
              ))}
              {items.length > 2 && <div className="text-[10px] text-cream-dim">+{items.length - 2}</div>}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-cream-dim mt-2">Times in {tz}</div>
    </div>
  );
}
