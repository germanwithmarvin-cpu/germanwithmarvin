"use client";

import { createClient } from "@/lib/supabase/client";

// Harte Paywall: Es gibt nur noch VOLLZUGANG oder KEINEN Zugang.
//  - full: Lehrer, per Code freigeschaltet ODER aktives Stripe-Abo (per E-Mail).
//  - none: kein Zugang → Paywall.
export type AccessTier = "full" | "none";
export type Access = { tier: AccessTier };

export async function getAccess(): Promise<Access> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tier: "none" };

  // Zugang wird serverseitig sicher abgeleitet (Code ODER aktives Stripe-Abo).
  const { data, error } = await supabase.rpc("my_access");
  if (!error) return { tier: data === "full" ? "full" : "none" };

  // Fallback, falls my_access() noch nicht installiert ist: Lehrer + Code weiterhin freischalten.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_teacher, access_scope")
    .eq("id", user.id)
    .single();
  return { tier: profile?.is_teacher || profile?.access_scope === "full" ? "full" : "none" };
}

export function hasAccess(tier: AccessTier): boolean {
  return tier === "full";
}

// Kompatibilitäts-Helfer (Level spielt keine Rolle mehr – alles braucht Vollzugang).
export function canAccessVocabLevel(tier: AccessTier, _level?: string): boolean {
  return tier === "full";
}
export function canAccessVideoLevel(tier: AccessTier, _level?: string): boolean {
  return tier === "full";
}
export function canAccessPremium(tier: AccessTier): boolean {
  return tier === "full";
}
