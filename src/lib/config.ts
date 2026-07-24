// Zentrale Einstellungen, die du leicht anpassen kannst.
//
// VIDEOS: Du lädst deine Videos bei YouTube als "nicht gelistet" (unlisted) hoch.
// Aus dem Link https://www.youtube.com/watch?v=ABC123  ist die Video-ID = "ABC123".

export const SITE = {
  // Verkaufsvideo auf der Startseite (YouTube). Kann Link oder reine ID sein.
  introVideoId: "1U2sTcL5BBA",
  contactEmail: "germanwithmarvin@gmail.com",
  // Für "Nur Vokabel"-Nutzer (Skool): Link zu deinem Skool-Kurs mit den Videos.
  skoolUrl: "https://www.skool.com/german-with-marvin-5887/about",
  // Verkaufskanäle (Zugang läuft über diese Plattformen – dort gibt es die Codes).
  preplyUrl: "https://preply.com/en/tutor/6416829",
  // Stripe-Zahlungslink für das Monats-Abo (Managed Payments / Merchant of Record) – LIVE.
  stripePaymentLink: "https://buy.stripe.com/6oU9AT7INcJE505chl7Re00",
};

// Pay-first: Der Kunde zahlt zuerst; das Konto entsteht danach. Die Zuordnung
// läuft über die bezahlte E-Mail (Webhook). Optional eine E-Mail vorbefüllen.
export function checkoutUrl(email?: string): string {
  const url = new URL(SITE.stripePaymentLink);
  if (email) url.searchParams.set("prefilled_email", email);
  return url.toString();
}

// ---- Preis- & Zugangsmodell -------------------------------------------------
// App-Abo pro Monat (alles inklusive: Videos, Aufgaben, Flashcards, Stories).
export const APP_PRICE = 39;
export const APP_CURRENCY = "USD";

// Preis hübsch formatiert, z. B. "$39".
export function priceLabel(): string {
  return `$${APP_PRICE % 1 === 0 ? APP_PRICE : APP_PRICE.toFixed(2)}`;
}

// ---- 1-zu-1 Stunden: Monats-Abo mit Stunden-Guthaben ------------------------
export const LESSON = {
  stripePriceId: "price_1TurQzEsa6rPVhI2C2QoyaeH", // Volume-Staffel: bis 7 = $59, ab 8 = $56,05
  pricePerHour: 59, // USD, 50-Min-Stunde
  discountedPerHour: 56.05, // ab discountThreshold Stunden (−5 %)
  discountThreshold: 8, // ab 8 Stunden/Monat gilt der Rabatt
  minHours: 4, // Mindestpaket
  maxHours: 40, // Obergrenze (Sicherheit)
  currency: "USD",
  durationMin: 50,
  cancelHours: 24, // spätestens 24 h vorher absagen
  creditValidityDays: 35, // Guthaben 5 Wochen gültig
};

// Monatspreis für eine gewählte Stundenzahl (inkl. 5 % ab 8 Stunden).
export function lessonMonthlyPrice(hours: number): number {
  const per = hours >= LESSON.discountThreshold ? LESSON.discountedPerHour : LESSON.pricePerHour;
  return Math.round(per * hours * 100) / 100;
}

// z. B. "$236.00" oder "$448.40".
export function lessonPriceLabel(hours: number): string {
  return `$${lessonMonthlyPrice(hours).toFixed(2)}`;
}
