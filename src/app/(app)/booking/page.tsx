"use client";

import { useEffect, useState } from "react";
import { LESSON, lessonPriceLabel } from "@/lib/config";
import { getMySubscription, getMyCredits, startLessonCheckout, manageLessonSubscription, type LessonSubscription, type CreditInfo } from "@/lib/booking";
import { getMyBookings, getAllBookings, getStudentNames, getGoogleEvents, getMyRecurring, cancelRecurring, type Booking, type ExternalEvent, type Recurring } from "@/lib/schedule";
import { createClient } from "@/lib/supabase/client";
import AvailabilityEditor from "@/components/booking/AvailabilityEditor";
import BookingCalendar from "@/components/booking/BookingCalendar";
import LessonsList from "@/components/booking/LessonsList";
import LessonCalendar from "@/components/booking/LessonCalendar";
import WeekSchedule from "@/components/booking/WeekSchedule";

export default function BookingPage() {
  const [checkoutState, setCheckoutState] = useState<string | null>(null);
  const [sub, setSub] = useState<LessonSubscription | null>(null);
  const [credits, setCredits] = useState<CreditInfo>({ balance: 0, nextExpiry: null });
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(LESSON.minHours);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [extEvents, setExtEvents] = useState<ExternalEvent[]>([]);
  const [myRecurring, setMyRecurring] = useState<Recurring | null>(null);

  async function refresh() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let teacher = false;
    if (user) {
      const { data } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
      teacher = Boolean(data?.is_teacher);
    }
    setIsTeacher(teacher);
    const [s, c, b, rec] = await Promise.all([getMySubscription(), getMyCredits(), teacher ? getAllBookings() : getMyBookings(), teacher ? Promise.resolve(null) : getMyRecurring()]);
    setSub(s);
    setCredits(c);
    setBookings(b);
    setMyRecurring(rec);
    if (teacher) {
      if (b.length) setNames(await getStudentNames(b.map((x) => x.studentId)));
      const from = new Date(Date.now() - 7 * 86400e3).toISOString();
      const to = new Date(Date.now() + 42 * 86400e3).toISOString();
      getGoogleEvents(from, to).then(setExtEvents);
    }
    if (s && s.quantity >= LESSON.minHours) setHours(s.quantity);
    setLoading(false);
  }
  const [googleState, setGoogleState] = useState<string | null>(null);
  useEffect(() => {
    refresh();
    const q = new URLSearchParams(window.location.search);
    setCheckoutState(q.get("checkout"));
    setGoogleState(q.get("google"));
  }, []);

  // Nach erfolgreichem Checkout schreibt der Stripe-Webhook das Guthaben erst
  // ein paar Sekunden später gut – kurz nachpollen, damit es ohne Reload auftaucht.
  useEffect(() => {
    if (checkoutState !== "success") return;
    let n = 0;
    const iv = setInterval(() => {
      n += 1;
      refresh();
      if (n >= 5) clearInterval(iv);
    }, 2500);
    return () => clearInterval(iv);
  }, [checkoutState]);

  const active = sub && ["active", "past_due"].includes(sub.status);
  const nextRecurring = bookings
    .filter((x) => x.recurringId && x.status === "booked" && new Date(x.startsAt).getTime() > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  async function subscribe() {
    setBusy(true); setErr(null);
    const { url, error } = await startLessonCheckout(hours);
    if (error) { setErr(error); setBusy(false); return; }
    if (url) window.location.href = url;
  }

  async function changeHours(newHours: number) {
    setBusy(true); setErr(null);
    const { error } = await manageLessonSubscription("set_quantity", newHours);
    if (error) setErr(error);
    await refresh();
    setBusy(false);
  }

  async function toggleCancel() {
    setBusy(true); setErr(null);
    const { error } = await manageLessonSubscription(sub?.cancelAtPeriodEnd ? "resume" : "cancel");
    if (error) setErr(error);
    await refresh();
    setBusy(false);
  }

  async function cancelWeekly() {
    if (!confirm("Cancel your weekly time? Lessons already booked stay — cancel those individually if you want.")) return;
    setBusy(true); setErr(null);
    const { error } = await cancelRecurring();
    if (error) setErr(error);
    await refresh();
    setBusy(false);
  }

  const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "");
  const perHour = hours >= LESSON.discountThreshold ? LESSON.discountedPerHour : LESSON.pricePerHour;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">1-on-1 lessons 🗓️</h1>
        <p className="text-cream-dim mt-1">Choose a monthly plan of {LESSON.durationMin}-minute lessons and book your times with me.</p>
      </div>

      {checkoutState === "success" && (
        <p className="text-sm text-green-700 bg-green-accent/15 rounded-lg p-3">✓ Payment received — your lesson hours are being added. This can take a few seconds.</p>
      )}
      {checkoutState === "cancel" && (
        <p className="text-sm text-cream-dim bg-bordeaux-deep/40 rounded-lg p-3">Checkout cancelled — no charge was made.</p>
      )}
      {googleState === "connected" && (
        <p className="text-sm text-green-700 bg-green-accent/15 rounded-lg p-3">✓ Google Calendar connected.</p>
      )}
      {googleState === "error" && (
        <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">Google Calendar connection failed — please try again.</p>
      )}
      {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{err}</p>}

      {loading ? (
        <p className="text-cream-dim">Loading…</p>
      ) : isTeacher ? (
        // -------- Lehrer: Verfügbarkeit + alle Termine --------
        <>
          <AvailabilityEditor />
          <div className="space-y-3">
            <div className="font-semibold text-lg">Your schedule</div>
            <WeekSchedule bookings={bookings} names={names} external={extEvents} />
            <LessonsList bookings={bookings} onChange={refresh} teacher names={names} />
          </div>
        </>
      ) : (
        // -------- Schüler: Guthaben + Kalender (falls Abo ODER Guthaben) + Paket --------
        <>
          {myRecurring && (
            <div className="card p-5 flex flex-wrap items-center justify-between gap-3" style={{ borderLeft: "5px solid var(--gold)" }}>
              <div className="min-w-0">
                <div className="font-semibold flex items-center gap-2">🔁 Your weekly lesson</div>
                <p className="text-sm text-cream-dim mt-0.5">
                  {nextRecurring
                    ? <>Every <b className="text-cream">{new Date(nextRecurring.startsAt).toLocaleDateString(undefined, { weekday: "long" })}</b> at <b className="text-cream">{new Date(nextRecurring.startsAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</b> — booked automatically each period.</>
                    : "Your weekly time is set — lessons are booked when your plan renews."}
                </p>
              </div>
              <button onClick={cancelWeekly} disabled={busy} className="btn-outline px-4 py-2 text-sm shrink-0 disabled:opacity-50">Cancel weekly time</button>
            </div>
          )}
          {(active || credits.balance > 0) && (
            <>
              <div className="card study-card p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-sm text-cream-dim">Lesson hours available now</div>
                    <div className="text-5xl font-bold text-gold-bright leading-none mt-1">{credits.balance}</div>
                    {credits.nextExpiry && credits.balance > 0 && (
                      <div className="text-xs text-cream-dim mt-2">Use them by {fmtDate(credits.nextExpiry)} (hours expire after 5 weeks).</div>
                    )}
                  </div>
                  {active && sub && (
                    <div className="text-right text-sm">
                      <div className="text-cream-dim">Your plan</div>
                      <div className="font-semibold">{sub.quantity} h / month · {lessonPriceLabel(sub.quantity)}</div>
                      <div className="text-xs text-cream-dim mt-1">
                        {sub.cancelAtPeriodEnd ? <span className="text-red-700">Ends on {fmtDate(sub.currentPeriodEnd)}</span> : <>Renews on {fmtDate(sub.currentPeriodEnd)}</>}
                      </div>
                    </div>
                  )}
                </div>
                {!active && credits.balance > 0 && (
                  <div className="text-xs text-cream-dim mt-3">No active plan — you’re using leftover hours. Subscribe below to top up.</div>
                )}
              </div>

              <BookingCalendar canBook={credits.balance > 0} onBooked={refresh} />

              <div className="space-y-3">
                <div className="font-semibold">Your upcoming lessons</div>
                <LessonCalendar bookings={bookings} />
                <LessonsList bookings={bookings} onChange={refresh} />
              </div>

              {active && sub && (
                <>
                  <div className="card p-5 space-y-3">
                    <div className="font-semibold">Change your monthly hours</div>
                    <p className="text-xs text-cream-dim">Increases apply right away (charged pro-rata, hours added now). Decreases take effect next month — you keep your current hours.</p>
                    <HourStepper value={hours} onChange={setHours} />
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-cream-dim">{lessonPriceLabel(hours)}/mo{hours >= LESSON.discountThreshold && <span className="text-gold-bright"> · 5% off</span>}</div>
                      <button onClick={() => changeHours(hours)} disabled={busy || hours === sub.quantity} className="btn-gold px-5 py-2.5 text-sm disabled:opacity-40">
                        {hours > sub.quantity ? "Add hours now" : hours < sub.quantity ? "Lower from next month" : "No change"}
                      </button>
                    </div>
                  </div>
                  <button onClick={toggleCancel} disabled={busy} className="text-sm text-cream-dim hover:text-cream underline underline-offset-4">
                    {sub.cancelAtPeriodEnd ? "↩ Resume my plan" : "Cancel my plan (keeps access until period end)"}
                  </button>
                </>
              )}
            </>
          )}

          {!active && (
            <div className="card study-card p-6 space-y-4">
              <div className="font-semibold text-lg">{credits.balance > 0 ? "Get more lesson hours" : "Choose your monthly lesson plan"}</div>
              <HourStepper value={hours} onChange={setHours} />
              <div className="rounded-xl p-4" style={{ background: "color-mix(in srgb, var(--gold) 10%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 22%, transparent)" }}>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gold-bright">{lessonPriceLabel(hours)}</span>
                  <span className="text-cream-dim">/ month</span>
                </div>
                <div className="text-sm text-cream-dim mt-1">
                  {hours} lessons × {LESSON.durationMin} min · ${perHour.toFixed(2)} per lesson
                  {hours >= LESSON.discountThreshold ? <span className="text-gold-bright"> (5% off — 8+ hours)</span> : <span> · reach 8 h for 5% off</span>}
                </div>
              </div>
              <button onClick={subscribe} disabled={busy} className="btn-gold w-full py-3 disabled:opacity-50">
                {busy ? "Redirecting to checkout…" : `Subscribe — ${lessonPriceLabel(hours)}/mo`}
              </button>
              <p className="text-xs text-cream-dim text-center">Secure payment via Stripe · cancel anytime · monthly, renews automatically.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HourStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const dec = () => onChange(Math.max(LESSON.minHours, value - 1));
  const inc = () => onChange(Math.min(LESSON.maxHours, value + 1));
  return (
    <div className="flex items-center gap-4">
      <button onClick={dec} disabled={value <= LESSON.minHours} className="btn-outline w-11 h-11 grid place-items-center text-xl disabled:opacity-40" aria-label="Fewer hours">−</button>
      <div className="text-center min-w-[7rem]">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-xs text-cream-dim">hours / month</div>
      </div>
      <button onClick={inc} disabled={value >= LESSON.maxHours} className="btn-outline w-11 h-11 grid place-items-center text-xl disabled:opacity-40" aria-label="More hours">+</button>
    </div>
  );
}
