"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAccess } from "@/lib/access";

// Schmales Banner oben, wenn der Zugang über einen laufenden Trial-Code kommt.
// Zeigt die verbleibenden Tage + Aufruf zum Abo. Nichts, wenn kein aktiver Trial.
export default function TrialBanner() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    getAccess().then((a) => {
      if (a.tier !== "full" || !a.trialExpiresAt) return;
      const ms = new Date(a.trialExpiresAt).getTime() - Date.now();
      if (ms > 0) setDays(Math.ceil(ms / 86400000));
    });
  }, []);

  if (days === null) return null;

  return (
    <div className="text-center text-sm py-2 px-4" style={{ background: "var(--bordeaux)", color: "var(--cream)" }}>
      🎁 Free trial — <b>{days} day{days === 1 ? "" : "s"} left</b>.{" "}
      <Link href="/subscribe" className="underline underline-offset-2 hover:opacity-90">Keep your access →</Link>
    </div>
  );
}
