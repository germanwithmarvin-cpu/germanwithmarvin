"use client";

import { createClient } from "@/lib/supabase/client";

export type LessonSubscription = {
  quantity: number;
  pendingQuantity: number | null;
  status: string; // active | past_due | canceled | inactive
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type CreditInfo = {
  balance: number; // aktuell verfügbare Stunden-Guthaben
  nextExpiry: string | null; // wann das nächste Guthaben verfällt
};

// Aktuelles Abo des eingeloggten Schülers (oder null, wenn keins).
export async function getMySubscription(): Promise<LessonSubscription | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("lesson_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    quantity: data.quantity ?? 0,
    pendingQuantity: data.pending_quantity ?? null,
    status: data.status ?? "inactive",
    currentPeriodEnd: data.current_period_end ?? null,
    cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
  };
}

// Verfügbares Stunden-Guthaben (Summe noch gültiger Gutschriften).
export async function getMyCredits(): Promise<CreditInfo> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { balance: 0, nextExpiry: null };
  const nowISO = new Date().toISOString();
  const { data } = await supabase
    .from("lesson_credit_grants")
    .select("credits_remaining, expires_at")
    .eq("user_id", user.id)
    .gt("expires_at", nowISO)
    .gt("credits_remaining", 0)
    .order("expires_at", { ascending: true });
  const rows = data ?? [];
  const balance = rows.reduce((s, r) => s + (r.credits_remaining ?? 0), 0);
  return { balance, nextExpiry: rows[0]?.expires_at ?? null };
}

// Stripe-Checkout für ein neues Stunden-Abo starten.
export async function startLessonCheckout(quantity: number): Promise<{ url?: string; error?: string }> {
  const res = await fetch("/api/lesson-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error ?? "Checkout failed" };
  return { url: json.url };
}

// Stundenzahl ändern (erhöhen sofort, senken zum Periodenende) oder kündigen.
export async function manageLessonSubscription(
  action: "set_quantity" | "cancel" | "resume",
  quantity?: number,
): Promise<{ error?: string }> {
  const res = await fetch("/api/lesson-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, quantity }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.error ?? "Update failed" };
  return {};
}
