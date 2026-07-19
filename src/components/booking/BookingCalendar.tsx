"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getTeacherSettings, getBlocks, getTakenMs, generateSlots, bookLesson, type Slot } from "@/lib/schedule";

const studentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: studentTz });
const fullDayLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: studentTz });
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: studentTz });
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: studentTz });

export default function BookingCalendar({ canBook, onBooked }: { canBook: boolean; onBooked: () => void }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotMin, setSlotMin] = useState(50);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const settings = await getTeacherSettings();
    setSlotMin(settings.slotMinutes);
    const now = new Date();
    const to = new Date(now.getTime() + (settings.horizonDays + 1) * 86400e3);
    const [blocks, taken] = await Promise.all([getBlocks(), getTakenMs(now.toISOString(), to.toISOString())]);
    setSlots(generateSlots(settings, taken, blocks, now));
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
  const days = useMemo(() => [...byDay.keys()], [byDay]);
  useEffect(() => { if (!selectedDay && days.length) setSelectedDay(days[0]); }, [days, selectedDay]);

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

  const daySlots = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-lg">Book a lesson</div>
        <span className="text-xs text-cream-dim">Times shown in {studentTz}</span>
      </div>
      {err && !confirm && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{err}</p>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => (
          <button key={d} onClick={() => setSelectedDay(d)} className={`shrink-0 px-3 py-2 rounded-xl text-sm border transition ${selectedDay === d ? "btn-gold" : "border-gold/25 text-cream-dim hover:border-gold/50"}`}>
            <div className="font-medium">{dayLabel(byDay.get(d)![0].startISO)}</div>
            <div className="text-xs opacity-70">{byDay.get(d)!.length} slots</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {daySlots.map((s) => (
          <button key={s.startISO} onClick={() => { setErr(null); setConfirm(s); }} className="btn-outline py-2.5 text-sm">
            {timeLabel(s.startISO)}
          </button>
        ))}
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
