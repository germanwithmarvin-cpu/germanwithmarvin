"use client";

import { useState } from "react";
import { cancelLesson, type Booking } from "@/lib/schedule";

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function LessonsList({ bookings, onChange, teacher = false, names = {} }: { bookings: Booking[]; onChange: () => void; teacher?: boolean; names?: Record<string, string> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const upcoming = bookings.filter((b) => b.status === "booked" && new Date(b.startsAt).getTime() > Date.now());

  async function cancel(b: Booking) {
    const free = new Date(b.startsAt).getTime() > Date.now() + 24 * 3600e3;
    const warn = free
      ? "Cancel this lesson? Your hour will be refunded."
      : "It's less than 24 h before this lesson — cancelling now forfeits the hour. Continue?";
    if (!confirm(warn)) return;
    setBusy(b.id); setErr(null);
    const { error } = await cancelLesson(b.id);
    setBusy(null);
    if (error) { setErr(error); return; }
    onChange();
  }

  if (upcoming.length === 0) return <p className="text-sm text-cream-dim">No upcoming lessons yet.</p>;

  return (
    <div className="space-y-2">
      {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{err}</p>}
      <div className="text-xs text-cream-dim">Times in {tz}</div>
      {upcoming.map((b) => {
        const soon = new Date(b.startsAt).getTime() < Date.now() + 24 * 3600e3;
        return (
          <div key={b.id} className="card p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{fmt(b.startsAt)}</div>
              <div className="text-xs text-cream-dim">
                {teacher ? <b className="text-cream">{names[b.studentId] ?? "Student"}</b> : "Your lesson"}
                {b.recurringId && <span className="text-gold-bright"> · 🔁 weekly</span>}
                {b.meetLink && <> · <a href={b.meetLink} target="_blank" rel="noreferrer" className="text-gold-bright underline">Join</a></>}
                {soon && <span className="text-red-700"> · under 24 h (no refund)</span>}
              </div>
            </div>
            <button onClick={() => cancel(b)} disabled={busy === b.id} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50">
              {busy === b.id ? "…" : "Cancel"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
