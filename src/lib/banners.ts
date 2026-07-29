"use client";

import { createClient } from "@/lib/supabase/client";

export type BannerTone = "info" | "success" | "warning";
export type Banner = {
  id: string;
  targetUserId: string | null; // null = alle Schüler
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: BannerTone;
  active: boolean;
};

function fromRow(r: Record<string, unknown>): Banner {
  return {
    id: r.id as string,
    targetUserId: (r.target_user_id as string) ?? null,
    message: (r.message as string) ?? "",
    ctaLabel: (r.cta_label as string) ?? null,
    ctaHref: (r.cta_href as string) ?? null,
    tone: ((r.tone as string) ?? "info") as BannerTone,
    active: Boolean(r.active),
  };
}

// Schüler: alle für mich sichtbaren aktiven Banner (global + persönlich).
// Die Sichtbarkeit erzwingt die RLS-Policy – wir lesen einfach die aktiven.
export async function getVisibleBanners(): Promise<Banner[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("student_banners")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return (data ?? []).map(fromRow);
}

// Lehrer: aktuelles aktives Banner für ein Ziel (studentId oder null = global).
export async function getBannerForTarget(targetUserId: string | null): Promise<Banner | null> {
  const supabase = createClient();
  let q = supabase.from("student_banners").select("*").eq("active", true)
    .order("created_at", { ascending: false }).limit(1);
  q = targetUserId === null ? q.is("target_user_id", null) : q.eq("target_user_id", targetUserId);
  const { data } = await q;
  return data && data[0] ? fromRow(data[0]) : null;
}

// Lehrer: Banner für ein Ziel setzen. Ersetzt ein vorhandenes aktives Banner
// desselben Ziels (altes wird deaktiviert, neues angelegt).
export async function saveBanner(input: {
  targetUserId: string | null;
  message: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  tone?: BannerTone;
}): Promise<{ error?: string }> {
  const supabase = createClient();
  await deactivateFor(input.targetUserId);
  const { error } = await supabase.from("student_banners").insert({
    target_user_id: input.targetUserId,
    message: input.message.trim(),
    cta_label: input.ctaLabel?.trim() || null,
    cta_href: input.ctaHref?.trim() || null,
    tone: input.tone ?? "info",
    active: true,
  });
  return { error: error?.message };
}

// Lehrer: aktives Banner eines Ziels abschalten.
export async function clearBanner(targetUserId: string | null): Promise<{ error?: string }> {
  const { error } = await deactivateFor(targetUserId);
  return { error: error?.message };
}

async function deactivateFor(targetUserId: string | null) {
  const supabase = createClient();
  const base = supabase.from("student_banners").update({ active: false }).eq("active", true);
  return targetUserId === null ? base.is("target_user_id", null) : base.eq("target_user_id", targetUserId);
}
