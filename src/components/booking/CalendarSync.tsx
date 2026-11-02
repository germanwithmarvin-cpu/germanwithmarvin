"use client";

import { useState } from "react";

type Item = {
  bookingId: string;
  studentName: string | null;
  email: string | null;
  dbStart: string;
  dbEnd: string;
  kind: "moved" | "gone" | "collision" | "ok" | "error";
  googleStart?: string;
  googleEnd?: string;
  mailed?: boolean;
  message?: string;
};

// Lehrer-Werkzeug: im Google-Kalender von Hand verschobene Stunden auf die
// Plattform übernehmen und die Schüler per Mail informieren. Zweistufig –
// erst Vorschau (ändert nichts), dann bewusst „Übernehmen & E-Mail senden".
export default function CalendarSync({ onChange }: { onChange?: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false); // schon einmal geprüft?
  const [items, setItems] = useState<Item[]>([]);
  const [tz, setTz] = useState("Europe/Berlin");
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const fmt = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
    } catch { return new Date(iso).toUTCString(); }
  };

  const moved = items.filter((i) => i.kind === "moved");
  const gone = items.filter((i) => i.kind === "gone");
  const collisions = items.filter((i) => i.kind === "collision");

  async function check() {
    setBusy(true); setErr(null); setDone(null);
    try {
      const res = await fetch("/api/lesson/calendar-sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "preview" }) });
      const j = await res.json();
      if (!res.ok) { setErr(j.error ?? "Could not check the calendar."); setBusy(false); return; }
      if (j.connected === false) { setErr("Connect your Google Calendar first (below)."); setBusy(false); return; }
      setTz(j.timezone ?? "Europe/Berlin");
      const list = (j.items ?? []) as Item[];
      setItems(list);
      setSel(Object.fromEntries(list.filter((i) => i.kind === "moved").map((i) => [i.bookingId, true])));
      setChecked(true);
    } catch { setErr("Could not check the calendar."); }
    setBusy(false);
  }

  async function apply() {
    const ids = moved.filter((i) => sel[i.bookingId]).map((i) => i.bookingId);
    if (ids.length === 0) return;
    const who = moved.filter((i) => ids.includes(i.bookingId)).map((i) => i.studentName || "a student");
    if (!confirm(`Update ${ids.length} lesson${ids.length > 1 ? "s" : ""} to the new time and email ${who.join(", ")}?`)) return;
    setBusy(true); setErr(null); setDone(null);
    try {
      const res = await fetch("/api/lesson/calendar-sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "apply", apply: ids }) });
      const j = await res.json();
      if (!res.ok) { setErr(j.error ?? "Could not apply the changes."); setBusy(false); return; }
      const applied = (j.items ?? []) as Item[];
      const okCount = applied.filter((i) => i.kind === "moved").length;
      const mailCount = applied.filter((i) => i.mailed).length;
      setDone(`Updated ${okCount} lesson${okCount > 1 ? "s" : ""} · emailed ${mailCount} student${mailCount === 1 ? "" : "s"}.`);
      // Angewandte raus aus der Liste.
      setItems((prev) => prev.filter((i) => !ids.includes(i.bookingId)));
      onChange?.();
    } catch { setErr("Could not apply the changes."); }
    setBusy(false);
  }

  return (
    <div className="card p-5 space-y-3">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 text-left">
        <span className="font-semibold">🔄 Sync changes from Google Calendar</span>
        <span className="text-cream-dim text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-3">
          <p className="text-xs text-cream-dim">
            Moved a lesson in your Google Calendar? This finds those changes and updates the lesson on the platform, then emails the student the new time (with a fresh calendar invite). Nothing is sent until you confirm.
          </p>

          <button onClick={check} disabled={busy} className="btn-outline px-4 py-2 text-sm disabled:opacity-50">
            {busy ? "Checking…" : checked ? "Check again" : "Check for changes"}
          </button>

          {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{err}</p>}
          {done && <p className="text-sm text-green-700 bg-green-accent/15 rounded-lg p-3">✓ {done}</p>}

          {checked && !busy && moved.length === 0 && gone.length === 0 && collisions.length === 0 && !done && (
            <p className="text-sm text-cream-dim">Everything is in sync — no moved lessons found.</p>
          )}

          {moved.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Moved lessons</div>
              {moved.map((i) => (
                <label key={i.bookingId} className="flex items-start gap-3 rounded-lg p-3 cursor-pointer" style={{ background: "color-mix(in srgb, var(--gold) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 20%, transparent)" }}>
                  <input type="checkbox" checked={!!sel[i.bookingId]} onChange={(e) => setSel((s) => ({ ...s, [i.bookingId]: e.target.checked }))} className="mt-1" />
                  <div className="min-w-0 text-sm">
                    <div className="font-semibold">{i.studentName || "Student"}</div>
                    <div className="text-cream-dim">
                      <span className="line-through">{fmt(i.dbStart)}</span>
                      <span className="mx-1.5 text-gold-bright">→</span>
                      <span className="text-cream">{fmt(i.googleStart)}</span>
                    </div>
                  </div>
                </label>
              ))}
              <button onClick={apply} disabled={busy || moved.filter((i) => sel[i.bookingId]).length === 0} className="btn-gold px-5 py-2.5 text-sm disabled:opacity-40">
                {busy ? "Working…" : `Apply & email student${moved.filter((i) => sel[i.bookingId]).length === 1 ? "" : "s"} (${moved.filter((i) => sel[i.bookingId]).length})`}
              </button>
            </div>
          )}

          {collisions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-700">Moved onto a time that clashes</div>
              <p className="text-xs text-cream-dim">In Google these were moved onto a slot that overlaps another booked lesson, so they weren&apos;t applied. Fix the overlap in your Google Calendar (or cancel one lesson), then check again.</p>
              {collisions.map((i) => (
                <div key={i.bookingId} className="text-sm rounded-lg p-3" style={{ background: "color-mix(in srgb, var(--red-accent) 10%, var(--surface))", border: "1px solid color-mix(in srgb, var(--red-accent) 25%, transparent)" }}>
                  <span className="font-semibold">{i.studentName || "Student"}</span>
                  <span className="text-cream-dim"> · <span className="line-through">{fmt(i.dbStart)}</span> → {fmt(i.googleStart)}</span>
                </div>
              ))}
            </div>
          )}

          {gone.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-700">Deleted in Google Calendar</div>
              <p className="text-xs text-cream-dim">These events are gone from Google but still booked on the platform. To cancel one and return the student&apos;s hour, use the ✕ next to it in your lesson list below.</p>
              {gone.map((i) => (
                <div key={i.bookingId} className="text-sm rounded-lg p-3" style={{ background: "color-mix(in srgb, var(--red-accent) 10%, var(--surface))", border: "1px solid color-mix(in srgb, var(--red-accent) 25%, transparent)" }}>
                  <span className="font-semibold">{i.studentName || "Student"}</span>
                  <span className="text-cream-dim"> · {fmt(i.dbStart)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
