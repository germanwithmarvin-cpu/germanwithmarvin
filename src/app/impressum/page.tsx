"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/config";

// Rechtlicher Pflicht-Hinweis (Impressum) – zweisprachig (English / Deutsch).
export default function ImpressumPage() {
  const [lang, setLang] = useState<"en" | "de">("en");

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo href="/" />
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <LangButton active={lang === "en"} onClick={() => setLang("en")}>English</LangButton>
            <LangButton active={lang === "de"} onClick={() => setLang("de")}>Deutsch</LangButton>
          </div>

          {lang === "en" ? <ImpressumEN /> : <ImpressumDE />}

          <div className="mt-12 flex gap-3">
            <Link href="/datenschutz" className="btn-outline px-5 py-2.5 inline-block">Privacy policy</Link>
            <Link href="/" className="btn-outline px-5 py-2.5 inline-block">← Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ImpressumEN() {
  return (
    <div className="text-cream-dim leading-relaxed">
      <h1 className="text-3xl font-bold text-cream">Legal Notice (Impressum)</h1>

      <Section title="Information pursuant to § 5 DDG">
        <p>
          German with Marvin LLC<br />
          Marvin Hagen Graf (Sole Member)<br />
          30 N Gould St Ste N<br />
          Sheridan, WY 82801<br />
          USA
        </p>
      </Section>

      <Section title="Represented by">
        <p>Marvin Hagen Graf (Sole Member)</p>
      </Section>

      <Section title="Contact">
        <p>
          Email:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>
        </p>
      </Section>

      <Section title="Company / Tax identification">
        <p>
          Legal form: Limited Liability Company (LLC), State of Wyoming, USA<br />
          Employer Identification Number (EIN): 42-3304749
        </p>
      </Section>

      <Section title="Responsible for content pursuant to § 18 (2) MStV">
        <p>
          Marvin Hagen Graf<br />
          30 N Gould St Ste N<br />
          Sheridan, WY 82801, USA
        </p>
      </Section>

      <Section title="Online dispute resolution (EU)">
        <p>
          The European Commission provides a platform for online dispute resolution (ODR):{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-gold-bright underline underline-offset-4">https://ec.europa.eu/consumers/odr/</a>.
          We are neither willing nor obliged to participate in dispute resolution proceedings before a
          consumer arbitration board.
        </p>
      </Section>
    </div>
  );
}

function ImpressumDE() {
  return (
    <div className="text-cream-dim leading-relaxed">
      <h1 className="text-3xl font-bold text-cream">Impressum</h1>

      <Section title="Angaben gemäß § 5 DDG">
        <p>
          German with Marvin LLC<br />
          Marvin Hagen Graf (Sole Member)<br />
          30 N Gould St Ste N<br />
          Sheridan, WY 82801<br />
          USA
        </p>
      </Section>

      <Section title="Vertreten durch">
        <p>Marvin Hagen Graf (alleiniger Gesellschafter / Sole Member)</p>
      </Section>

      <Section title="Kontakt">
        <p>
          E-Mail:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>
        </p>
      </Section>

      <Section title="Registereintrag / Steuerliche Kennung">
        <p>
          Rechtsform: Limited Liability Company (LLC), Bundesstaat Wyoming, USA<br />
          Employer Identification Number (EIN): 42-3304749
        </p>
      </Section>

      <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          Marvin Hagen Graf<br />
          30 N Gould St Ste N<br />
          Sheridan, WY 82801, USA
        </p>
      </Section>

      <Section title="EU-Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-gold-bright underline underline-offset-4">https://ec.europa.eu/consumers/odr/</a>.
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-cream">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function LangButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm transition ${active ? "bg-gold/20 text-cream font-medium" : "text-cream-dim hover:bg-gold/10"}`}
    >
      {children}
    </button>
  );
}
