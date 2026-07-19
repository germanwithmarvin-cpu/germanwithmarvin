"use client";

import { createClient } from "@/lib/supabase/client";

export type MyProfile = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  memberSince: string; // ISO-Datum der Kontoerstellung
};

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (user.user_metadata?.full_name as string) ?? "",
    avatarUrl: (data?.avatar_url as string) ?? "",
    memberSince: user.created_at ?? "",
  };
}

// Passwort ändern (der Schüler ändert sein eigenes Passwort im Profil).
export async function changeMyPassword(newPassword: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message };
}

// Name ändern (im Konto gespeichert).
export async function saveMyName(fullName: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  return { error: error?.message };
}

// Profilbild-URL sicher setzen (nur eigenes Profil, per SECURITY-DEFINER-Funktion).
export async function saveMyAvatar(url: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.rpc("set_my_avatar", { p_url: url });
  return { error: error?.message };
}

// Nur die Profilbild-URL laden (leichtgewichtig, z. B. fürs Menü).
export async function getMyAvatar(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "";
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data?.avatar_url as string) ?? "";
}
