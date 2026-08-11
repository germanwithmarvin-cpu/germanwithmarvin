"use client";

import { useEffect } from "react";

// Meldet die IP des eingeloggten Nutzers einmal pro Session an /api/track-ip
// (die Route liest die echte IP aus den Vercel-Headern und speichert sie).
// Rendert nichts; Fehler werden bewusst verschluckt.
export default function IpTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("gsw_ip_tracked")) return;
      sessionStorage.setItem("gsw_ip_tracked", "1");
    } catch { /* sessionStorage evtl. blockiert */ }
    fetch("/api/track-ip", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
