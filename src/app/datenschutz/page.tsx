"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/config";

// Datenschutzerklärung / Privacy policy – zweisprachig. Rechtlich prüfen lassen (siehe Ende).
export default function DatenschutzPage() {
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

          {lang === "en" ? <PrivacyEN /> : <PrivacyDE />}

          <div className="mt-8 flex gap-3">
            <Link href="/impressum" className="btn-outline px-5 py-2.5 inline-block">Legal notice</Link>
            <Link href="/" className="btn-outline px-5 py-2.5 inline-block">← Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function PrivacyEN() {
  return (
    <>
      <h1 className="text-3xl font-bold text-cream">Privacy Policy</h1>
      <p className="mt-3 text-sm">Last updated: July 2026</p>

      <Section title="1. Controller">
        <p>The controller responsible for data processing on this website is:</p>
        <p className="mt-2">
          German with Marvin LLC, Marvin Hagen Graf (Sole Member),<br />
          30 N Gould St Ste N, Sheridan, WY 82801, USA<br />
          Email: <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>
        </p>
      </Section>

      <Section title="2. General information">
        <p>
          We process personal data only to the extent necessary to provide a functional website and our
          content and services. The legal bases are in particular Art. 6(1)(b) GDPR (performance of a
          contract), (a) (consent) and (f) GDPR (legitimate interest).
        </p>
      </Section>

      <Section title="3. Accessing the website (hosting & server logs)">
        <p>
          This website is hosted by <strong>Vercel Inc.</strong> (Walnut, CA, USA). When you access the site,
          technically necessary data (e.g. IP address, date/time, page requested, browser type) is processed
          to deliver and secure the site (Art. 6(1)(f) GDPR).
        </p>
      </Section>

      <Section title="4. Registration & user account">
        <p>
          To use the platform you can create an account. We process your name, email address and password
          (stored encrypted), as well as your learning progress. Our backend provider is{" "}
          <strong>Supabase Inc.</strong> (Singapore; server infrastructure in the USA among others).
          Legal basis: Art. 6(1)(b) GDPR.
        </p>
      </Section>

      <Section title="5. Writing tasks & AI correction">
        <p>
          If you use the “Writing tasks” feature and submit a text for correction, that text is transmitted to{" "}
          <strong>Anthropic PBC</strong> (San Francisco, CA, USA) for automated language analysis. Please do
          not include particularly sensitive personal data in these texts. Legal basis: Art. 6(1)(b) GDPR.
        </p>
      </Section>

      <Section title="6. Video content (YouTube)">
        <p>
          Lesson videos are embedded via <strong>YouTube</strong> (Google Ireland Ltd.) in privacy-enhanced
          mode. In this mode YouTube sets cookies only once you actively play a video; data may then be
          transmitted to Google. Legal basis: Art. 6(1)(f) GDPR.
        </p>
      </Section>

      <Section title="7. Payments">
        <p>
          Access to paid content is handled exclusively via the external platforms <strong>Skool</strong> and{" "}
          <strong>Preply</strong>. Payments take place there; we do <strong>not</strong> collect or store any
          payment data on this website. The privacy policies of the respective platform also apply.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use technically necessary cookies to keep you signed in (login session). Without them, logging in
          is not possible. Legal basis: Art. 6(1)(f) GDPR / § 25(2) TDDDG (strictly necessary cookies).
        </p>
      </Section>

      <Section title="9. Recipients & transfers to third countries">
        <p>To provide our service we use the following processors:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Vercel Inc. (hosting, USA)</li>
          <li>Supabase Inc. (account &amp; database, USA/Singapore)</li>
          <li>Anthropic PBC (AI text correction, USA)</li>
          <li>Google Ireland Ltd. / YouTube (video hosting, EU/USA)</li>
        </ul>
        <p className="mt-2">
          This may involve transferring personal data to the USA. Where required, we base such transfers on
          appropriate safeguards (e.g. EU Standard Contractual Clauses under Art. 46 GDPR or the EU-US Data
          Privacy Framework where the provider is certified).
        </p>
      </Section>

      <Section title="10. Retention period">
        <p>
          We store personal data only as long as necessary for the stated purposes or as required by law. If
          you delete your account, the associated data is deleted unless retention obligations apply.
        </p>
      </Section>

      <Section title="11. Your rights">
        <p>Under the GDPR you have the following rights:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Access (Art. 15), rectification (Art. 16), erasure (Art. 17)</li>
          <li>Restriction of processing (Art. 18), data portability (Art. 20)</li>
          <li>Objection (Art. 21), withdrawal of consent (Art. 7(3) GDPR)</li>
        </ul>
        <p className="mt-2">
          To exercise your rights, a message to{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a> is enough.
        </p>
      </Section>

      <Section title="12. Right to lodge a complaint">
        <p>
          You have the right to lodge a complaint with a data protection supervisory authority, in particular
          in the Member State of your residence.
        </p>
      </Section>

      <p className="mt-10 text-xs italic">
        Note: This privacy policy was prepared to the best of our knowledge but does not constitute legal
        advice. Given the setup (a US company with US providers, users in the EU), we recommend a legal review
        before going fully live.
      </p>
    </>
  );
}

function PrivacyDE() {
  return (
    <>
      <h1 className="text-3xl font-bold text-cream">Datenschutzerklärung</h1>
      <p className="mt-3 text-sm">Stand: Juli 2026</p>

      <Section title="1. Verantwortlicher">
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <p className="mt-2">
          German with Marvin LLC, Marvin Hagen Graf (Sole Member),<br />
          30 N Gould St Ste N, Sheridan, WY 82801, USA<br />
          E-Mail: <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>
        </p>
      </Section>

      <Section title="2. Allgemeines zur Datenverarbeitung">
        <p>
          Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen
          Website sowie unserer Inhalte und Leistungen erforderlich ist. Rechtsgrundlagen sind insbesondere
          Art. 6 Abs. 1 lit. b DSGVO (Vertrag), lit. a (Einwilligung) und lit. f DSGVO (berechtigtes Interesse).
        </p>
      </Section>

      <Section title="3. Aufruf der Website (Server-Logs & Hosting)">
        <p>
          Diese Website wird bei <strong>Vercel Inc.</strong> (Walnut, CA, USA) gehostet. Beim Aufruf werden
          technisch notwendige Daten (z. B. IP-Adresse, Datum/Uhrzeit, abgerufene Seite, Browsertyp)
          verarbeitet, um die Auslieferung und Sicherheit der Seite zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
      </Section>

      <Section title="4. Registrierung & Nutzerkonto">
        <p>
          Für die Nutzung kannst du ein Konto anlegen. Wir verarbeiten Name, E-Mail-Adresse und Passwort
          (verschlüsselt gespeichert) sowie deinen Lernfortschritt. Backend-Dienstleister ist{" "}
          <strong>Supabase Inc.</strong> (Singapur; Serverinfrastruktur u. a. in den USA).
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </Section>

      <Section title="5. Schreibaufgaben & KI-Korrektur">
        <p>
          Reichst du über „Writing tasks" einen Text zur Korrektur ein, wird dieser zur automatisierten
          sprachlichen Auswertung an <strong>Anthropic PBC</strong> (San Francisco, USA) übermittelt. Bitte
          keine besonders sensiblen personenbezogenen Daten eingeben. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </Section>

      <Section title="6. Videoinhalte (YouTube)">
        <p>
          Lernvideos binden wir über <strong>YouTube</strong> (Google Ireland Ltd.) im erweiterten
          Datenschutzmodus ein. Cookies werden erst beim aktiven Abspielen gesetzt; dabei können Daten an
          Google übertragen werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </Section>

      <Section title="7. Zahlungen">
        <p>
          Der Zugang zu kostenpflichtigen Inhalten wird ausschließlich über <strong>Skool</strong> und{" "}
          <strong>Preply</strong> abgewickelt. Wir erheben und speichern <strong>keine</strong> Zahlungsdaten.
          Es gelten zusätzlich die Datenschutzbestimmungen der jeweiligen Plattform.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          Wir verwenden technisch notwendige Cookies, um deine Anmeldung (Login-Sitzung) aufrechtzuerhalten.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO / § 25 Abs. 2 TDDDG.
        </p>
      </Section>

      <Section title="9. Empfänger & Übermittlung in Drittländer">
        <p>Zur Bereitstellung unseres Angebots setzen wir folgende Auftragsverarbeiter ein:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Vercel Inc. (Hosting, USA)</li>
          <li>Supabase Inc. (Konto &amp; Datenbank, USA/Singapur)</li>
          <li>Anthropic PBC (KI-Textkorrektur, USA)</li>
          <li>Google Ireland Ltd. / YouTube (Videohosting, EU/USA)</li>
        </ul>
        <p className="mt-2">
          Dabei kann es zu einer Übermittlung in die USA kommen; soweit erforderlich, gestützt auf geeignete
          Garantien (EU-Standardvertragsklauseln nach Art. 46 DSGVO bzw. EU-US Data Privacy Framework).
        </p>
      </Section>

      <Section title="10. Speicherdauer">
        <p>
          Wir speichern Daten nur so lange, wie für die Zwecke erforderlich oder gesetzlich vorgeschrieben.
          Bei Kontolöschung werden die zugehörigen Daten gelöscht, soweit keine Aufbewahrungspflichten
          entgegenstehen.
        </p>
      </Section>

      <Section title="11. Deine Rechte">
        <p>Dir stehen nach der DSGVO folgende Rechte zu:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17)</li>
          <li>Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20)</li>
          <li>Widerspruch (Art. 21), Widerruf von Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p className="mt-2">
          Zur Ausübung genügt eine Nachricht an{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>.
        </p>
      </Section>

      <Section title="12. Beschwerderecht bei einer Aufsichtsbehörde">
        <p>
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, insbesondere im
          Mitgliedstaat deines Aufenthaltsorts.
        </p>
      </Section>

      <p className="mt-10 text-xs italic">
        Hinweis: Diese Datenschutzerklärung wurde nach bestem Wissen erstellt, ersetzt aber keine
        Rechtsberatung. Aufgrund der Konstellation (US-Gesellschaft mit US-Dienstleistern, Nutzer in der EU)
        empfehlen wir eine anwaltliche Prüfung vor dem produktiven Verkaufsstart.
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
