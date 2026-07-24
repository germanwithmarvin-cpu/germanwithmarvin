"use client";

import { useEffect } from "react";

// Registriert den Service Worker (nötig für die Installierbarkeit als PWA).
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
