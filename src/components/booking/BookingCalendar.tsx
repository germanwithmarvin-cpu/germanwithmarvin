"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getTeacherSettings, getBlocks, getTakenMs, generateSlots, bookLesson, type Slot } from "@/lib/schedule";

const studentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: studentTz });
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: studentTz }); // YYYY-MM-DD
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: studentTz });

export default function BookingCalendar({ canBook, onBooked }: { canBook: boolean; onBooked: () => void }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const settings = await getTeacherSettings();
    const now = new Date();
    const to = new Date(now.getTime() + (settings.horizonDays + 1) * 86400e3);
    const [blocks, taken] = await Promise.all([getBlocks(), getTakenMs(now.toISOString(), to.toISOString())]);
    setSlots(generateSlots(settings, taken, blocks, now));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  // Slots nach lokalem Tag gruppieren.
  const byDay = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots) {
      const k = dayKey(s.startISO);
      (m.get(k) ?? m.set(k, []).get(k)!).push(s);
    }
    return m;
  }, [slots]);
  const days = useMemo(() => [...byDay.keys()], [byDay]);

  useEffect(() => { if (!selectedDay && days.length) setSelectedDay(days[0]); }, [days, selectedDay]);

  async function book(iso: string) {
    if (!canBook) { setErr("You have no lesson hours left — top up your plan above."); return; }
    setBusy(iso); setErr(null);
    const { error } = await bookLesson(iso);
    setBusy(null);
    if (error) { setErr(error); return; }
    await load();
    onBooked();
  }

  if (loading) return <div className="card p-5 text-cream-dim text-sm">Loading available times…</div>;
  if (slots.length === 0) return <div className="card p-5 text-cream-dim text-sm">No free times right now — please check back soon.</div>;

  const daySlots = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-lg">Book a lesson</div>
        <span className="text-xs text-cream-dim">Times shown in {studentTz}</span>
      </div>
      {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{err}</p>}

      {/* Tage */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm border transition ${selectedDay === d ? "btn-gold" : "border-gold/25 text-cream-dim hover:border-gold/50"}`}
          >
            <div className="font-medium">{dayLabel(byDay.get(d)![0].startISO)}</div>
            <div className="text-xs opacity-70">{byDay.get(d)!.length} slots</div>
          </button>
        ))}
      </div>

      {/* Zeiten */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {daySlots.map((s) => (
          <button
            key={s.startISO}
            onClick={() => book(s.startISO)}
            disabled={busy === s.startISO}
            className="btn-outline py-2.5 text-sm disabled:opacity-50"
          >
            {busy === s.startISO ? "…" : timeLabel(s.startISO)}
          </button>
        ))}
      </div>
      {!canBook && <p className="text-xs text-cream-dim">You need lesson hours to book — subscribe or top up above.</p>}
    </div>
  );
}
