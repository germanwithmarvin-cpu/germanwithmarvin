"use client";

import { useCallback, useState } from "react";
import type { Access } from "@/lib/access";

// Tages-Lernkontingent fuer Trial-Nutzer (Duolingo-Prinzip): Der Kunde stoesst
// GENAU im Lern-Flow an die Grenze -- dort ist die Kaufbereitschaft am hoechsten.
// Das ist bewusst KEIN Sicherheitsmechanismus, sondern ein Motivations-Nudge:
// gezaehlt wird nur lokal (localStorage). Nach dem Trial-Ende (5 Tage) greift
// ohnehin die harte, serverseitige Paywall.
export const DAILY_LIMITS = { cards: 50, units: 5, videos: 5 } as const;
export type LimitKind = keyof typeof DAILY_LIMITS;

// Trial = zeitlich begrenzter Vollzugang. NICHT betroffen: Lehrer, Dauer-Codes
// (Preply/Skool) und zahlende Abo-Kunden -- die haben kein Ablaufdatum bzw.
// laufen ueber Stripe und bekommen daher nie ein Tageslimit.
export function isTrialAccess(a: Access | null | undefined): boolean {
  return !!a && a.tier === "full" && !!a.trialExpiresAt && new Date(a.trialExpiresAt).getTime() > Date.now();
}

type Usage = { date: string; cards: number; units: string[]; videos: string[] };
const KEY = "gsw_trial_usage_v1";
const day = () => new Date().toISOString().slice(0, 10);

function read(): Usage {
  const base: Usage = { date: day(), cards: 0, units: [], videos: [] };
  if (typeof window === "undefined") return base;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && raw.date === day()) {
      return { date: day(), cards: Number(raw.cards) || 0, units: raw.units ?? [], videos: raw.videos ?? [] };
    }
  } catch { /* ignore */ }
  return base; // neuer Tag oder leer -> Kontingent frisch
}
function write(u: Usage) { try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* ignore */ } }

// Aufrufer entscheiden per isTrialAccess(), ob sie ueberhaupt zaehlen/sperren --
// der Hook selbst kennt den Trial-Status nicht (vermeidet stale-closure-Fehler
// direkt nach dem Laden des Zugangs).
export function useDailyLimit() {
  const [usage, setUsage] = useState<Usage>(() => read());

  // Eine gelernte Karte zaehlen; liefert den neuen Tagesstand.
  const addCard = useCallback((): number => {
    const u = read(); u.cards += 1; write(u); setUsage(u); return u.cards;
  }, []);

  // Slot fuer eine Einheit/ein Video reservieren. true = erlaubt (heute schon
  // geoeffnet ODER noch Platz), false = Tageslimit erreicht. Erneutes Oeffnen
  // derselben Einheit ist gratis (Wiederholung soll nichts kosten).
  const claim = useCallback((kind: "units" | "videos", id: string): boolean => {
    const u = read();
    const list = u[kind];
    if (list.includes(id)) return true;
    if (list.length >= DAILY_LIMITS[kind]) return false;
    list.push(id); write(u); setUsage(u); return true;
  }, []);

  return { usage, addCard, claim };
}
