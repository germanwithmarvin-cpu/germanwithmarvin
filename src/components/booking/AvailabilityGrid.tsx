"use client";

import { useEffect, useRef, useState } from "react";
import type { WeeklyWindow } from "@/lib/schedule";

// Wochenraster wie bei Preply: dunkle Blöcke = verfügbar. Ziehen (in einer
// Spalte) legt einen Block an, Klick auf einen Block entfernt ihn.
// Speichert weiterhin WeeklyWindow[] (weekday 0=So..6=Sa, "HH:MM").

const DAYS = [
  { label: "Mon", wd: 1 }, { label: "Tue", wd: 2 }, { label: "Wed", wd: 3 },
  { label: "Thu", wd: 4 }, { label: "Fri", wd: 5 }, { label: "Sat", wd: 6 }, { label: "Sun", wd: 0 },
];
const START_HOUR = 6;
const END_HOUR = 24;
const STEP = 30; // Minuten je Zeile
const ROWS = ((END_HOUR - START_HOUR) * 60) / STEP;

const rowToMin = (row: number) => START_HOUR * 60 + row * STEP;
const minToHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const hhmmToMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

export default function AvailabilityGrid({ value, onChange }: { value: WeeklyWindow[]; onChange: (w: WeeklyWindow[]) => void }) {
  const [drag, setDrag] = useState<{ day: number; a: number; b: number } | null>(null);
  const dragRef = useRef(drag);
  dragRef.current = drag;

  // Ist (Tag-Index, Zeile) verfügbar? → passendes Fenster finden.
  const windowAt = (dayIdx: number, row: number) => {
    const wd = DAYS[dayIdx].wd;
    const t = rowToMin(row);
    return value.findIndex((w) => w.weekday === wd && hhmmToMin(w.start) <= t && t < hhmmToMin(w.end));
  };

  function onDown(dayIdx: number, row: number) {
    const idx = windowAt(dayIdx, row);
    if (idx >= 0) { onChange(value.filter((_, i) => i !== idx)); return; } // Klick auf Block → entfernen
    setDrag({ day: dayIdx, a: row, b: row });
  }
  function onEnter(dayIdx: number, row: number) {
    if (dragRef.current && dragRef.current.day === dayIdx) setDrag({ ...dragRef.current, b: row });
  }

  useEffect(() => {
    function up() {
      const d = dragRef.current;
      if (!d) return;
      const lo = Math.min(d.a, d.b), hi = Math.max(d.a, d.b);
      const start = minToHHMM(rowToMin(lo));
      const end = minToHHMM(rowToMin(hi) + STEP);
      const wd = DAYS[d.day].wd;
      // Überlappende Fenster desselben Tages verschmelzen.
      let s = hhmmToMin(start), e = hhmmToMin(end);
      const rest: WeeklyWindow[] = [];
      for (const w of value) {
        if (w.weekday === wd && hhmmToMin(w.start) <= e && s <= hhmmToMin(w.end)) {
          s = Math.min(s, hhmmToMin(w.start)); e = Math.max(e, hhmmToMin(w.end));
        } else rest.push(w);
      }
      onChange([...rest, { weekday: wd, start: minToHHMM(s), end: minToHHMM(e) }].sort((x, y) => x.weekday - y.weekday || hhmmToMin(x.start) - hhmmToMin(y.start)));
      setDrag(null);
    }
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [value, onChange]);

  const inDrag = (dayIdx: number, row: number) => drag && drag.day === dayIdx && row >= Math.min(drag.a, drag.b) && row <= Math.max(drag.a, drag.b);

  return (
    <div className="overflow-x-auto select-none">
      <div className="min-w-[640px]">
        {/* Kopf */}
        <div className="grid" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          <div />
          {DAYS.map((d) => <div key={d.wd} className="text-center text-xs font-medium text-cream-dim pb-1">{d.label}</div>)}
        </div>
        {/* Zeilen */}
        <div className="grid" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          {Array.from({ length: ROWS }, (_, row) => (
            <RowCells key={row} row={row} inDrag={inDrag} windowAt={windowAt} onDown={onDown} onEnter={onEnter} />
          ))}
        </div>
      </div>
      <p className="text-xs text-cream-dim mt-2">Drag on a day to add available time · click a block to remove it.</p>
    </div>
  );
}

function RowCells({ row, inDrag, windowAt, onDown, onEnter }: {
  row: number;
  inDrag: (d: number, r: number) => boolean | null;
  windowAt: (d: number, r: number) => number;
  onDown: (d: number, r: number) => void;
  onEnter: (d: number, r: number) => void;
}) {
  const isHour = rowToMin(row) % 60 === 0;
  return (
    <>
      <div className="text-[10px] text-cream-dim text-right pr-1 h-[16px] leading-[16px]">{isHour ? minToHHMM(rowToMin(row)) : ""}</div>
      {DAYS.map((d, dayIdx) => {
        const active = windowAt(dayIdx, row) >= 0 || inDrag(dayIdx, row);
        return (
          <div
            key={d.wd}
            onMouseDown={() => onDown(dayIdx, row)}
            onMouseEnter={() => onEnter(dayIdx, row)}
            className={`h-[16px] cursor-pointer border-b border-r ${isHour ? "border-b-gold/20" : "border-b-transparent"}`}
            style={{
              borderRightColor: "color-mix(in srgb, var(--cream) 8%, transparent)",
              background: active ? "var(--bordeaux)" : "transparent",
            }}
          />
        );
      })}
    </>
  );
}
