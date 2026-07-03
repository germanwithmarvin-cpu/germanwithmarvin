"use client";

import { useEffect, useMemo, useState } from "react";
import { getSettings, getTakenSlots, createBooking, type TeacherSettings } from "@/lib/booking";
import { BOOKING_PRICE_EUR } from "@/lib/config";

const lessonTypes = [
  { id: "single", label: "1-on-1 lesson", price: `€${BOOKING_PRICE_EUR}`, note: "50 min · live 1-on-1 with Marvin" },
];

// Baut ein Datum aus Tag + "HH:MM".
function combine(day: Date, slot: string): Date {
  const [h, m] = slot.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

export default function BookingPage() {
  const [settings, setSettings] = useState<TeacherSettings | null>(null);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [type, setType] = useState(lessonTypes[0]);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 21);
    Promise.all([getSettings(), getTakenSlots(from, to)]).then(([s, t]) => {
      setSettings(s);
      setTaken(t);
    });
  }, []);

  // Die nächsten verfügbaren Tage (nur erlaubte Wochentage).
  const days = useMemo(() => {
    if (!settings) return [];
    const out: Date[] = [];
    for (let i = 1; i <= 21 && out.length < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (settings.weekdays.includes(d.getDay())) out.push(d);
    }
    return out;
  }, [settings]);

  async function confirm() {
    if (!day || !slot || !settings) return;
    setSaving(true);
    setError(null);
    const startsAt = combine(day, slot);
    const { error } = await createBooking(type.label, startsAt, settings.session_minutes);
    setSaving(false);
    if (error) { setError(error); return; }
    setTaken((prev) => new Set(prev).add(startsAt.toISOString()));
    setDone(true);
  }

  if (done && day && slot) {
    return (
      <div className="card p-8 text-center space-y-3">
        <div className="text-4xl">📅</div>
        <h1 className="text-xl font-bold">Lesson requested!</h1>
        <p className="text-cream-dim">
          {type.label} on {day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at {slot}.
        </p>
        <p className="text-xs text-cream-dim">
          Marvin has been notified and will confirm your lesson. You can see it under “My bookings” below.
        </p>
        <button onClick={() => { setDone(false); setDay(null); setSlot(null); }} className="btn-outline px-5 py-2.5">
          Book another lesson
        </button>
      </div>
    );
  }

  if (!settings) return <p className="text-sm text-cream-dim">Loading availability…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Book a lesson</h1>

      <div className="card p-5 space-y-3">
        <label className="text-sm text-cream-dim">Lesson type</label>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {lessonTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t)}
              className={`text-left p-4 rounded-lg border transition flex flex-col ${
                type.id === t.id ? "border-gold bg-gold/15" : "border-gold/25 hover:border-gold/50"
              }`}
            >
              <div className="font-medium text-sm">{t.label}</div>
              <div className="text-gold-bright text-lg font-semibold mt-0.5">{t.price}</div>
              <div className="text-xs text-cream-dim mt-1">{t.note}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <label className="text-sm text-cream-dim">Pick a day</label>
        {days.length === 0 ? (
          <p className="text-sm text-cream-dim">No available days right now — please check back later.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => {
              const active = day?.toDateString() === d.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => { setDay(d); setSlot(null); }}
                  className={`shrink-0 px-3 py-2 rounded-lg border text-center transition ${
                    active ? "border-gold bg-gold/15" : "border-gold/25 hover:border-gold/50"
                  }`}
                >
                  <div className="text-xs text-cream-dim">{d.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                  <div className="font-semibold">{d.getDate()}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {day && (
        <div className="card p-5 space-y-3">
          <label className="text-sm text-cream-dim">Pick a time</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {settings.slots.map((s) => {
              const isTaken = taken.has(combine(day, s).toISOString());
              return (
                <button
                  key={s}
                  disabled={isTaken}
                  onClick={() => setSlot(s)}
                  className={`px-2 py-2 rounded-lg border text-sm transition ${
                    isTaken
                      ? "border-gold/10 text-cream-dim/40 line-through cursor-not-allowed"
                      : slot === s
                      ? "border-gold bg-gold/15"
                      : "border-gold/25 hover:border-gold/50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-cream-dim">Greyed-out times are already booked.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-300 bg-red-accent/15 rounded-lg p-3">{error}</p>}

      <button onClick={confirm} disabled={!day || !slot || saving} className="btn-gold px-6 py-3 w-full disabled:opacity-40">
        {saving ? "Booking…" : type.price === "free" ? "Request lesson" : `Book & pay (${type.price})`}
      </button>
    </div>
  );
}
