"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSettings } from "@/lib/booksClient";
import type { BookSettings } from "@/lib/books";
import DeadlinesView from "@/components/books/DeadlinesView";
import Form5472View from "@/components/books/Form5472View";
import MonthView from "@/components/books/MonthView";
import SettingsView from "@/components/books/SettingsView";
import YearView from "@/components/books/YearView";
import { Note } from "@/components/books/ui";

// Buchhaltung der LLC. Loest die Excel-Datei ab: derselbe Aufbau, aber als
// gefuehrter Ablauf statt als Blattsammlung — und mit direktem Draht zu Stripe.

const tabs = ["Monat", "Jahr & GuV", "Form 5472", "Fristen", "Stammdaten"] as const;
type Tab = (typeof tabs)[number];

export default function BuchhaltungPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("Monat");
  const [settings, setSettings] = useState<BookSettings | null>(null);
  const [missing, setMissing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      const { data } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
      if (data?.is_teacher) setAllowed(true);
      else { setAllowed(false); router.replace("/dashboard"); }
    });
  }, [router]);

  const loadSettings = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
    setMissing(s === null);
    setLoaded(true);
  }, []);

  useEffect(() => { if (allowed) loadSettings(); }, [allowed, loadSettings]);

  if (allowed !== true) return <p className="text-sm text-cream-dim">Zugang wird geprüft …</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buchhaltung</h1>
        <p className="text-sm text-cream-dim">
          {settings?.company_name ?? "German with Marvin LLC"} · {settings?.state ?? "Wyoming"} ·{" "}
          {settings?.tax_classification ?? "foreign-owned disregarded entity"} · Buchführung in{" "}
          {settings?.currency ?? "USD"}
        </p>
      </div>

      {missing && (
        <Note tone="warn">
          Die Buchhaltungstabellen fehlen noch in der Datenbank. Führe{" "}
          <code>supabase/buchhaltung.sql</code> im Supabase-SQL-Editor aus — danach diese Seite
          neu laden.
        </Note>
      )}

      <div className="flex flex-wrap gap-2 border-b border-gold/15">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${
              tab === t ? "border-gold text-cream" : "border-transparent text-cream-dim hover:text-cream"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Erst rendern, wenn die Stammdaten da sind — Jahresansicht und Form 5472
          leiten ihr Startjahr daraus ab. */}
      {!loaded ? (
        <p className="text-sm text-cream-dim">Lade Stammdaten …</p>
      ) : (
        <>
          {tab === "Monat" && <MonthView settings={settings} />}
          {tab === "Jahr & GuV" && <YearView settings={settings} />}
          {tab === "Form 5472" && <Form5472View settings={settings} />}
          {tab === "Fristen" && <DeadlinesView settings={settings} />}
          {tab === "Stammdaten" && <SettingsView settings={settings} onSaved={loadSettings} />}
        </>
      )}
    </div>
  );
}
