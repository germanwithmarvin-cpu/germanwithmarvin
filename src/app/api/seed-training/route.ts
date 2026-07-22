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

// Spielt die Trainings-Einheiten ein – als Daten über die Schnittstelle statt
// als SQL-Text. Nur der Lehrer darf das auslösen.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
  if (!profile?.is_teacher) return json({ error: "Teacher only" }, 403);

  const db = admin();
  const result: Record<string, unknown>[] = [];

  for (const u of TRAINING_UNITS) {
    // Alte Fassung entfernen (Aufgaben hängen per Fremdschlüssel dran).
    await db.from("tr_units").delete().eq("slug", u.slug);

    const { data: unit, error: unitErr } = await db
      .from("tr_units")
      .insert({
        slug: u.slug,
        title: u.title,
        subtitle: u.subtitle,
        level: u.level,
        lesson_id: u.lessonId,
        sort_order: u.sortOrder,
        theory: u.theory,
        is_published: true,
      })
      .select("id")
      .single();

    if (unitErr || !unit) return json({ error: `unit ${u.slug}: ${unitErr?.message}` }, 500);

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

    result.push({ unit: u.slug, exercises: rows.length });
  }

  return json({ ok: true, seeded: result });
}
