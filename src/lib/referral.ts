"use client";

import { createClient } from "@/lib/supabase/client";

// Empfehlungs-/Provisions-Codes (Affiliate). Ein Code pro Influencer, gruppiert
// nach Partner. Der Empfehlungslink ist die Website mit ?ref=CODE. Der Code wird
// in einem Cookie gehalten und beim Checkout als Stripe client_reference_id
// mitgegeben – der Webhook verbucht dann die Zahlung auf den Code.

const REF_COOKIE = "gs_ref";
const VID_COOKIE = "gs_vid";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 Tage

// Codes bestehen aus Buchstaben/Ziffern/Bindestrich; alles andere ignorieren wir.
const CODE_RE = /^[A-Za-z0-9-]{3,32}$/;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
}

// Zufällige, anonyme Besucher-ID (nur zur Entdopplung der Besuchszählung).
function ensureVisitorId(): string {
  let vid = readCookie(VID_COOKIE);
  if (!vid) {
    vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    writeCookie(VID_COOKIE, vid);
  }
  return vid;
}

export function getRefCode(): string | null {
  // Last-Click: ein frischer ?ref-Parameter in der aktuellen URL gewinnt (der
  // Besucher kam gerade über diesen Influencer-Link). Sonst der gemerkte Cookie.
  // Der URL-Vorrang macht die Attribution zudem unabhängig von der
  // Effekt-Reihenfolge zwischen RefTracker (setzt Cookie) und RefLink (liest).
  if (typeof window !== "undefined") {
    const u = new URLSearchParams(window.location.search).get("ref");
    if (u && CODE_RE.test(u)) return u;
  }
  const c = readCookie(REF_COOKIE);
  return c && CODE_RE.test(c) ? c : null;
}

// Hängt den gespeicherten Empfehlungscode als client_reference_id an einen
// Stripe-Zahlungslink an (macht nichts, wenn kein Code vorliegt).
export function appendRef(url: string): string {
  const code = getRefCode();
  if (!code) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.get("client_reference_id")) u.searchParams.set("client_reference_id", code);
    return u.toString();
  } catch {
    return url;
  }
}

// Beim Laden der Seite: ?ref=CODE einlesen, Cookie setzen, Besuch zählen.
export function captureRefFromUrl(): void {
  if (typeof window === "undefined") return;
  const raw = new URLSearchParams(window.location.search).get("ref");
  if (!raw || !CODE_RE.test(raw)) return;
  writeCookie(REF_COOKIE, raw);
  const vid = ensureVisitorId();
  // Best effort – Fehler hier dürfen nie die Seite stören.
  try {
    fetch("/api/ref/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: raw, vid }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}

// ---- Lehrer-Verwaltung -----------------------------------------------------

export type ReferralStat = {
  code: string;
  partner: string;
  influencer: string;
  note: string;
  active: boolean;
  created_at: string;
  visits: number;
  customers: number;
  revenue_cents: number;
  currency: string | null;
};

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne verwechselbare 0/O/1/I/L
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part(4)}-${part(4)}`;
}

export async function listReferralStats(): Promise<ReferralStat[]> {
  const { data } = await createClient().rpc("referral_stats");
  return (data ?? []) as ReferralStat[];
}

// Legt einen Code an. Optionaler Wunsch-Code (z. B. Influencer-Name), sonst zufällig.
export async function createReferralCode(opts: {
  partner: string;
  influencer: string;
  note?: string;
  customCode?: string;
}): Promise<{ error?: string; code?: string }> {
  const supabase = createClient();
  const custom = (opts.customCode ?? "").trim().toUpperCase().replace(/\s+/g, "-");
  const code = custom && CODE_RE.test(custom) ? custom : randomCode();
  const { error } = await supabase.from("referral_codes").insert({
    code,
    partner: opts.partner.trim(),
    influencer: opts.influencer.trim(),
    note: opts.note?.trim() ?? "",
  });
  return { error: error?.message, code: error ? undefined : code };
}

export async function setReferralActive(code: string, active: boolean): Promise<{ error?: string }> {
  const { error } = await createClient().from("referral_codes").update({ active }).eq("code", code);
  return { error: error?.message };
}

export async function deleteReferralCode(code: string): Promise<{ error?: string }> {
  const { error } = await createClient().from("referral_codes").delete().eq("code", code);
  return { error: error?.message };
}
