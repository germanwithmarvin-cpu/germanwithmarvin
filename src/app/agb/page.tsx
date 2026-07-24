"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE, priceLabel, LESSON } from "@/lib/config";

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
          Payment is processed by Stripe. Prices shown exclude tax; any applicable VAT/sales tax is added at
          checkout based on your location.
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
      <Section title="7. Live 1-on-1 lessons (optional)">
        <p>
          Separately from the app subscription, you can subscribe to a monthly package of private 1-on-1 lessons
          ({LESSON.durationMin} minutes each). You choose how many lessons per month (minimum {LESSON.minHours}). The
          price is ${LESSON.pricePerHour} per lesson; from {LESSON.discountThreshold} lessons per month a 5% discount
          applies. This lesson subscription renews automatically each month and is billed via Stripe.
        </p>
        <p className="mt-2">
          Each monthly payment credits the matching number of lesson hours to your account. You book specific times
          via the in-app calendar; each booking uses one lesson hour.
        </p>
        <p className="mt-2"><span className="font-medium text-cream">Validity of lesson hours:</span> unused lesson
          hours expire 5 weeks after they are credited and are not refunded.</p>
        <p className="mt-2"><span className="font-medium text-cream">Cancelling a booked lesson:</span> you may cancel
          free of charge up to {LESSON.cancelHours} hours before the lesson starts — the hour is returned to your
          balance. If you cancel later than that, or do not attend (no-show), the lesson hour is forfeited.</p>
        <p className="mt-2"><span className="font-medium text-cream">Changing or cancelling your package:</span> you
          can increase your monthly hours at any time (charged pro-rata; hours added immediately). A decrease takes
          effect from the next billing period; your current hours remain. You may cancel the lesson subscription at
          any time with effect from the end of the current billing period; already-credited hours stay valid until
          they expire.</p>
        <p className="mt-2"><span className="font-medium text-cream">Right of withdrawal:</span> the 14-day withdrawal
          right applies to the lesson subscription until performance begins. By booking and attending a lesson you
          request its immediate performance and thereby lose the withdrawal right for any lesson already provided.</p>
      </Section>
      <Section title="8. Content & fair use">
        <p>
          All content (videos, exercises, texts) is protected and provided for your personal learning only.
          Sharing your account or redistributing content is not permitted.
        </p>
      </Section>
      <Section title="9. Liability">
        <p>
          We provide the service with reasonable care but do not guarantee specific learning outcomes.
          Liability is limited to intent and gross negligence, except for damages to life, body or health.
        </p>
      </Section>
      <Section title="10. Changes & governing law">
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
          wird. Die Zahlung wickelt Stripe ab. Die angegebenen Preise verstehen sich zzgl. der jeweils
          anwendbaren Steuer (USt./VAT), die Stripe standortabhängig an der Kasse aufschlägt.
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
      <Section title="7. Live-Einzelstunden (optional)">
        <p>
          Unabhängig vom App-Abo kannst du ein Monatspaket für private Einzelstunden ({LESSON.durationMin} Minuten je
          Stunde) abschließen. Du wählst die Anzahl der Stunden pro Monat (mindestens {LESSON.minHours}). Der Preis
          beträgt ${LESSON.pricePerHour} pro Stunde; ab {LESSON.discountThreshold} Stunden pro Monat gilt ein Rabatt
          von 5 %. Dieses Stunden-Abo verlängert sich automatisch monatlich und wird über Stripe abgerechnet.
        </p>
        <p className="mt-2">
          Jede Monatszahlung schreibt dir die entsprechende Anzahl an Stunden-Guthaben gut. Konkrete Termine buchst
          du über den Kalender in der App; jede Buchung verbraucht eine Stunde Guthaben.
        </p>
        <p className="mt-2"><span className="font-medium text-cream">Gültigkeit des Guthabens:</span> Nicht genutztes
          Stunden-Guthaben verfällt 5 Wochen nach der Gutschrift und wird nicht erstattet.</p>
        <p className="mt-2"><span className="font-medium text-cream">Absage einer gebuchten Stunde:</span> Bis
          {" "}{LESSON.cancelHours} Stunden vor Beginn kannst du kostenfrei absagen — die Stunde geht zurück ins
          Guthaben. Bei späterer Absage oder Nichterscheinen (No-Show) verfällt die Stunde.</p>
        <p className="mt-2"><span className="font-medium text-cream">Paket ändern oder kündigen:</span> Du kannst die
          monatliche Stundenzahl jederzeit erhöhen (anteilig berechnet, Stunden sofort gutgeschrieben). Eine
          Verringerung wirkt ab dem nächsten Abrechnungszeitraum; dein aktuelles Guthaben bleibt. Das Stunden-Abo
          ist jederzeit zum Ende des laufenden Abrechnungszeitraums kündbar; bereits gutgeschriebene Stunden bleiben
          bis zu ihrem Verfall gültig.</p>
        <p className="mt-2"><span className="font-medium text-cream">Widerrufsrecht:</span> Das 14-tägige
          Widerrufsrecht gilt für das Stunden-Abo bis zum Beginn der Leistung. Mit Buchung und Wahrnehmung einer
          Stunde verlangst du deren sofortige Ausführung und verlierst für bereits erbrachte Stunden das
          Widerrufsrecht.</p>
      </Section>
      <Section title="8. Inhalte & Nutzung">
        <p>
          Alle Inhalte (Videos, Aufgaben, Texte) sind geschützt und ausschließlich für dein persönliches Lernen
          bestimmt. Das Teilen deines Kontos oder Weiterverbreiten von Inhalten ist nicht gestattet.
        </p>
      </Section>
      <Section title="9. Haftung">
        <p>
          Wir erbringen die Leistung mit angemessener Sorgfalt, garantieren aber keinen bestimmten Lernerfolg.
          Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, außer bei Schäden an Leben, Körper
          oder Gesundheit.
        </p>
      </Section>
      <Section title="10. Änderungen & Recht">
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
