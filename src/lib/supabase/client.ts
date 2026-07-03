"use client";

import { createBrowserClient } from "@supabase/ssr";

// Supabase-Client für den Browser (Client-Komponenten).
// Liest die Zugangsdaten aus den Umgebungsvariablen in .env.local.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Praktischer Helfer: true, wenn Supabase eingerichtet ist.
export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
