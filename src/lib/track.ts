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
