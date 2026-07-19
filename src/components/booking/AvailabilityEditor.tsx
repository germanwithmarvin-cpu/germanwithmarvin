"use client";

import { useEffect, useState } from "react";
import { getTeacherSettings, saveTeacherSettings, type TeacherSettings, type WeeklyWindow } from "@/lib/schedule";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TZ_CHOICES = ["Europe/Berlin", "Europe/London", "America/New_York", "America/Chicago", "America/Los_Angeles", "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Australia/Sydney", "UTC"];

type GoogleStatus = { connected: boolean; email: string | null; configured: boolean };

export default function AvailabilityEditor() {
  const [s, setS] = useState<TeacherSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [google, setGoogle] = useState<GoogleStatus | null>(null);

  useEffect(() => { getTeacherSettings().then(setS); }, []);
  useEffect(() => { fetch("/api/google/status").then((r) => r.json()).then(setGoogle).catch(() => {}); }, []);

  async function disconnectGoogle() {
    if (!confirm("Disconnect your Google Calendar? New bookings won’t create calendar events.")) return;
    await fetch("/api/google/status", { method: "DELETE" });
    setGoogle((g) => (g ? { ...g, connected: false, email: null } : g));
  }

  if (!s) return <div className="card p-5 text-cream-dim text-sm">Loading availability…</div>;

  const set = <K extends keyof TeacherSettings>(k: K, v: TeacherSettings[K]) => setS({ ...s, [k]: v });
  const setWindow = (i: number, patch: Partial<WeeklyWindow>) => set("weekly", s.weekly.map((w, j) => (j === i ? { ...w, ...patch } : w)));
  const addWindow = () => set("weekly", [...s.weekly, { weekday: 1, start: "09:00", end: "17:00" }]);
  const removeWindow = (i: number) => set("weekly", s.weekly.filter((_, j) => j !== i));

  async function save() {
    setSaving(true); setMsg(null);
    const { error } = await saveTeacherSettings(s!);
    setSaving(false);
    setMsg(error ? error : "✓ Saved");
  }

  return (
    <>
    {/* Google-Kalender */}
    <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="font-semibold flex items-center gap-2">📅 Google Calendar</div>
        <div className="text-sm text-cream-dim mt-0.5">
          {!google ? "Checking…"
            : !google.configured ? "Not set up yet (admin: add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)."
            : google.connected ? <>Connected{google.email ? <> as <span className="text-cream">{google.email}</span></> : ""} — busy times are blocked and bookings create a Meet link.</>
            : "Connect so busy times are hidden and each booking gets a Google Meet link."}
        </div>
      </div>
      {google?.configured && (google.connected
        ? <button onClick={disconnectGoogle} className="btn-outline px-4 py-2 text-sm shrink-0">Disconnect</button>
        : <a href="/api/google/connect" className="btn-gold px-4 py-2 text-sm shrink-0">Connect Google Calendar</a>)}
    </div>

    <div className="card p-5 space-y-4">
      <div className="font-semibold text-lg">Your availability</div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">Your timezone
          <select value={s.timezone} onChange={(e) => set("timezone", e.target.value)} className={inp}>
            {[...new Set([s.timezone, ...TZ_CHOICES])].map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </label>
        <label className="text-sm">Lesson length (min)
          <input type="number" min={15} max={120} value={s.slotMinutes} onChange={(e) => set("slotMinutes", +e.target.value)} className={inp} />
        </label>
        <label className="text-sm">Earliest booking (hours ahead)
          <input type="number" min={0} max={168} value={s.leadHours} onChange={(e) => set("leadHours", +e.target.value)} className={inp} />
        </label>
        <label className="text-sm">Bookable up to (days ahead)
          <input type="number" min={1} max={90} value={s.horizonDays} onChange={(e) => set("horizonDays", +e.target.value)} className={inp} />
        </label>
        <label className="text-sm">Gap between lessons (min)
          <input type="number" min={0} max={60} value={s.bufferMinutes} onChange={(e) => set("bufferMinutes", +e.target.value)} className={inp} />
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Weekly hours <span className="text-cream-dim">(in your timezone)</span></div>
          <button onClick={addWindow} className="btn-outline px-3 py-1.5 text-sm">+ Add window</button>
        </div>
        {s.weekly.length === 0 && <p className="text-sm text-cream-dim">No windows yet — add when you’re available for lessons.</p>}
        <div className="space-y-2">
          {s.weekly.map((w, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <select value={w.weekday} onChange={(e) => setWindow(i, { weekday: +e.target.value })} className={inp}>
                {WEEKDAYS.map((d, k) => <option key={k} value={k}>{d}</option>)}
              </select>
              <input type="time" value={w.start} onChange={(e) => setWindow(i, { start: e.target.value })} className={inp} />
              <span className="text-cream-dim">–</span>
              <input type="time" value={w.end} onChange={(e) => setWindow(i, { end: e.target.value })} className={inp} />
              <button onClick={() => removeWindow(i)} className="text-red-700 text-sm px-2">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-gold px-5 py-2.5 text-sm disabled:opacity-50">{saving ? "Saving…" : "Save availability"}</button>
        {msg && <span className={`text-sm ${msg.startsWith("✓") ? "text-green-700" : "text-red-700"}`}>{msg}</span>}
      </div>
    </div>
    </>
  );
}

const inp = "block w-full mt-1 rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm";
