"use client";

import { useEffect } from "react";
import { trackLead } from "@/lib/track";
import { getAttribution } from "@/lib/attribution";

// Feuert das Meta-"Lead"-Event genau einmal, wenn der Nutzer über den
// Double-Opt-in-Bestätigungslink hier landet (?confirmed=1), und räumt die URL auf.
export default function B1ConfirmTracker() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("confirmed") === "1") {
        const a = getAttribution();
        trackLead({ source: a.utm_source, campaign: a.utm_campaign });
        url.searchParams.delete("confirmed");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    } catch { /* best effort */ }
  }, []);
  return null;
}
