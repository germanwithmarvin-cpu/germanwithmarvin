// Zentrale Einstellungen, die du leicht anpassen kannst.
//
// VIDEOS: Du lädst deine Videos bei YouTube als "nicht gelistet" (unlisted) hoch.
// Aus dem Link https://www.youtube.com/watch?v=ABC123  ist die Video-ID = "ABC123".

export const SITE = {
  // Platzhalter-Videos – ersetze die IDs durch deine eigenen YouTube-Video-IDs.
  introVideoId: "dQw4w9WgXcQ", // Intro-Video auf der Startseite
  thankYouVideoId: "dQw4w9WgXcQ", // Danke-Video nach dem Abo-Abschluss
  contactEmail: "hallo@marvingraf.de",
  // Für "Nur Vokabel"-Nutzer (Skool): Link zu deinem Skool-Kurs mit den Videos.
  skoolUrl: "https://www.skool.com/german-with-marvin-5887/about",
  // Verkaufskanäle (Zugang läuft über diese Plattformen – dort gibt es die Codes).
  preplyUrl: "https://preply.com/en/tutor/6416829",
};

// ---- Preis- & Zugangsmodell -------------------------------------------------
// App-Abo pro Monat (Videos + Flashcards, alle Level A1–B2).
export const APP_PRICE_EUR = 13.9;
// Preis für eine einzelne 1:1-Stunde (separat buchbar).
export const BOOKING_PRICE_EUR = 39;
// Kostenloser Vollzugang (alle Level) für neue Konten – in Tagen.
export const TRIAL_DAYS = 7;
// Diese Level sind IMMER kostenlos (auch ohne Abo / nach dem Trial).
export const FREE_LEVELS = ["A1"] as const;

// Preis hübsch formatiert, z. B. "13,90".
export function priceLabel(eur: number): string {
  return eur.toFixed(2).replace(".", ",");
}
