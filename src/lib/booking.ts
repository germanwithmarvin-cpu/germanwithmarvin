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

export type TeacherProfile = {
  id: number;
  slug: string;
  name: string;
  role: string;
  bio: string;
  highlights: string[];
  languages: string;
  photoUrl: string;
  hourlyRate: number | null; // in USD
  active: boolean;
};

// Alle Lehrer-Profile (für die 1:1-Seite). Inaktive kommen mit, werden aber als
// „bald buchbar" markiert. Foto: teachers.photo_url oder Konvention /teachers/<slug>.jpg.
export async function getTeachers(): Promise<TeacherProfile[]> {
  const { data } = await createClient()
    .from("teachers")
    .select("id, slug, name, display_role, bio, highlights, languages, photo_url, hourly_rate_cents, active, sort_order")
    .order("sort_order", { ascending: true });
  return (data ?? []).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    role: t.display_role ?? "",
    bio: t.bio ?? "",
    highlights: Array.isArray(t.highlights) ? (t.highlights as string[]) : [],
    languages: t.languages ?? "",
    photoUrl: t.photo_url || `/teachers/${t.slug}.jpg`,
    hourlyRate: t.hourly_rate_cents != null ? t.hourly_rate_cents / 100 : null,
    active: Boolean(t.active),
  }));
}

// Aktuelles Abo des eingeloggten Schülers bei einem Lehrer (oder null, wenn keins).
// teacherId default 1 = Marvin (bestehendes Verhalten unverändert).
export async function getMySubscription(teacherId = 1): Promise<LessonSubscription | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("lesson_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("teacher_id", teacherId)
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

// Verfügbares Stunden-Guthaben bei einem Lehrer (Summe noch gültiger Gutschriften).
export async function getMyCredits(teacherId = 1): Promise<CreditInfo> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { balance: 0, nextExpiry: null };
  const nowISO = new Date().toISOString();
  const { data } = await supabase
    .from("lesson_credit_grants")
    .select("credits_remaining, expires_at")
    .eq("user_id", user.id)
    .eq("teacher_id", teacherId)
    .gt("expires_at", nowISO)
    .gt("credits_remaining", 0)
    .order("expires_at", { ascending: true });
  const rows = data ?? [];
  const balance = rows.reduce((s, r) => s + (r.credits_remaining ?? 0), 0);
  return { balance, nextExpiry: rows[0]?.expires_at ?? null };
}

// Stripe-Checkout für ein neues Stunden-Abo bei einem Lehrer starten.
export async function startLessonCheckout(quantity: number, teacherId = 1): Promise<{ url?: string; error?: string }> {
  const res = await fetch("/api/lesson-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, teacher_id: teacherId }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error ?? "Checkout failed" };
  return { url: json.url };
}

// Stundenzahl ändern (erhöhen sofort, senken zum Periodenende) oder kündigen.
export async function manageLessonSubscription(
  action: "set_quantity" | "cancel" | "resume",
  quantity?: number,
  teacherId = 1,
): Promise<{ error?: string }> {
  const res = await fetch("/api/lesson-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, quantity, teacher_id: teacherId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.error ?? "Update failed" };
  return {};
}
