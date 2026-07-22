"use client";

import { createClient } from "@/lib/supabase/client";

export type LeaderRow = { rank: number; name: string; score: number; isMe: boolean };

// Score einer Runde speichern (nur eingeloggte Spieler, > 0).
export async function submitScore(score: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || score <= 0) return;
  const name = ((user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Student").trim();
  await supabase.from("fc_game_scores").insert({ user_id: user.id, player_name: name, score });
}

// Wochen-Bestenliste (echte Spieler + Motivations-Namen) über eine SECURITY-DEFINER-Funktion.
export async function getWeeklyLeaderboard(): Promise<LeaderRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("game_leaderboard_weekly");
  if (error || !data) return [];
  return (data as { rank: number; name: string; score: number; is_me: boolean }[])
    .map((r) => ({ rank: r.rank, name: r.name, score: r.score, isMe: r.is_me }));
}
