"use client";

import { createClient } from "@/lib/supabase/client";

export type DayCount = { date: string; count: number };

export type Stats = {
  totalReviews: number;
  studied: number; // Anzahl unterschiedlicher Karten, die schon gelernt wurden
  mature: number; // Karten mit großem Abstand (gut verankert, ≥ 21 Tage)
  learning: number; // Karten in der Lernphase (Abstand < 21 Tage)
  accuracy: number; // Anteil korrekter Antworten in Prozent (0–100)
  streak: number; // aufeinanderfolgende Lern-Tage bis heute
  reviewsByDay: DayCount[]; // letzte 30 Tage
};

const MATURE_DAYS = 21;

// Lokales Datum als "YYYY-MM-DD".
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Berechnet die Lernsträhne: Tage in Folge mit ≥1 Wiederholung, bis heute
// (oder gestern – ein heute noch nicht gelernter Tag bricht die Strähne nicht).
function computeStreak(activeDays: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  // Wenn heute noch nichts gelernt wurde, ab gestern zählen.
  if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getStats(): Promise<Stats> {
  const empty: Stats = { totalReviews: 0, studied: 0, mature: 0, learning: 0, accuracy: 0, streak: 0, reviewsByDay: last30Empty() };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  // Supabase liefert pro Abfrage max. 1000 Zeilen – daher seitenweise laden,
  // sonst werden Verlauf/Statistik bei viel Übung abgeschnitten.
  const PAGE = 1000;

  // Wiederholungs-Verlauf (für Diagramm, Genauigkeit, Strähne).
  const logs: { rating: string; reviewed_at: string }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("fc_review_log")
      .select("rating, reviewed_at")
      .eq("user_id", user.id)
      .order("reviewed_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    logs.push(...(data as { rating: string; reviewed_at: string }[]));
    if (data.length < PAGE) break;
  }

  // Lernzustände (für gelernt/reif/lernend).
  const states: { interval_days: number; repetitions: number }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("fc_card_states")
      .select("interval_days, repetitions")
      .eq("user_id", user.id)
      .order("card_id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    states.push(...(data as { interval_days: number; repetitions: number }[]));
    if (data.length < PAGE) break;
  }

  const rows = logs;
  const totalReviews = rows.length;
  const correct = rows.filter((r) => r.rating !== "again").length;
  const accuracy = totalReviews > 0 ? Math.round((correct / totalReviews) * 100) : 0;

  const activeDays = new Set<string>();
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const key = dayKey(new Date(r.reviewed_at as string));
    activeDays.add(key);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const reviewsByDay = last30Empty().map((d) => ({ date: d.date, count: byDay.get(d.date) ?? 0 }));

  const studied = (states ?? []).length;
  const mature = (states ?? []).filter((s) => Number(s.interval_days) >= MATURE_DAYS).length;
  const learning = studied - mature;

  return {
    totalReviews,
    studied,
    mature,
    learning,
    accuracy,
    streak: computeStreak(activeDays),
    reviewsByDay,
  };
}

// Liefert die letzten 30 Tage (älteste zuerst) mit count 0.
function last30Empty(): DayCount[] {
  const out: DayCount[] = [];
  const d = new Date();
  d.setDate(d.getDate() - 29);
  for (let i = 0; i < 30; i++) {
    out.push({ date: dayKey(d), count: 0 });
    d.setDate(d.getDate() + 1);
  }
  return out;
}
