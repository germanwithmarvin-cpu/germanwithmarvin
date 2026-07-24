"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getTeacherSettings, getBlocks, getTakenMs, getGoogleBusy, generateSlots, bookLesson, type Slot } from "@/lib/schedule";

const studentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: studentTz });
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: studentTz });
const fullDayLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: studentTz });

// Datums-Schlüssel (YYYY-MM-DD) sind zeitzonen-neutral; wir rechnen darauf in UTC,
// damit Wochen-/Wochentagsberechnungen nicht driften.
const weekdayLabel = (key: string) => new Date(key + "T12:00:00Z").toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" });
const dayNumLabel = (key: string) => new Date(key + "T12:00:00Z").toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });
const mondayKey = (key: string) => {
  const d = new Date(key + "T00:00:00Z");
  const dow = d.getUTCDay(); // 0=So..6=Sa
  d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
  return d.toISOString().slice(0, 10);
};
const addDaysKey = (key: string, n: number) => {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const rangeLabel = (mon: string) => {
  const a = new Date(mon + "T12:00:00Z"), b = new Date(addDaysKey(mon, 6) + "T12:00:00Z");
  const f = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });
  return `${f(a)} – ${f(b)}`;
};

export default function BookingCalendar({ canBook, onBooked }: { canBook: boolean; onBooked: () => void }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotMin, setSlotMin] = useState(50);
  const [loading, setLoading] = useState(true);
  const [weekIdx, setWeekIdx] = useState(0);
  const [confirm, setConfirm] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const settings = await getTeacherSettings();
    setSlotMin(settings.slotMinutes);
    const now = new Date();
    const to = new Date(now.getTime() + (settings.horizonDays + 1) * 86400e3);
    const [blocks, taken, gbusy] = await Promise.all([
      getBlocks(),
      getTakenMs(now.toISOString(), to.toISOString()),
      getGoogleBusy(now.toISOString(), to.toISOString()),
    ]);
    setSlots(generateSlots(settings, taken, [...blocks, ...gbusy], now));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const byDay = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots) {
      const k = dayKey(s.startISO);
      (m.get(k) ?? m.set(k, []).get(k)!).push(s);
    }
    return m;
  }, [slots]);

  // Wochen (Montag-Schlüssel), die überhaupt freie Zeiten haben.
  const weeks = useMemo(() => {
    const set = new Set<string>();
    for (const k of byDay.keys()) set.add(mondayKey(k));
    return [...set].sort();
  }, [byDay]);
  useEffect(() => { if (weekIdx > weeks.length - 1) setWeekIdx(0); }, [weeks, weekIdx]);

  async function book(iso: string) {
    setBusy(true); setErr(null);
    const { error } = await bookLesson(iso);
    setBusy(false);
    if (error) { setErr(error); return; }
    setConfirm(null);
    await load();
    onBooked();
  }

  const endLabel = (iso: string) => timeLabel(new Date(new Date(iso).getTime() + slotMin * 60e3).toISOString());

  if (loading) return <div className="card p-5 text-cream-dim text-sm">Loading available times…</div>;
  if (slots.length === 0) return <div className="card p-5 text-cream-dim text-sm">No free times right now — please check back soon.</div>;

  const mon = weeks[Math.min(weekIdx, weeks.length - 1)];
  const days = mon ? Array.from({ length: 7 }, (_, i) => addDaysKey(mon, i)) : [];

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="font-semibold text-lg">Book a lesson</div>
        <span className="text-xs text-cream-dim">Times shown in {studentTz}</span>
      </div>

      {/* Wochen-Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setWeekIdx((i) => Math.max(0, i - 1))}
          disabled={weekIdx <= 0}
          className="btn-outline px-3 py-1.5 text-sm disabled:opacity-30"
          aria-label="Previous week"
        >‹</button>
        <div className="text-sm font-medium">{mon ? rangeLabel(mon) : ""}</div>
        <button
          onClick={() => setWeekIdx((i) => Math.min(weeks.length - 1, i + 1))}
          disabled={weekIdx >= weeks.length - 1}
          className="btn-outline px-3 py-1.5 text-sm disabled:opacity-30"
          aria-label="Next week"
        >›</button>
      </div>

      {err && !confirm && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{err}</p>}

      {/* Wochen-Raster: 7 Tagesspalten */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid grid-cols-7 gap-2 min-w-[640px]">
          {days.map((k) => {
            const daySlots = byDay.get(k) ?? [];
            const isToday = k === dayKey(new Date().toISOString());
            return (
              <div key={k} className="min-w-0">
                <div className={`text-center pb-2 mb-1 border-b ${isToday ? "border-gold/50" : "border-gold/15"}`}>
                  <div className={`text-xs font-semibold ${isToday ? "text-gold-bright" : "text-cream"}`}>{weekdayLabel(k)}</div>
                  <div className="text-[11px] text-cream-dim">{dayNumLabel(k)}</div>
                </div>
                <div className="space-y-1.5">
                  {daySlots.length === 0
                    ? <div className="text-center text-cream-dim/50 text-xs py-2">—</div>
                    : daySlots.map((s) => (
                        <button
                          key={s.startISO}
                          onClick={() => { setErr(null); setConfirm(s); }}
                          className="w-full btn-outline py-1.5 text-xs sm:text-sm"
                        >
                          {timeLabel(s.startISO)}
                        </button>
                      ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!canBook && <p className="text-xs text-cream-dim">You need lesson hours to book — subscribe or top up above.</p>}

      {/* Bestätigungs-Zusammenfassung vor dem Buchen */}
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(59,41,34,0.5)" }} onClick={() => !busy && setConfirm(null)}>
          <div className="card study-card p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold">Confirm your lesson</div>
            <div className="rounded-xl p-4 text-center" style={{ background: "color-mix(in srgb, var(--gold) 12%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 25%, transparent)" }}>
              <div className="font-semibold">{fullDayLabel(confirm.startISO)}</div>
              <div className="text-2xl font-bold text-gold-bright mt-1">{timeLabel(confirm.startISO)} – {endLabel(confirm.startISO)}</div>
              <div className="text-xs text-cream-dim mt-1">{studentTz} · {slotMin} minutes</div>
            </div>
            <ul className="text-sm text-cream-dim space-y-1">
              <li>• Uses <b className="text-cream">1</b> of your lesson hours</li>
              <li>• Free cancellation up to 24 h before</li>
            </ul>
            {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => setConfirm(null)} disabled={busy} className="btn-outline flex-1 py-2.5 disabled:opacity-50">Back</button>
              <button onClick={() => canBook ? book(confirm.startISO) : setErr("You have no lesson hours left.")} disabled={busy} className="btn-gold flex-1 py-2.5 disabled:opacity-50">
                {busy ? "Booking…" : "Confirm booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
