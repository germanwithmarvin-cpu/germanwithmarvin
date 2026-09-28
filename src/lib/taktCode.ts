// Stabiler, fuer Preply sinnloser Code je Schueler (abgeleitet aus der user_id).
// Steht anonym im Kalendertitel ("Unterricht · CODE"). In Takt beim Schueler als
// `calendar_match` eintragen -> Takt verknuepft den Termin automatisch mit dem
// vollen Namen (Notizen, Prep), waehrend Preply nur den Code sieht.
export function taktCode(userId?: string | null): string {
  return userId ? userId.replace(/-/g, "").slice(0, 6).toUpperCase() : "";
}
