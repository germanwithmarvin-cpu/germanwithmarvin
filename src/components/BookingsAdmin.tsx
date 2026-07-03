"use client";

import { useEffect, useState } from "react";
import { getAllBookings, setBookingStatus, getSettings, saveSettings, type Booking, type TeacherSettings } from "@/lib/booking";

type Row = Booking & { student?: string };

const WEEKDAYS = [
  { i: 1, label: "Mon" }, { i: 2, label: "Tue" }, { i: 3, label: "Wed" },
  { i: 4, label: "Thu" }, { i: 5, label: "Fri" }, { i: 6, label: "Sat" }, { i: 0, label: "Sun" },
];

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Row[]>([]);
  const [settings, setSettings] = useState<TeacherSettings | null>(null);
  const [slotsText, setSlotsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState("");

  async function refresh() {
    const [b, s] = await Promise.all([getAllBookings(), getSettings()]);
    setBookings(b);
    setSettings(s);
    setSlotsText(s.slots.join(", "));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id: string, status: string) {
    await setBookingStatus(id, status);
    refresh();
  }

  function toggleWeekday(i: number) {
    if (!settings) return;
    const has = settings.weekdays.includes(i);
    setSettings({ ...settings, weekdays: has ? settings.weekdays.filter((d) => d !== i) : [...settings.weekdays, i].sort() });
  }

  async function saveAvail() {
    if (!settings) return;
    const slots = slotsText.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await saveSettings({ ...settings, slots });
    setSavedMsg(error ? `Error: ${error}` : "Saved ✓");
    setTimeout(() => setSavedMsg(""), 2500);
    refresh();
  }

  if (loading || !settings) return <p className="text-sm text-cream-dim">Loading…</p>;

  const upcoming = bookings.filter((b) => new Date(b.starts_at) >= new Date(Date.now() - 3600_000));

  return (
    <div className="space-y-8">
      {/* Verfügbarkeit */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold">Your availability</h3>
        <div>
          <label className="block text-sm text-cream-dim mb-2">Available days</label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                key={d.i}
                onClick={() => toggleWeekday(d.i)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  settings.weekdays.includes(d.i) ? "border-gold bg-gold/15" : "border-gold/25 hover:border-gold/50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-[1fr_140px] gap-3">
          <div>
            <label className="block text-sm text-cream-dim mb-1">Time slots (comma-separated, 24h)</label>
            <input
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              placeholder="09:00, 10:00, 14:00"
              className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-cream-dim mb-1">Minutes / lesson</label>
            <input
              type="number"
              value={settings.session_minutes}
              onChange={(e) => setSettings({ ...settings, session_minutes: Number(e.target.value) })}
              className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveAvail} className="btn-gold px-5 py-2">Save availability</button>
          {savedMsg && <span className="text-sm text-green-300">{savedMsg}</span>}
        </div>
      </div>

      {/* Termine */}
      <div className="space-y-3">
        <h3 className="font-semibold">Upcoming lessons</h3>
        {upcoming.length === 0 && <p className="text-sm text-cream-dim">No upcoming bookings yet.</p>}
        {upcoming.map((b) => (
          <div key={b.id} className="card p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{b.student} · <span className="text-cream-dim font-normal">{b.lesson_type}</span></div>
              <div className="text-xs text-cream-dim">
                {new Date(b.starts_at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {b.duration_min} min
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                b.status === "confirmed" ? "bg-green-400/20 text-green-300" : b.status === "cancelled" ? "bg-red-accent/20 text-red-300" : "bg-gold/20 text-gold-bright"
              }`}>{b.status}</span>
              {b.status !== "confirmed" && b.status !== "cancelled" && (
                <button onClick={() => changeStatus(b.id, "confirmed")} className="btn-gold px-3 py-1.5 text-sm">Confirm</button>
              )}
              {b.status !== "cancelled" && (
                <button onClick={() => changeStatus(b.id, "cancelled")} className="btn-outline px-3 py-1.5 text-sm text-red-300">Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-cream-dim">
        🔗 Google Calendar sync will be connected once the app is online — bookings will then be added to your calendar automatically.
      </p>
    </div>
  );
}
