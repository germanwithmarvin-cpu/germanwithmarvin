"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE, priceLabel } from "@/lib/config";

// AGB + Widerrufsbelehrung (zweisprachig). Bitte anwaltlich prüfen lassen (Hinweis am Ende).
export default function TermsPage() {
  const [lang, setLang] = useState<"en" | "de">("en");
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo href="/" />
      </header>
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto text-cream-dim leading-relaxed">
          <div className="flex items-center gap-2 mb-6">
            <LangButton active={lang === "en"} onClick={() => setLang("en")}>English</LangButton>
            <LangButton active={lang === "de"} onClick={() => setLang("de")}>Deutsch</LangButton>
          </div>

          {lang === "en" ? <TermsEN /> : <TermsDE />}

          <div className="mt-8 flex gap-3">
            <Link href="/impressum" className="btn-outline px-5 py-2.5 inline-block">Legal notice</Link>
            <Link href="/" className="btn-outline px-5 py-2.5 inline-block">← Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function TermsEN() {
  return (
    <>
      <h1 className="text-3xl font-bold text-cream">Terms &amp; Cancellation</h1>
      <p className="mt-3 text-sm">Last updated: July 2026</p>

      <Section title="1. Provider">
        <p>German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA. Contact: {SITE.contactEmail}.</p>
      </Section>
      <Section title="2. Service">
        <p>
          We provide an online German-learning subscription: video lessons, interactive exercises, a flashcard
          trainer and reading stories, accessible via your account on this website.
        </p>
      </Section>
      <Section title="3. Contract & account">
        <p>
          A contract is concluded when you complete checkout via Stripe and create your account. You are
          responsible for keeping your login details safe. You must be at least 18 years old (or have consent
          of a legal guardian).
        </p>
      </Section>
      <Section title="4. Price & payment">
        <p>
          The subscription costs {priceLabel()} per month and renews automatically each month until cancelled.
          Payment is processed by Stripe. Prices include applicable taxes where required.
        </p>
      </Section>
      <Section title="5. Term & cancellation">
        <p>
          The subscription runs monthly and can be cancelled at any time with effect from the end of the
          current billing period. After cancellation your access ends when the paid period expires. To cancel,
          contact {SITE.contactEmail} or use the cancellation link in your Stripe receipt.
        </p>
      </Section>
      <Section title="6. Right of withdrawal (consumers in the EU)">
        <p>
          You have the right to withdraw from this contract within 14 days without giving a reason. The
          withdrawal period is 14 days from the day the contract is concluded. To exercise it, inform us
          ({SITE.contactEmail}) with a clear statement.
        </p>
        <p className="mt-2 font-medium text-cream">Early expiry for digital services:</p>
        <p>
          As the service is a digital service with immediate access, you expressly agree that we begin
          providing it right after checkout and you acknowledge that you thereby <strong>lose your right of
          withdrawal</strong> once performance has begun.
        </p>
      </Section>
      <Section title="7. Content & fair use">
        <p>
          All content (videos, exercises, texts) is protected and provided for your personal learning only.
          Sharing your account or redistributing content is not permitted.
        </p>
      </Section>
      <Section title="8. Liability">
        <p>
          We provide the service with reasonable care but do not guarantee specific learning outcomes.
          Liability is limited to intent and gross negligence, except for damages to life, body or health.
        </p>
      </Section>
      <Section title="9. Changes & governing law">
        <p>
          We may update these terms; material changes will be announced with reasonable notice. Statutory
          consumer-protection rules of your country of residence remain unaffected.
        </p>
      </Section>

      <p className="mt-10 text-xs italic">
        Note: These terms were prepared to the best of our knowledge and do not constitute legal advice. Please
        have them reviewed by a lawyer before relying on them.
      </p>
    </>
  );
}

function TermsDE() {
  return (
    <>
      <h1 className="text-3xl font-bold text-cream">AGB &amp; Widerruf</h1>
      <p className="mt-3 text-sm">Stand: Juli 2026</p>

      <Section title="1. Anbieter">
        <p>German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA. Kontakt: {SITE.contactEmail}.</p>
      </Section>
      <Section title="2. Leistung">
        <p>
          Wir bieten ein Online-Abo zum Deutschlernen: Videolektionen, interaktive Aufgaben, einen
          Karteikarten-Trainer und Lesegeschichten – zugänglich über dein Konto auf dieser Website.
        </p>
      </Section>
      <Section title="3. Vertrag & Konto">
        <p>
          Der Vertrag kommt zustande, wenn du den Checkout über Stripe abschließt und dein Konto anlegst. Du
          bewahrst deine Zugangsdaten sicher auf. Du musst mindestens 18 Jahre alt sein (oder die Zustimmung
          eines Erziehungsberechtigten haben).
        </p>
      </Section>
      <Section title="4. Preis & Zahlung">
        <p>
          Das Abo kostet {priceLabel()} pro Monat und verlängert sich automatisch monatlich, bis es gekündigt
          wird. Die Zahlung wickelt Stripe ab. Preise enthalten – soweit anwendbar – die jeweilige Steuer.
        </p>
      </Section>
      <Section title="5. Laufzeit & Kündigung">
        <p>
          Das Abo läuft monatlich und ist jederzeit zum Ende des laufenden Abrechnungszeitraums kündbar. Nach
          der Kündigung endet dein Zugang mit Ablauf der bezahlten Periode. Kündigung per Nachricht an{" "}
          {SITE.contactEmail} oder über den Link in deiner Stripe-Quittung.
        </p>
      </Section>
      <Section title="6. Widerrufsrecht (Verbraucher in der EU)">
        <p>
          Du hast das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
          Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsschlusses. Zur Ausübung informiere uns
          ({SITE.contactEmail}) mit einer eindeutigen Erklärung.
        </p>
        <p className="mt-2 font-medium text-cream">Vorzeitiges Erlöschen bei digitalen Leistungen:</p>
        <p>
          Da es sich um eine digitale Leistung mit sofortigem Zugang handelt, stimmst du ausdrücklich zu, dass
          wir direkt nach dem Checkout mit der Ausführung beginnen, und bestätigst, dass du damit dein{" "}
          <strong>Widerrufsrecht verlierst</strong>, sobald mit der Ausführung begonnen wurde.
        </p>
      </Section>
      <Section title="7. Inhalte & Nutzung">
        <p>
          Alle Inhalte (Videos, Aufgaben, Texte) sind geschützt und ausschließlich für dein persönliches Lernen
          bestimmt. Das Teilen deines Kontos oder Weiterverbreiten von Inhalten ist nicht gestattet.
        </p>
      </Section>
      <Section title="8. Haftung">
        <p>
          Wir erbringen die Leistung mit angemessener Sorgfalt, garantieren aber keinen bestimmten Lernerfolg.
          Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, außer bei Schäden an Leben, Körper
          oder Gesundheit.
        </p>
      </Section>
      <Section title="9. Änderungen & Recht">
        <p>
          Wir können diese Bedingungen anpassen; wesentliche Änderungen kündigen wir mit angemessener Frist an.
          Zwingende Verbraucherschutzregeln deines Wohnsitzlandes bleiben unberührt.
        </p>
      </Section>

      <p className="mt-10 text-xs italic">
        Hinweis: Diese Bedingungen wurden nach bestem Wissen erstellt und ersetzen keine Rechtsberatung. Bitte
        vor dem produktiven Einsatz anwaltlich prüfen lassen.
      </p>
    </>
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
