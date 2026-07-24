"use client";

import { createClient } from "@/lib/supabase/client";

// Harte Paywall: Es gibt nur noch VOLLZUGANG oder KEINEN Zugang.
//  - full: Lehrer, per Code freigeschaltet ODER aktives Stripe-Abo (per E-Mail).
//  - none: kein Zugang → Paywall.
export type AccessTier = "full" | "none";
// trialExpiresAt: gesetzt, wenn der Zugang über einen Trial-Code läuft
// (Zukunft = aktiver Trial, Vergangenheit = abgelaufen → Paywall mit Rabatt).
export type Access = { tier: AccessTier; trialExpiresAt?: string | null };

export async function getAccess(): Promise<Access> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tier: "none" };

  // Zugang wird serverseitig sicher abgeleitet (Code ODER aktives Stripe-Abo).
  const { data, error } = await supabase.rpc("my_access");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_teacher, access_scope, access_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  const trialExpiresAt =
    profile?.access_scope === "full" && profile?.access_expires_at ? (profile.access_expires_at as string) : null;

  if (!error) return { tier: data === "full" ? "full" : "none", trialExpiresAt };

  // Fallback, falls my_access() noch nicht installiert ist: Lehrer + (nicht abgelaufener) Code.
  const full =
    Boolean(profile?.is_teacher) ||
    (profile?.access_scope === "full" && (!profile?.access_expires_at || new Date(profile.access_expires_at as string) > new Date()));
  return { tier: full ? "full" : "none", trialExpiresAt };
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
