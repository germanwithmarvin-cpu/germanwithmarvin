"use client";

// Feuert ein „Checkout gestartet"-Ereignis an Meta + Google, wenn die Pixel
// geladen sind (sonst still no-op). Wird beim Klick auf einen „Join now"-Button
// aufgerufen — das stärkste Kaufabsichts-Signal, das clientseitig messbar ist.
export function trackCheckoutClick(): void {
  try {
    const w = window as unknown as {
      fbq?: (...a: unknown[]) => void;
      gtag?: (...a: unknown[]) => void;
    };
    if (typeof w.fbq === "function") w.fbq("track", "InitiateCheckout");
    if (typeof w.gtag === "function") w.gtag("event", "begin_checkout");
  } catch { /* Tracking darf nie den Klick stören */ }
}

// Google-Ads-Conversion „Free trial signup". send_to = Konto-Tag AW-… + Label.
// Feuert nur, wenn der Google-Tag geladen ist (respektiert Consent Mode/Banner).
const SIGNUP_CONVERSION = "AW-18352653705/4ODKCMvdydgcEImLna9E";

// Google-Ads-Conversion „Purchase". LEER lassen, bis Marvin in Google Ads eine
// Conversion-Aktion „Purchase" angelegt und mir das Label gegeben hat
// (Format wie oben: "AW-18352653705/XXXXXXXX"). Solange leer, feuert nur Meta.
const PURCHASE_CONVERSION = "";

export function trackSignupConversion(email?: string): void {
  try {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
    // Meta: Konto-Anmeldung = CompleteRegistration (fehlte bisher komplett).
    if (typeof w.fbq === "function") w.fbq("track", "CompleteRegistration");
    if (typeof w.gtag !== "function") return;
    // Enhanced Conversions: E-Mail (gtag hasht selbst). Nur wenn vorhanden.
    if (email) w.gtag("set", "user_data", { email });
    w.gtag("event", "conversion", { send_to: SIGNUP_CONVERSION });
  } catch { /* Tracking darf die Registrierung nie stören */ }
}

// Kauf-Conversion (Abo/Jahr/Stunden). Feuert auf der Erfolgsseite nach Stripe.
// Meta „Purchase" immer; Google-Ads-Purchase nur, wenn PURCHASE_CONVERSION gesetzt.
export function trackPurchase(opts: { value: number; currency?: string }): void {
  try {
    const value = Number.isFinite(opts.value) ? opts.value : 0;
    const currency = opts.currency || "USD";
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
    if (typeof w.fbq === "function") w.fbq("track", "Purchase", { value, currency });
    if (typeof w.gtag === "function" && PURCHASE_CONVERSION) {
      w.gtag("event", "conversion", { send_to: PURCHASE_CONVERSION, value, currency });
    }
  } catch { /* Tracking darf die Erfolgsseite nie stören */ }
}
