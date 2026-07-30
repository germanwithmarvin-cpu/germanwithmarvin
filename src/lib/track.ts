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

export function trackSignupConversion(email?: string): void {
  try {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    if (typeof w.gtag !== "function") return;
    // Enhanced Conversions: E-Mail (gtag hasht selbst). Nur wenn vorhanden.
    if (email) w.gtag("set", "user_data", { email });
    w.gtag("event", "conversion", { send_to: SIGNUP_CONVERSION });
  } catch { /* Tracking darf die Registrierung nie stören */ }
}
