"use client";

import { createClient } from "@/lib/supabase/client";
import { TRIAL_DAYS, FREE_LEVELS } from "@/lib/config";

// Zugangsstufen:
//  - subscribed: Abo ODER Lehrer ODER Freischaltcode "Komplett" → alles frei
//  - vocab:      Freischaltcode "Nur Vokabel" → Vokabel-App (alle Level) frei, Videos ab A2 = Skool-Hinweis
//  - trial:      neues Konto, innerhalb der Gratis-Tage → alles frei (befristet)
//  - free:       nichts davon → nur kostenlose Level (A1) + Buchung
export type AccessTier = "free" | "trial" | "subscribed" | "vocab";
export type Access = { tier: AccessTier; trialDaysLeft: number };

function isFreeLevel(level: string): boolean {
  return (FREE_LEVELS as readonly string[]).includes(level);
}

export async function getAccess(): Promise<Access> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tier: "free", trialDaysLeft: 0 };

  const { data } = await supabase
    .from("profiles")
    .select("is_subscribed, is_teacher, access_scope, created_at")
    .eq("id", user.id)
    .single();

  // Lehrer, Abonnenten und "Komplett"-Code: voller Zugang.
  if (data?.is_teacher || data?.is_subscribed || data?.access_scope === "full") {
    return { tier: "subscribed", trialDaysLeft: 0 };
  }
  if (data?.access_scope === "vocab") return { tier: "vocab", trialDaysLeft: 0 };

  const createdMs = data?.created_at ? new Date(data.created_at as string).getTime() : Date.now();
  const msLeft = createdMs + TRIAL_DAYS * 86_400_000 - Date.now();
  if (msLeft > 0) return { tier: "trial", trialDaysLeft: Math.ceil(msLeft / 86_400_000) };
  return { tier: "free", trialDaysLeft: 0 };
}

// Vokabel-App (Flashcards) dieses Levels? A1 immer; sonst Trial/Abo/Komplett/Vokabel.
export function canAccessVocabLevel(tier: AccessTier, level: string): boolean {
  if (isFreeLevel(level)) return true;
  return tier === "trial" || tier === "subscribed" || tier === "vocab";
}

// Video-Lektionen dieses Levels? A1 immer; sonst Trial/Abo/Komplett (NICHT vocab).
export function canAccessVideoLevel(tier: AccessTier, level: string): boolean {
  if (isFreeLevel(level)) return true;
  return tier === "trial" || tier === "subscribed";
}

// Premium (Schreibaufgaben, Nachrichten): nur Trial/Abo/Komplett.
export function canAccessPremium(tier: AccessTier): boolean {
  return tier === "trial" || tier === "subscribed";
}
