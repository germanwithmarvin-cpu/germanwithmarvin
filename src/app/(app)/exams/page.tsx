"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPapers, type ExamPaper } from "@/lib/exams";
import { getAccess, type Access } from "@/lib/access";
import { isTrialAccess } from "@/lib/trialLimits";
import Paywall from "@/components/Paywall";

// Übersicht Prüfungstrainer. Zahlende sehen alle veröffentlichten Prüfungen;
// Trial-Nutzer nur die als „Beispiel" markierten (Häppchen) — der Rest ist
// gesperrt (→ /pricing). Sprechen läuft über die 1:1-Stunden (Funnel).

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export default function ExamsPage() {
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPapers(), getAccess()]).then(([p, a]) => {
      setPapers(p.filter((x) => x.isPublished));
      setAccess(a);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-cream-dim">Loading…</p>;
  if (!access || access.tier !== "full") return <Paywall title="Unlock the exam trainer" />;

  const trial = isTrialAccess(access);

  return (
    <div className="space-y-7 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Exam trainer 📝</h1>
        <p className="text-cream-dim mt-1">
          Full mock exams in the real Goethe / telc format — Reading, Listening and Writing.
          Reading &amp; Listening are graded instantly; your writing gets AI feedback on the spot.
        </p>
      </div>

      {trial && (
        <div className="card p-4 text-sm" style={{ borderLeft: "4px solid var(--gold)" }}>
          You’re on the free trial — try the <b className="text-cream">sample exam</b> below.
          <Link href="/pricing" className="text-gold-bright underline underline-offset-2 ml-1">Unlock all exams →</Link>
        </div>
      )}

      {papers.length === 0 && (
        <p className="text-sm text-cream-dim">No exams published yet — check back soon.</p>
      )}

      {LEVELS.map((lv) => {
        const group = papers.filter((p) => p.level === lv);
        if (group.length === 0) return null;
        return (
          <div key={lv} className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wide text-gold-bright">Level {lv}</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {group.map((p) => {
                const locked = trial && !p.isSample;
                return (
                  <div key={p.id} className="card p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold">{p.title}</div>
                      {p.isSample && <span className="text-[10px] font-bold uppercase bg-gold/20 text-gold-bright px-2 py-0.5 rounded-full shrink-0">Sample</span>}
                    </div>
                    <div className="text-sm text-cream-dim mt-0.5 flex-1">{p.subtitle}</div>
                    {locked ? (
                      <Link href="/pricing" className="btn-outline mt-3 py-2 text-sm text-center">🔒 Unlock with a plan</Link>
                    ) : (
                      <Link href={`/exams/${p.id}`} className="btn-gold mt-3 py-2 text-sm text-center">Start exam →</Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="card p-4 text-sm" style={{ borderLeft: "4px solid var(--bordeaux)" }}>
        <b className="text-cream">Speaking (Sprechen)?</b> That part is best with a real person.
        Practise it live in a <Link href="/booking" className="text-gold-bright underline underline-offset-2">1-on-1 lesson</Link> with Marvin.
      </div>
    </div>
  );
}
