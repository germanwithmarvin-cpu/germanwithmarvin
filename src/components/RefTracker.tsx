"use client";

import { useEffect } from "react";
import { captureRefFromUrl } from "@/lib/referral";
import { captureAttribution } from "@/lib/attribution";

// Unsichtbar. Liest beim Laden ?ref=CODE aus der URL, merkt sich den Code im
// Cookie und zählt den Besuch. Erfasst zusätzlich die Herkunft (gclid/utm/
// Referrer) für die spätere Zuordnung neuer Registrierungen. Global gemountet.
export default function RefTracker() {
  useEffect(() => {
    captureRefFromUrl();
    captureAttribution();
  }, []);
  return null;
}
