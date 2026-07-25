"use client";

import { useEffect } from "react";
import { captureRefFromUrl } from "@/lib/referral";

// Unsichtbar. Liest beim Laden ?ref=CODE aus der URL, merkt sich den Code im
// Cookie und zählt den Besuch. Global im Root-Layout gemountet.
export default function RefTracker() {
  useEffect(() => {
    captureRefFromUrl();
  }, []);
  return null;
}
