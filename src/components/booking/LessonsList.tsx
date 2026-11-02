"use client";

import { useState } from "react";
import { cancelLesson, rescheduleLesson, type Booking } from "@/lib/schedule";

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// ISO → Wert für <input type="datetime-local"> in BROWSER-Ortszeit (dieselbe
// Zeit, die oben via fmt angezeigt wird). So wählt der Lehrer die Zeit, die er sieht.
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LessonsList({ bookings, onChange, teacher = false, names = {} }: { bookings: Booking[]; onChange: () => void; teacher?: boolean; names?: Record<string, string> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // Buchung, die gerade verschoben wird
  const [newVal, setNewVal] = useState("");

  // Bis zum ENDE (+15 Min Puffer) anzeigen, nicht bis zum Start — sonst verschwindet
  // der „Join"-Link genau dann, wenn die Stunde beginnt.
  const upcoming = bookings.filter((b) => b.status === "booked" && new Date(b.endsAt).getTime() + 15 * 60_000 > Date.now());

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

  function startEdit(b: Booking) {
    setErr(null);
    setEditing(b.id);
    setNewVal(toLocalInput(b.startsAt));
  }

  async function saveEdit(b: Booking) {
    if (!newVal) return;
    const startISO = new Date(newVal).toISOString();
    if (new Date(newVal).getTime() === new Date(b.startsAt).getTime()) { setEditing(null); return; }
    const who = names[b.studentId] ?? "the student";
    if (!confirm(`Move this lesson to ${fmt(startISO)} and email ${who}?`)) return;
    setBusy(b.id); setErr(null);
    const { mailed, googleSynced, error } = await rescheduleLesson(b.id, startISO);
    setBusy(null);
    if (error) { setErr(error); return; }
    setEditing(null);
    if (googleSynced === false) setErr("Moved and the student was emailed, but your Google Calendar couldn't be updated — please move it there by hand.");
    else if (!mailed) setErr("Moved, but the student couldn't be emailed (no address on file).");
    onChange();
  }

  if (upcoming.length === 0) return <p className="text-sm text-cream-dim">No upcoming lessons yet.</p>;

  return (
    <div className="space-y-2">
      {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{err}</p>}
      <div className="text-xs text-cream-dim">Times in {tz}</div>
      {upcoming.map((b) => {
        const soon = new Date(b.startsAt).getTime() < Date.now() + 24 * 3600e3;
        const isEditing = editing === b.id;
        return (
          <div key={b.id} className="card p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{fmt(b.startsAt)}</div>
                <div className="text-xs text-cream-dim">
                  {teacher ? <b className="text-cream">{names[b.studentId] ?? "Student"}</b> : "Your lesson"}
                  {b.recurringId && <span className="text-gold-bright"> · 🔁 weekly</span>}
                  {b.meetLink && <> · <a href={b.meetLink} target="_blank" rel="noreferrer" className="text-gold-bright underline">Join</a></>}
                  {soon && <span className="text-red-700"> · under 24 h (no refund)</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {teacher && !isEditing && (
                  <button onClick={() => startEdit(b)} disabled={busy === b.id} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50">
                    Reschedule
                  </button>
                )}
                <button onClick={() => cancel(b)} disabled={busy === b.id} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50">
                  {busy === b.id ? "…" : "Cancel"}
                </button>
              </div>
            </div>

            {teacher && isEditing && (
              <div className="rounded-lg p-3 space-y-3" style={{ background: "color-mix(in srgb, var(--gold) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 20%, transparent)" }}>
                <div className="text-sm font-medium">New time for {names[b.studentId] ?? "this lesson"}</div>
                <input
                  type="datetime-local"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  className="bg-bordeaux-deep/40 border border-gold/25 rounded-lg px-3 py-2 text-sm text-cream w-full max-w-xs"
                />
                <p className="text-xs text-cream-dim">Times in {tz}. The student gets an email with the new time and a fresh calendar invite. The lesson hour isn&apos;t affected.</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => saveEdit(b)} disabled={busy === b.id} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
                    {busy === b.id ? "Saving…" : "Save & email student"}
                  </button>
                  <button onClick={() => setEditing(null)} disabled={busy === b.id} className="text-sm text-cream-dim hover:text-cream underline underline-offset-4">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
