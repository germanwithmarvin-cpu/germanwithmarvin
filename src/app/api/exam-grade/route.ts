import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { EXAM_AI } from "@/lib/config";

export const runtime = "nodejs";

// KI-Schreibkorrektur für den Prüfungstrainer. Bewertet freie Texte (A1–B2)
// wie ein Goethe/telc-Prüfer und gibt Punkte + konkretes Feedback. Tokenlimit
// mehrschichtig: günstiges Modell (Haiku) + Deckel pro Abgabe + Tageslimit pro
// Nutzer + globale Monats-Notbremse. Inserts laufen über die Service-Role.

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
const j = (body: unknown, status = 200) => NextResponse.json(body, { status });
const dayStartISO = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.toISOString(); };
const monthStartISO = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(); };

type Feedback = {
  score: number; max: number; band: string; summary: string;
  criteria: { name: string; score: number; max: number; note: string }[];
  corrections: { original: string; better: string; why: string }[];
};

export async function POST(req: Request) {
  // --- Auth ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return j({ error: "Not signed in" }, 401);

  // --- Zugang + Limit-Stufe bestimmen ---
  const { data: profile } = await supabase.from("profiles")
    .select("is_teacher, access_scope, access_expires_at").eq("id", user.id).maybeSingle();
  const { data: access } = await supabase.rpc("my_access");
  const isTeacher = Boolean(profile?.is_teacher);
  const hasFull = isTeacher || access === "full" ||
    (profile?.access_scope === "full" && (!profile?.access_expires_at || new Date(profile.access_expires_at as string) > new Date()));
  if (!hasFull) return j({ error: "Dieser Bereich ist Teil des Abos." }, 403);
  const isTrial = !isTeacher && profile?.access_scope === "full" && Boolean(profile?.access_expires_at)
    && new Date(profile!.access_expires_at as string) > new Date();
  const dailyLimit = isTeacher ? Infinity : isTrial ? EXAM_AI.dailyLimitTrial : EXAM_AI.dailyLimitPaid;

  const db = admin();

  // --- Tageslimit pro Nutzer ---
  let usedToday = 0;
  if (dailyLimit !== Infinity) {
    const { count } = await db.from("ai_usage").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("feature", "writing").gte("created_at", dayStartISO());
    usedToday = count ?? 0;
    if (usedToday >= dailyLimit) {
      return j({ error: "limit", message: `Tageslimit erreicht (${dailyLimit} KI-Korrekturen/Tag). Morgen geht's weiter.`, remaining: 0 }, 429);
    }
  }

  // --- Globale Monats-Notbremse ---
  const { data: monthRows } = await db.from("ai_usage").select("output_tokens").gte("created_at", monthStartISO());
  const monthTokens = (monthRows ?? []).reduce((s, r) => s + (Number(r.output_tokens) || 0), 0);
  if (monthTokens >= EXAM_AI.monthlyOutputTokenCap) {
    return j({ error: "capacity", message: "Die KI-Korrektur ist gerade ausgelastet. Bitte später erneut versuchen." }, 503);
  }

  // --- Eingabe ---
  const body = await req.json().catch(() => ({}));
  const level = String(body.level ?? "B1").slice(0, 4);
  const prompt = String(body.prompt ?? "").slice(0, 1200);
  const maxPoints = Math.max(1, Math.min(100, Number(body.maxPoints) || 20));
  let text = String(body.text ?? "").trim();
  if (text.length < 5) return j({ error: "empty", message: "Bitte schreib zuerst deinen Text." }, 400);
  const truncated = text.length > EXAM_AI.maxInputChars;
  if (truncated) text = text.slice(0, EXAM_AI.maxInputChars);
  const attemptId = body.attemptId ? String(body.attemptId) : null;
  const itemId = body.itemId ? String(body.itemId) : null;

  // --- KI-Aufruf ---
  const system = [
    `Du bist ein erfahrener, wohlwollender Prüfer für Deutsch als Fremdsprache (Goethe-Institut / telc) auf Niveau ${level}.`,
    `Bewerte den Schülertext zur gestellten Aufgabe fair und auf ${level}-Niveau. Sei konkret und ermutigend; schreibe das Feedback auf Deutsch, einfach und klar.`,
    `Bewertungskriterien: Inhalt/Aufgabenerfüllung, Kohärenz/Textaufbau, Wortschatz, Grammatik & Korrektheit.`,
    `Gib bis zu 6 konkrete Korrekturen (original → besser → kurze Begründung). Lob, was gut ist.`,
    `Antworte AUSSCHLIESSLICH mit gültigem JSON (keine Markdown-Zäune, kein Text davor/danach) in genau diesem Schema:`,
    `{"score":<int 0..${maxPoints}>,"max":${maxPoints},"band":"<kurze Einordnung, z.B. 'Gut – ${level} erreicht' oder 'Noch nicht ${level}'>","summary":"<2–3 Sätze>","criteria":[{"name":"Inhalt","score":<int>,"max":<int>,"note":"<kurz>"},{"name":"Kohärenz","score":<int>,"max":<int>,"note":"<kurz>"},{"name":"Wortschatz","score":<int>,"max":<int>,"note":"<kurz>"},{"name":"Grammatik","score":<int>,"max":<int>,"note":"<kurz>"}],"corrections":[{"original":"<Schülerstelle>","better":"<Korrektur>","why":"<kurz>"}]}`,
    `Die vier Kriterien-max müssen zusammen ${maxPoints} ergeben.`,
  ].join("\n");
  const userMsg = `AUFGABE (${level}):\n${prompt || "(keine Aufgabenbeschreibung übergeben)"}\n\nSCHÜLERTEXT:\n${text}`;

  let feedback: Feedback | null = null;
  let inTok = 0, outTok = 0;
  try {
    const anthropic = new Anthropic();
    const resp = await anthropic.messages.create({
      model: EXAM_AI.model,
      max_tokens: EXAM_AI.maxOutputTokens,
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: userMsg }],
    });
    inTok = resp.usage?.input_tokens ?? 0;
    outTok = resp.usage?.output_tokens ?? 0;
    const raw = resp.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("").trim();
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) feedback = JSON.parse(m[0]) as Feedback;
  } catch {
    return j({ error: "ai", message: "Die KI-Korrektur ist gerade nicht erreichbar. Bitte später erneut." }, 502);
  }
  if (!feedback || typeof feedback.score !== "number") {
    return j({ error: "parse", message: "Konnte das Feedback nicht auswerten. Bitte erneut versuchen." }, 502);
  }
  feedback.max = maxPoints;
  feedback.score = Math.max(0, Math.min(maxPoints, Math.round(feedback.score)));

  // --- Persistenz (Service-Role) ---
  await db.from("exam_writing").insert({
    attempt_id: attemptId, item_id: itemId, user_id: user.id, level, prompt, text,
    ai_score: feedback.score, ai_max: maxPoints, ai_feedback: feedback,
    model: EXAM_AI.model, input_tokens: inTok, output_tokens: outTok, status: "graded",
  });
  await db.from("ai_usage").insert({ user_id: user.id, feature: "writing", input_tokens: inTok, output_tokens: outTok });

  const remaining = dailyLimit === Infinity ? null : Math.max(0, dailyLimit - usedToday - 1);
  return j({ feedback, remaining, truncated });
}
