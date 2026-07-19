"use client";

import { useEffect, useState } from "react";
import { LESSON, lessonPriceLabel } from "@/lib/config";
import { getMySubscription, getMyCredits, startLessonCheckout, manageLessonSubscription, type LessonSubscription, type CreditInfo } from "@/lib/booking";

export default function BookingPage() {
  const [checkoutState, setCheckoutState] = useState<string | null>(null);
  const [sub, setSub] = useState<LessonSubscription | null>(null);
  const [credits, setCredits] = useState<CreditInfo>({ balance: 0, nextExpiry: null });
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(LESSON.minHours);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const [s, c] = await Promise.all([getMySubscription(), getMyCredits()]);
    setSub(s);
    setCredits(c);
    if (s && s.quantity >= LESSON.minHours) setHours(s.quantity);
    setLoading(false);
  }
  useEffect(() => {
    refresh();
    setCheckoutState(new URLSearchParams(window.location.search).get("checkout"));
  }, []);

  const active = sub && ["active", "past_due"].includes(sub.status);

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
      {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{err}</p>}

      {loading ? (
        <p className="text-cream-dim">Loading…</p>
      ) : active ? (
        // -------- Aktives Abo: Guthaben + Verwaltung --------
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
              <div className="text-right text-sm">
                <div className="text-cream-dim">Your plan</div>
                <div className="font-semibold">{sub!.quantity} h / month · {lessonPriceLabel(sub!.quantity)}</div>
                <div className="text-xs text-cream-dim mt-1">
                  {sub!.cancelAtPeriodEnd ? <span className="text-red-700">Ends on {fmtDate(sub!.currentPeriodEnd)}</span> : <>Renews on {fmtDate(sub!.currentPeriodEnd)}</>}
                </div>
              </div>
            </div>
          </div>

          {/* Kalender folgt in Phase 2 */}
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "color-mix(in srgb, var(--gold) 12%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 25%, transparent)" }}>
            📅 <span className="text-cream font-medium">Booking calendar is coming next.</span> <span className="text-cream-dim">For now your monthly hours are secured — soon you’ll pick exact times here.</span>
          </div>

          {/* Stundenzahl ändern */}
          <div className="card p-5 space-y-3">
            <div className="font-semibold">Change your monthly hours</div>
            <p className="text-xs text-cream-dim">Increases apply right away (charged pro-rata, hours added now). Decreases take effect next month — you keep your current hours.</p>
            <HourStepper value={hours} onChange={setHours} />
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-cream-dim">{lessonPriceLabel(hours)}/mo{hours >= LESSON.discountThreshold && <span className="text-gold-bright"> · 5% off</span>}</div>
              <button onClick={() => changeHours(hours)} disabled={busy || hours === sub!.quantity} className="btn-gold px-5 py-2.5 text-sm disabled:opacity-40">
                {hours > sub!.quantity ? "Add hours now" : hours < sub!.quantity ? "Lower from next month" : "No change"}
              </button>
            </div>
          </div>

          <button onClick={toggleCancel} disabled={busy} className="text-sm text-cream-dim hover:text-cream underline underline-offset-4">
            {sub!.cancelAtPeriodEnd ? "↩ Resume my plan" : "Cancel my plan (keeps access until period end)"}
          </button>
        </>
      ) : (
        // -------- Kein Abo: Paket wählen --------
        <>
          <div className="card study-card p-6 space-y-4">
            <div className="font-semibold text-lg">Choose your monthly lesson plan</div>
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

          <ul className="text-sm text-cream-dim space-y-1.5">
            <li>✓ {LESSON.durationMin}-minute private lessons, one-on-one with me</li>
            <li>✓ Book your own times (calendar coming very soon)</li>
            <li>✓ Free cancellation up to {LESSON.cancelHours} h before a lesson</li>
            <li>✓ Unused hours stay valid for 5 weeks</li>
          </ul>
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
