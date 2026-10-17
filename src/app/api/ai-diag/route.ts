import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { EXAM_AI } from "@/lib/config";

// TEMPORÄRE Diagnose für die KI-Schreibkorrektur in Produktion. Gibt KEINEN
// Key-Wert preis — nur ob er ankommt + was die Anthropic-API antwortet.
// Wird nach der Fehlersuche wieder entfernt. Leicht per ?k= geschützt.
export const runtime = "nodejs";

export async function GET(req: Request) {
  const k = new URL(req.url).searchParams.get("k");
  if (k !== "diag-9f3x") return NextResponse.json({ error: "not found" }, { status: 404 });

  const key = process.env.ANTHROPIC_API_KEY || "";
  const info: Record<string, unknown> = {
    keyPresent: Boolean(key),
    keyLength: key.length,
    keyPrefix: key ? key.slice(0, 12) : null,
    keyHasWhitespace: /\s/.test(key),
    model: EXAM_AI.model,
  };
  if (!key) return NextResponse.json({ ...info, ok: false, reason: "ANTHROPIC_API_KEY fehlt in dieser Umgebung" });

  try {
    const a = new Anthropic();
    const r = await a.messages.create({ model: EXAM_AI.model, max_tokens: 10, messages: [{ role: "user", content: "hi" }] });
    return NextResponse.json({ ...info, ok: true, outputTokens: r.usage?.output_tokens ?? null });
  } catch (e) {
    const err = e as { status?: number; name?: string; message?: string };
    return NextResponse.json({ ...info, ok: false, status: err?.status ?? null, name: err?.name ?? null, message: String(err?.message || "").slice(0, 300) });
  }
}
