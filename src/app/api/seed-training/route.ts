import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { TRAINING_UNITS } from "@/lib/trainingSeed";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

async function requireTeacher() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: json({ error: "Not signed in" }, 401) };
  const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
  if (!profile?.is_teacher) return { error: json({ error: "Teacher only" }, 403) };
  return { ok: true as const };
}

// Übersicht der Videos – damit die Einheiten sicher auf eine echte Lektion
// zeigen, statt auf eine geratene Kennung.
export async function GET() {
  const gate = await requireTeacher();
  if ("error" in gate && gate.error) return gate.error;
  const { data } = await admin().from("lessons").select("id,title,level").order("sort_order");
  return json({ lessons: data ?? [] });
}

// Spielt die Trainings-Einheiten ein – als Daten über die Schnittstelle statt
// als SQL-Text. Nur der Lehrer darf das auslösen.
export async function POST() {
  const gate = await requireTeacher();
  if ("error" in gate && gate.error) return gate.error;

  const db = admin();
  const { data: lessons } = await db.from("lessons").select("id,title");
  const catalogue = lessons ?? [];

  // Verknüpfung zum Video: feste Kennung, sonst über den Titel suchen.
  const resolveLesson = (id: string | null, match?: string) => {
    if (id && catalogue.some((l) => l.id === id)) return catalogue.find((l) => l.id === id)!;
    if (match) {
      const m = match.toLowerCase();
      return catalogue.find((l) => (l.title ?? "").toLowerCase().includes(m)) ?? null;
    }
    return null;
  };

  const result: Record<string, unknown>[] = [];

  for (const u of TRAINING_UNITS) {
    const lesson = resolveLesson(u.lessonId, u.lessonMatch);

    // Einheit AKTUALISIEREN statt löschen: an tr_units hängt der Fortschritt
    // der Schüler, und der würde beim Löschen mitgehen.
    const { data: unit, error: unitErr } = await db
      .from("tr_units")
      .upsert(
        {
          slug: u.slug,
          title: u.title,
          subtitle: u.subtitle,
          level: u.level,
          lesson_id: lesson?.id ?? null,
          sort_order: u.sortOrder,
          theory: u.theory,
          is_published: true,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (unitErr || !unit) return json({ error: `unit ${u.slug}: ${unitErr?.message}` }, 500);

    // Aufgaben werden ersetzt (daran hängt nur die Antwort-Historie).
    await db.from("tr_exercises").delete().eq("unit_id", unit.id);

    const rows = u.exercises.map((e, i) => ({
      unit_id: unit.id,
      kind: e.kind,
      prompt: e.prompt,
      data: e.data,
      solution: e.solution,
      explanation: e.explanation,
      hint: e.hint ?? "",
      sort_order: i + 1,
    }));

    const { error: exErr } = await db.from("tr_exercises").insert(rows);
    if (exErr) return json({ error: `exercises ${u.slug}: ${exErr.message}` }, 500);

    result.push({ unit: u.slug, exercises: rows.length, lesson: lesson ? lesson.title : "— kein Video verknüpft" });
  }

  return json({ ok: true, seeded: result });
}
