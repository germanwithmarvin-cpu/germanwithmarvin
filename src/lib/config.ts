// Zentrale Einstellungen, die du leicht anpassen kannst.
//
// VIDEOS: Du lädst deine Videos bei YouTube als "nicht gelistet" (unlisted) hoch.
// Aus dem Link https://www.youtube.com/watch?v=ABC123  ist die Video-ID = "ABC123".

export const SITE = {
  // Verkaufsvideo auf der Startseite (YouTube). Kann Link oder reine ID sein.
  introVideoId: "1U2sTcL5BBA",
  contactEmail: "hallo@marvingraf.de",
  // Für "Nur Vokabel"-Nutzer (Skool): Link zu deinem Skool-Kurs mit den Videos.
  skoolUrl: "https://www.skool.com/german-with-marvin-5887/about",
  // Verkaufskanäle (Zugang läuft über diese Plattformen – dort gibt es die Codes).
  preplyUrl: "https://preply.com/en/tutor/6416829",
  // Stripe-Zahlungslink für das Monats-Abo (Managed Payments / Merchant of Record).
  // TEST-Link – vor dem echten Start durch den Live-Link ersetzen.
  stripePaymentLink: "https://buy.stripe.com/test_6oU9AT7INcJE505chl7Re00",
};

// Baut den Checkout-Link und hängt Nutzer-ID + E-Mail an, damit der Webhook
// nach der Zahlung genau weiß, welches Konto freigeschaltet werden soll.
export function checkoutUrl(userId?: string, email?: string): string {
  const url = new URL(SITE.stripePaymentLink);
  if (userId) url.searchParams.set("client_reference_id", userId);
  if (email) url.searchParams.set("prefilled_email", email);
  return url.toString();
}

// ---- Preis- & Zugangsmodell -------------------------------------------------
// App-Abo pro Monat (Videos + Flashcards + Stories, alle Level A1–B2).
export const APP_PRICE = 39;
export const APP_CURRENCY = "USD";
// Kostenloser Vollzugang (alle Level) für neue Konten – in Tagen.
export const TRIAL_DAYS = 7;
// Diese Level sind IMMER kostenlos (auch ohne Abo / nach dem Trial).
export const FREE_LEVELS = ["A1"] as const;

// Preis hübsch formatiert, z. B. "$39".
export function priceLabel(): string {
  return `$${APP_PRICE % 1 === 0 ? APP_PRICE : APP_PRICE.toFixed(2)}`;
}
