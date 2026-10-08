// Zentrale Einstellungen, die du leicht anpassen kannst.
//
// VIDEOS: Du lädst deine Videos bei YouTube als "nicht gelistet" (unlisted) hoch.
// Aus dem Link https://www.youtube.com/watch?v=ABC123  ist die Video-ID = "ABC123".

export const SITE = {
  // Verkaufsvideo auf der Startseite (YouTube). Kann Link oder reine ID sein.
  introVideoId: "1U2sTcL5BBA",
  contactEmail: "marvin@germanwithmarvin.com",
  // Für "Nur Vokabel"-Nutzer (Skool): Link zu deinem Skool-Kurs mit den Videos.
  skoolUrl: "https://www.skool.com/german-with-marvin-5887/about",
  // Verkaufskanäle (Zugang läuft über diese Plattformen – dort gibt es die Codes).
  preplyUrl: "https://preply.com/en/tutor/6416829",
  // Stripe-Zahlungslink für das Monats-Abo (Managed Payments / Merchant of Record) – LIVE.
  // Pay-first für NEUE Kunden: Success-URL → /register (Konto entsteht nach Zahlung).
  stripePaymentLink: "https://buy.stripe.com/6oU9AT7INcJE505chl7Re00",
  // Rabattierter Zahlungslink für Trial-Absolventen ($19, Preis fest eingebaut).
  // Diese sind schon registriert → im Stripe-Link Success-URL auf .../dashboard setzen.
  discountPaymentLink: "https://buy.stripe.com/7sY00j5AF5hccsx6X17Re01",
};

// Alle Abo-CTAs führen jetzt auf die /pricing-Seite (Plan-Wähler: Monat $29 /
// Jahr $19 als Einmalzahlung). Der eigentliche Checkout läuft login-pflichtig
// über /api/course-checkout. Der frühere direkte Stripe-Payment-Link wird nicht
// mehr verlinkt; der email-Parameter bleibt nur aus Kompatibilität erhalten.
export function checkoutUrl(_email?: string): string {
  return "/pricing";
}
export function discountCheckoutUrl(_email?: string): string {
  return "/pricing";
}
export const hasDiscountLink = (): boolean => Boolean(SITE.discountPaymentLink);

// ---- Preis- & Zugangsmodell -------------------------------------------------
// App-Abo pro Monat (alles inklusive: Videos, Aufgaben, Flashcards, Stories).
export const APP_PRICE = 29; // Monatspreis (neues Modell); Jahr günstiger über /pricing
export const DISCOUNT_PRICE = 19; // vergünstigt für Preply/Skool-Trial-Absolventen
export const APP_CURRENCY = "USD";

// Neues Preismodell (wird über /pricing + /api/course-checkout scharf geschaltet).
// Monat $29 (flexibel) · Jahr $228 am Stück = $19/Mon (Einmalzahlung).
// WICHTIG: Diese Zahlen sind nur die Anzeige — berechnet wird, was hinter den
// Stripe-Price-IDs steht. Bitte die Beträge mit Stripe abgleichen.
export const APP_PRICE_MONTHLY = 29;
export const APP_YEARLY_PER_MONTH = 19;
export const APP_YEARLY_TOTAL = 228;
export const COURSE = {
  monthlyPriceId: "price_1UNweyEsa6rPVhI2vU6lsJgC",
  yearlyPriceId: "price_1UNwh9Esa6rPVhI2cyDCS6qY",
};

// Lead-Magnet: gratis A1-Story-PDF gegen E-Mail. Datei nach public/materials/
// legen (Marvin lädt sein A1-Story-PDF genau unter diesem Namen hoch).
export const LEAD_MAGNET_PDF = "/materials/a1-stories.pdf";

// Preis hübsch formatiert, z. B. "$39".
export function priceLabel(): string {
  return `$${APP_PRICE % 1 === 0 ? APP_PRICE : APP_PRICE.toFixed(2)}`;
}
export function discountPriceLabel(): string {
  return `$${DISCOUNT_PRICE % 1 === 0 ? DISCOUNT_PRICE : DISCOUNT_PRICE.toFixed(2)}`;
}

// Preise sind netto; Stripe schlägt an der Kasse standortabhängig Steuer (VAT/
// Sales Tax) auf. Kurzer, rechtssicherer Hinweis überall an den Preisen.
export const TAX_NOTE = "plus applicable tax";
export const TAX_NOTE_LONG =
  "Prices shown exclude tax. Applicable VAT/sales tax is added at checkout based on your location.";

// ---- 1-zu-1 Stunden: Monats-Abo mit Stunden-Guthaben ------------------------
export const LESSON = {
  stripePriceId: "price_1UGCpOEsa6rPVhI2woGYgISc", // Volume-Staffel: bis 7 = $59, ab 8 = $56,05
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
