"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUnits, getMyProgress, type Unit, type UnitProgress } from "@/lib/training";
import { getAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/client";
import Paywall from "@/components/Paywall";
import Lena from "@/components/training/Lena";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export default function TrainingPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState<Record<string, UnitProgress>>({});
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) { setBlocked(true); setLoading(false); } return; }
      // Der Lehrer sieht alles – sonst könnte Marvin neue Einheiten nicht prüfen.
      // Wird zusammen mit dem Rest geladen, sonst blitzen die Schlösser kurz auf.
      const teacher = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        const { data } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
        return Boolean(data?.is_teacher);
      };

      const [u, p, t] = await Promise.all([getUnits(), getMyProgress(), teacher()]);
      if (cancelled) return;
      setUnits(u); setProgress(p); setIsTeacher(t); setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (blocked) return <Paywall title="Unlock the training course" />;

  const mastered = units.filter((u) => (progress[u.id]?.mastery ?? 0) >= 80).length;

  // Schritt für Schritt – aber nur INNERHALB eines Levels. So kann niemand die
  // Verbposition üben, bevor die Konjugation sitzt; ein B1-Schüler muss aber
  // nicht erst ganz A1 durcharbeiten, um an die Relativsätze zu kommen.
  // Angefangene Einheiten bleiben offen – was einmal auf war, wird nie wieder zu.
  const isLocked = (u: Unit) => {
    if (isTeacher || progress[u.id]) return false;
    const level = units.filter((x) => x.level === u.level);
    const firstOpen = level.findIndex((x) => (progress[x.id]?.mastery ?? 0) < 80);
    return firstOpen >= 0 && level.indexOf(u) > firstOpen;
  };
  const previousInLevel = (u: Unit) => {
    const level = units.filter((x) => x.level === u.level);
    return level[level.indexOf(u) - 1];
  };

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
                const locked = isLocked(u);
                const previous = previousInLevel(u);

                const body = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold leading-tight">{u.title}</div>
                      {done && <span className="shrink-0 w-6 h-6 grid place-items-center rounded-full text-xs" style={{ background: "var(--green-accent)", color: "#fff" }}>✓</span>}
                      {locked && <span className="shrink-0 text-base leading-none opacity-70">🔒</span>}
                    </div>
                    {u.subtitle && <p className="text-xs text-cream-dim line-clamp-2">{u.subtitle}</p>}
                    <div className="mt-auto pt-2">
                      {locked ? (
                        <p className="text-[11px] text-cream-dim">
                          Finish <b className="text-cream">{previous?.title}</b> first
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-[11px] text-cream-dim mb-1">
                            <span>{m === 0 ? "Not started" : done ? "Mastered" : "In progress"}</span>
                            <span className="text-gold-bright font-semibold">{m}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-bordeaux-deep/60">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${m}%`, background: done ? "var(--green-accent)" : "var(--gold-bright)" }} />
                          </div>
                        </>
                      )}
                    </div>
                  </>
                );

                if (locked) {
                  return (
                    <div key={u.id} className="card p-4 flex flex-col gap-2 opacity-55 cursor-not-allowed" aria-disabled>
                      {body}
                    </div>
                  );
                }
                return (
                  <Link key={u.id} href={`/training/${u.slug}`} className="card p-4 flex flex-col gap-2 transition hover:border-gold/50">
                    {body}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
