"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/track";

// Feuert das Meta-"Purchase"-Event (Betrag in EUR) genau einmal nach dem Kauf,
// wenn Stripe auf /b1-course?purchase=success&value=… zurückleitet, und räumt die URL auf.
export default function B1CourseTracker() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("purchase") === "success") {
        const value = Number(url.searchParams.get("value") ?? "0") || 0;
        trackPurchase({ value, currency: "EUR" });
        url.searchParams.delete("purchase");
        url.searchParams.delete("value");
        window.history.replaceState({}, "", url.pathname + (url.search || "") + (url.hash || ""));
      }
    } catch { /* best effort */ }
  }, []);
  return null;
}
