"use client";

import { createClient } from "@/lib/supabase/client";

// Merker "Willkommen schon gesehen" liegt in den Konto-Daten des Nutzers.
// Vorteil gegenüber localStorage: gilt auf jedem Gerät. Vorteil gegenüber einer
// eigenen Spalte: kommt ohne Datenbank-Änderung aus.

export async function hasBeenWelcomed(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return true; // nicht eingeloggt -> nichts anzeigen
  return user.user_metadata?.welcomed === true;
}

export async function markWelcomed(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.updateUser({ data: { welcomed: true } });
}
