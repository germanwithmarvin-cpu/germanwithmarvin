"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUnits, getMyProgress, type Unit, type UnitProgress } from "@/lib/training";
import { getAccess } from "@/lib/access";
import Paywall from "@/components/Paywall";
import Lena from "@/components/training/Lena";
import { CHECK_QUESTIONS } from "@/lib/grammarCheck";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export default function TrainingPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState<Record<string, UnitProgress>>({});
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) { setBlocked(true); setLoading(false); } return; }
      const [u, p] = await Promise.all([getUnits(), getMyProgress()]);
      if (cancelled) return;
      setUnits(u); setProgress(p); setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (blocked) return <Paywall title="Unlock the training course" />;

  const mastered = units.filter((u) => (progress[u.id]?.mastery ?? 0) >= 80).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0 hidden sm:block"><Lena mood="wave" size={150} /></div>
          <div>
            <h1 className="text-2xl font-bold">Training 🎓</h1>
            <p className="text-cream-dim text-sm mt-1">
              Hi, I&apos;m <b className="text-cream">Lena</b> — I&apos;m learning along with you. Read the rule,
              practise it, and whenever you slip I&apos;ll tell you exactly why.
            </p>
          </div>
        </div>
        {units.length > 0 && (
          <div className="card px-4 py-2.5">
            <div className="text-2xl font-bold text-gold-bright leading-none">{mastered}/{units.length}</div>
            <div className="text-[11px] text-cream-dim mt-0.5">units mastered</div>
          </div>
        )}
      </div>

      {/* Check und freies Training stehen bewusst vor den Einheiten: wer nicht
          weiss, wo es hakt, faengt sonst bei Einheit 1 an, obwohl die sitzt. */}
      {!loading && units.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/check" className="card p-5 flex items-start gap-4 transition hover:border-gold/50"
            style={{ borderLeft: "5px solid var(--gold)" }}>
            <div className="text-3xl shrink-0">🧭</div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">Not sure where to start?</div>
              <p className="text-sm text-cream-dim mt-0.5">
                The grammar check — {CHECK_QUESTIONS.length} questions, about {Math.round(CHECK_QUESTIONS.length / 4.5)} min. It finds
                the topics that are not sitting yet and sends you to the right unit.
              </p>
            </div>
          </Link>
          <Link href="/training/mixed" className="card p-5 flex items-start gap-4 transition hover:border-gold/50"
            style={{ borderLeft: "5px solid var(--bordeaux)" }}>
            <div className="text-3xl shrink-0">🎲</div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">Already know the basics?</div>
              <p className="text-sm text-cream-dim mt-0.5">
                Free practice mixes questions across your topics — harder than one block at a time,
                and that is exactly why it sticks. Filter by level or weak spots.
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Reife-Tests: bin ich bereit fuers naechste Level? (Filter des Checks) */}
      {!loading && units.length > 0 && (
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] mb-2" style={{ color: "var(--bordeaux)" }}>
            Am I ready to level up?
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {([["a2", "A2"], ["b1", "B1"], ["b2", "B2"]] as const).map(([slug, lvl]) => (
              <Link key={slug} href={`/check?for=${slug}`}
                className="card p-4 flex items-center gap-3 transition hover:border-gold/50">
                <span className="grid place-items-center rounded-lg px-2.5 py-1 text-sm font-extrabold"
                  style={{ background: "linear-gradient(160deg, var(--gold-bright), var(--gold))", color: "#3b2116" }}>{lvl}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">Am I ready for {lvl}?</div>
                  <p className="text-[11px] text-cream-dim">A quick check of the topics you need first.</p>
                </div>
                <span className="text-gold-bright shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-cream-dim">Loading…</p>}
      {!loading && units.length === 0 && (
        <div className="card p-6 text-cream-dim">No units yet — they are on the way.</div>
      )}

      {LEVELS.map((lv) => {
        const items = units.filter((u) => u.level === lv);
        if (items.length === 0) return null;
        return (
          <section key={lv}>
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-lg px-2.5 py-1 text-sm font-extrabold" style={{ background: "linear-gradient(160deg, var(--gold-bright), var(--gold))", color: "#3b2116" }}>{lv}</span>
              <span className="text-xs text-cream-dim">{items.length} {items.length === 1 ? "unit" : "units"}</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--gold) 40%, transparent), transparent)" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((u) => {
                const m = progress[u.id]?.mastery ?? 0;
                const done = m >= 80;

                const body = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold leading-tight">{u.title}</div>
                      {done && <span className="shrink-0 w-6 h-6 grid place-items-center rounded-full text-xs" style={{ background: "var(--green-accent)", color: "#fff" }}>✓</span>}
                    </div>
                    {u.subtitle && <p className="text-xs text-cream-dim line-clamp-2">{u.subtitle}</p>}
                    <div className="mt-auto pt-2">
                      <div className="flex items-center justify-between text-[11px] text-cream-dim mb-1">
                        <span>{m === 0 ? "Not started" : done ? "Mastered" : "In progress"}</span>
                        <span className="text-gold-bright font-semibold">{m}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bordeaux-deep/60">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${m}%`, background: done ? "var(--green-accent)" : "var(--gold-bright)" }} />
                      </div>
                    </div>
                  </>
                );

                // Jede Einheit hat einen Intensiv-Modus – die Karte trägt den
                // Einstieg direkt hier, sonst findet ihn niemand.
                return (
                  <div key={u.id} className="card p-4 flex flex-col gap-2 transition hover:border-gold/50">
                    <Link href={`/training/${u.slug}`} className="flex flex-col gap-2 flex-1">{body}</Link>
                    <Link href={`/training/${u.slug}/drill`}
                      className="mt-1 pt-2.5 flex items-center gap-1.5 text-xs font-bold transition hover:opacity-80"
                      style={{ borderTop: "1px solid color-mix(in srgb, var(--gold) 22%, transparent)", color: "var(--bordeaux)" }}>
                      🔥 Intensive drill <span className="text-gold-bright">→</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
