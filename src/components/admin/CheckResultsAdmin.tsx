"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CHECK_QUESTIONS } from "@/lib/grammarCheck";

// Schwachstellen aller Schüler auf einen Blick – gedacht für den Moment kurz
// vor einer 1-zu-1-Stunde: woran hakt es bei diesem Schüler gerade?

type Row = { user_id: string; unit_slug: string; correct: number; total: number; created_at: string };
type Topic = { unit: string; topic: string; level: string; correct: number; total: number };
type Student = { id: string; name: string; when: string; topics: Topic[] };

const META = new Map(CHECK_QUESTIONS.map((q) => [q.unit, q]));

export default function CheckResultsAdmin() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error: e } = await supabase
        .from("tr_check_results")
        .select("user_id, unit_slug, correct, total, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (e) { setError(e.message); setStudents([]); return; }
      const rows = (data ?? []) as Row[];

      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");
      const nameById = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string) || (p.email as string) || "Student"]));

      // Je Schüler nur den jüngsten Durchlauf: alles innerhalb einer Minute
      // nach seiner neuesten Zeile gehört zusammen.
      const byUser = new Map<string, Row[]>();
      for (const r of rows) {
        const list = byUser.get(r.user_id) ?? [];
        list.push(r);
        byUser.set(r.user_id, list);
      }

      const out: Student[] = [];
      for (const [id, list] of byUser) {
        const newest = new Date(list[0].created_at).getTime();
        const run = list.filter((r) => newest - new Date(r.created_at).getTime() < 60_000);
        const topics: Topic[] = run
          .map((r) => ({
            unit: r.unit_slug,
            topic: META.get(r.unit_slug)?.topic ?? r.unit_slug,
            level: META.get(r.unit_slug)?.level ?? "",
            correct: r.correct,
            total: r.total,
          }))
          .sort((a, b) => a.correct / a.total - b.correct / b.total);
        out.push({
          id,
          name: nameById.get(id) ?? "Student",
          when: new Date(list[0].created_at).toLocaleDateString(),
          topics,
        });
      }
      out.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(out);
    })();
  }, []);

  if (students === null) return <p className="text-sm text-cream-dim">Loading…</p>;

  if (error) {
    return (
      <div className="card p-5 space-y-2">
        <p className="font-semibold text-sm">The results table is not there yet.</p>
        <p className="text-sm text-cream-dim">
          Run <code>supabase/check-results.sql</code> once in the SQL editor, then this page fills itself.
        </p>
        <p className="text-xs text-cream-dim">({error})</p>
      </div>
    );
  }

  if (students.length === 0) {
    return <div className="card p-5 text-sm text-cream-dim">No student has taken the grammar check yet.</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream-dim">
        The most recent grammar check per student, weakest topic first. Click a topic to open the unit yourself.
      </p>

      {students.map((s) => {
        const weak = s.topics.filter((t) => t.correct < t.total);
        return (
          <div key={s.id} className="card p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-cream-dim">checked {s.when}</div>
            </div>

            {weak.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--green-accent)" }}>
                Everything clean — no weak spots in the check.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {weak.map((t) => (
                  <Link key={t.unit} href={`/training/${t.unit}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:opacity-80"
                    style={{
                      background: t.correct === 0
                        ? "color-mix(in srgb, var(--red-accent) 20%, transparent)"
                        : "color-mix(in srgb, var(--gold) 22%, transparent)",
                      color: "var(--cream)",
                    }}>
                    {t.topic} <span className="text-cream-dim font-normal">{t.correct}/{t.total}</span>
                  </Link>
                ))}
              </div>
            )}

            {s.topics.length > weak.length && (
              <p className="text-xs text-cream-dim">
                Solid: {s.topics.filter((t) => t.correct === t.total).map((t) => t.topic).join(" · ")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
