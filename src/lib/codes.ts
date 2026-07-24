"use client";

import { createClient } from "@/lib/supabase/client";

export type CodeScope = "full" | "vocab";
export type AccessCode = {
  code: string;
  scope: CodeScope;
  max_uses: number | null; // null = unbegrenzt (Community), 1 = Einzel
  used_count: number;
  active: boolean;
  expires_at: string | null;
  grant_days: number | null; // null = dauerhaft, sonst Trial-Tage (z. B. 14)
  note: string;
  created_at: string;
};

// Schüler: Code einlösen (sichere Server-Funktion).
export async function redeemCode(code: string): Promise<{ ok: boolean; scope?: string; error?: string; already?: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("redeem_code", { p_code: code });
  if (error) return { ok: false, error: error.message };
  return (data ?? { ok: false, error: "Unknown error" }) as { ok: boolean; scope?: string; error?: string; already?: boolean };
}

// ---- Lehrer-Verwaltung ----
export async function listCodes(): Promise<AccessCode[]> {
  const { data } = await createClient().from("access_codes").select("*").order("created_at", { ascending: false });
  return (data ?? []) as AccessCode[];
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne verwechselbare 0/O/1/I/L
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part(4)}-${part(4)}`;
}

// Erzeugt Codes. singleUse=true → Einzel-Codes (max_uses=1); false → Community (unbegrenzt).
// grantDays gesetzt → Trial-Code (Zugang läuft nach so vielen Tagen ab).
export async function createCodes(opts: { scope: CodeScope; count: number; singleUse: boolean; note?: string; grantDays?: number | null }): Promise<{ error?: string; codes: string[] }> {
  const supabase = createClient();
  const rows = Array.from({ length: Math.max(1, Math.min(200, opts.count)) }, () => ({
    code: randomCode(),
    scope: opts.scope,
    max_uses: opts.singleUse ? 1 : null,
    note: opts.note ?? "",
    grant_days: opts.grantDays ?? null,
  }));
  const { error } = await supabase.from("access_codes").insert(rows);
  return { error: error?.message, codes: rows.map((r) => r.code) };
}

export async function setCodeActive(code: string, active: boolean): Promise<{ error?: string }> {
  const { error } = await createClient().from("access_codes").update({ active }).eq("code", code);
  return { error: error?.message };
}

export async function deleteCode(code: string): Promise<{ error?: string }> {
  const { error } = await createClient().from("access_codes").delete().eq("code", code);
  return { error: error?.message };
}
