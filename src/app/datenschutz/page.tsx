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
      <p className="mt-3 text-sm">Last updated: November 2026</p>

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
        <p className="mt-2">
          We also use <strong>Vercel Analytics</strong> to measure aggregate site usage (e.g. page views and
          performance). It works without cookies and without cross-site tracking; the data is aggregated and is not
          used to identify you personally. Legal basis: Art. 6(1)(f) GDPR.
        </p>
      </Section>

      <Section title="4. Registration & user account">
        <p>
          To use the platform you can create an account. We process your name, email address and password
          (stored only as a secure one-way hash by our authentication provider), as well as your learning progress.
          Our backend provider is{" "}
          <strong>Supabase Inc.</strong> (Singapore; server infrastructure in the USA among others).
          Legal basis: Art. 6(1)(b) GDPR.
        </p>
        <p className="mt-2">
          To prevent fraud and abuse — for example the misuse of free trials via multiple accounts — we may store the
          IP address used at sign-up and at your last login. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in
          securing our service).
        </p>
        <p className="mt-2">
          When you book a 1-on-1 lesson, enrol in the B1 group course or request a free trial lesson, we process the
          details you provide (such as your name, email address and the requested time) to carry out the booking or
          enrolment. Legal basis: Art. 6(1)(b) GDPR.
        </p>
        <p className="mt-2">
          You can optionally upload a profile photo. It is stored with our backend provider (Supabase) and served from
          a publicly reachable URL. We process it only to display your profile; legal basis: Art. 6(1)(a)/(b) GDPR. You
          can replace or remove it at any time in your profile.
        </p>
      </Section>

      <Section title="5. Payments">
        <p>
          Subscription payments are processed by <strong>Stripe</strong> (Managed Payments / Merchant of
          Record). Stripe collects the payment and handles applicable tax; we do <strong>not</strong> store
          card details. You get instant access after checkout and can cancel anytime. Legal basis: Art.
          6(1)(b) GDPR.
        </p>
      </Section>

      <Section title="6. Video content (YouTube)">
        <p>
          Lesson videos are embedded via <strong>YouTube</strong> (Google Ireland Ltd.) in privacy-enhanced
          mode. In this mode YouTube sets cookies only once you actively play a video; data may then be
          transmitted to Google. Legal basis: Art. 6(1)(f) GDPR.
        </p>
      </Section>

      <Section title="7. Google Calendar integration (Google user data)">
        <p>
          Our teacher can connect a Google Calendar to the booking system so that your 1-on-1 lessons are added
          to the calendar and existing appointments are taken into account when showing available times. This
          Google connection is used <strong>only by the account owner (the teacher)</strong>; students do not
          connect their own Google accounts.
        </p>
        <p className="mt-2">When the calendar is connected, we request the following Google OAuth scopes:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>.../auth/calendar.events</strong> — to create and remove the lesson appointments we schedule;</li>
          <li><strong>.../auth/calendar.readonly</strong> — to read existing busy times so that lessons are not double-booked;</li>
          <li><strong>openid</strong> and <strong>email</strong> — to identify and confirm the Google account being connected. We store that account&apos;s email address so the owner can see which account is linked.</li>
        </ul>
        <p className="mt-2">
          <strong>How we protect this data:</strong> Google access tokens are stored encrypted and transmitted only
          over encrypted connections (TLS/HTTPS). They are kept in access-controlled infrastructure (Supabase)
          protected by row-level security and restricted to the owner&apos;s account. We access calendar data only
          to show availability and to manage lesson appointments — we do not otherwise read, store or share your
          calendar content.
        </p>
        <p className="mt-2">
          <strong>No secondary use:</strong> Google user data is never used for advertising, is not sold, and is not
          used to develop, improve or train generalized AI/ML models. It is not shared with third parties except as
          strictly necessary to provide this feature or where required by law.
        </p>
        <p className="mt-2">
          <strong>Revoking access:</strong> The owner can disconnect the calendar at any time in the app and can
          revoke access at{" "}
          <a href="https://myaccount.google.com/permissions" className="text-gold-bright underline underline-offset-4">myaccount.google.com/permissions</a>.
          On disconnection or account deletion, the stored Google tokens are deleted.
        </p>
        <p className="mt-2">
          <strong>Limited Use:</strong> Our use and transfer to any other app of information received from Google APIs
          will adhere to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-gold-bright underline underline-offset-4">Google API Services User Data Policy</a>,
          including the Limited Use requirements.
        </p>
      </Section>

      <Section title="8. Access codes">
        <p>
          Some students unlock the app with an access code obtained through external platforms. Any payments made
          on those platforms are handled by the respective providers under their own privacy policies.
        </p>
      </Section>

      <Section title="9. Cookies &amp; advertising measurement">
        <p>
          We use technically necessary cookies to keep you signed in (login session). Without them, logging in
          is not possible. Legal basis: Art. 6(1)(f) GDPR / § 25(2) TDDDG (strictly necessary cookies).
        </p>
        <p className="mt-2">
          With your consent we use <strong>Google Ads</strong> (Google Ireland Ltd.) to measure the success of our
          advertising — for example whether a sign-up followed an ad click. This may set cookies and, for
          &quot;enhanced conversions&quot;, transmit a <strong>hashed (irreversible) form of your email address</strong> to
          Google to match a conversion. We use Google Consent Mode: in the EU/EEA, UK and Switzerland these
          technologies stay disabled until you agree in the cookie banner, and you can decline. Legal basis:
          Art. 6(1)(a) GDPR / § 25(1) TDDDG (consent).
        </p>
        <p className="mt-2">
          With your consent we also use the <strong>Meta Pixel</strong> (Meta Platforms Ireland Ltd.) to measure the
          success of our Facebook/Instagram advertising — for example whether a sign-up, registration or purchase
          followed an ad. The Meta Pixel loads <strong>only after</strong> you agree in the cookie banner and may then
          transmit event data (and, for a purchase, the amount) to Meta. You can decline, and it stays disabled until
          you consent. Legal basis: Art. 6(1)(a) GDPR / § 25(1) TDDDG (consent).
        </p>
        <p className="mt-2">
          For the Meta Pixel — and, as far as applicable, Google Ads conversion measurement — we and the provider act
          as joint controllers for the collection and transmission of the event data (Art. 26 GDPR). The
          provider&apos;s own, subsequent processing takes place under its sole responsibility and its privacy policy;
          the essential terms are set out in the provider&apos;s controller addendum.
        </p>
      </Section>

      <Section title="10. Live video lessons (Google Meet)">
        <p>
          1-on-1 lessons, the B1 group course and the free trial lesson take place as a video call via{" "}
          <strong>Google Meet</strong> (Google Ireland Ltd.). When you join a call, Google processes connection data
          and the audio, video and any chat you share during the session so that the call can take place. We use
          Google Meet only to hold the lessons. Legal basis: Art. 6(1)(b) GDPR (performance of the lesson/course) and,
          for the free trial lesson, Art. 6(1)(f) GDPR. Google&apos;s own processing is described in Google&apos;s
          privacy policy.
        </p>
      </Section>
      <Section title="11. Emails, newsletters &amp; lead forms (Resend)">
        <p>
          We send service emails (for example about your account, bookings, lesson reminders and course
          confirmations) and, where you have agreed, marketing emails with learning tips and offers. Delivery is
          handled by our processor <strong>Resend, Inc.</strong> (USA); we transmit your email address, your name
          where provided, and the message content.
        </p>
        <p className="mt-2">
          On our free offers — such as the free B1 practice test and the free A1 story PDF — you can enter your email
          (and optionally your name) to receive your result or the material plus further tips. For newsletters we use
          a <strong>double opt-in</strong>: marketing emails are only sent after you confirm your address via a
          confirmation link. For this we store your email, any name, the relevant result or request (e.g. your B1 test
          result or a requested trial-lesson time), the consent text and the time of sign-up and confirmation as proof
          of consent. Legal basis: Art. 6(1)(a) GDPR and § 7 UWG (consent).
        </p>
        <p className="mt-2">
          You can withdraw your consent at any time with effect for the future — every marketing email contains an
          unsubscribe link, and a message to{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>{" "}
          is enough. Service emails that are necessary to run your account or a booking are sent on the basis of
          Art. 6(1)(b) GDPR.
        </p>
      </Section>
      <Section title="12. AI writing feedback (exam trainer)">
        <p>
          Our exam trainer can give you automated feedback on texts you write (for example a practice letter or
          essay). To generate it, the text you submit is sent — together with the task and your target level — to our
          AI processor <strong>Anthropic</strong> (Anthropic PBC, USA), which returns a score and corrections. Please
          do not enter unnecessary personal data into practice texts.
        </p>
        <p className="mt-2">
          The feedback is produced automatically and is a learning aid, not an official exam assessment. Under
          Anthropic&apos;s commercial API terms, data sent through the API is not used to train its models. We also
          store the submission and usage counts in our database to apply fair-use limits. Legal basis: Art. 6(1)(b)
          GDPR (providing the exam-trainer feature). This feedback is purely advisory and is not an automated decision
          producing legal or similarly significant effects within the meaning of Art. 22 GDPR.
        </p>
      </Section>
      <Section title="13. Recipients & transfers to third countries">
        <p>To provide our service we use the following processors:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Vercel Inc. (hosting &amp; aggregate analytics, USA)</li>
          <li>Supabase Inc. (account &amp; database, USA/Singapore)</li>
          <li>Stripe (payment processing / merchant of record, USA &amp; Ireland)</li>
          <li>Resend, Inc. (email delivery, USA)</li>
          <li>Anthropic PBC (AI writing feedback in the exam trainer, USA)</li>
          <li>Google Ireland Ltd. / Google LLC (YouTube video hosting; Google Ads conversion measurement; Google Calendar API and Google Meet for lessons and the booking integration; EU/USA)</li>
          <li>Meta Platforms Ireland Ltd. / Meta Platforms, Inc. (Meta Pixel advertising measurement, only with your consent; EU/USA)</li>
        </ul>
        <p className="mt-2">
          This may involve transferring personal data to the USA and, for Supabase, to Singapore. Where a country is
          not covered by an EU adequacy decision, we base the transfer on appropriate safeguards — EU Standard
          Contractual Clauses under Art. 46 GDPR, or the EU-US Data Privacy Framework for providers certified under it.
          You can request a copy of the relevant safeguards from us at the contact email above.
        </p>
      </Section>

      <Section title="14. Retention period">
        <p>
          We store personal data only as long as necessary for the stated purposes or as required by law. If
          you delete your account, the associated data is deleted unless retention obligations apply. As a guide:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Account and learning data: until you delete your account.</li>
          <li>Newsletter and consent records: while you are subscribed and, as proof of consent, for the statutory limitation period after you unsubscribe.</li>
          <li>Sign-up/last-login IP used for abuse prevention: for a limited period only.</li>
          <li>Exam-trainer submissions: kept briefly to show your feedback and apply fair-use limits.</li>
          <li>Billing and tax-relevant data (via Stripe): for the statutory retention periods (generally 6–10 years).</li>
        </ul>
      </Section>

      <Section title="15. Your rights">
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

      <Section title="16. Right to lodge a complaint">
        <p>
          You have the right to lodge a complaint with a data protection supervisory authority, in particular
          in the Member State of your residence.
        </p>
      </Section>

    </>
  );
}

function PrivacyDE() {
  return (
    <>
      <h1 className="text-3xl font-bold text-cream">Datenschutzerklärung</h1>
      <p className="mt-3 text-sm">Stand: November 2026</p>

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
        <p className="mt-2">
          Außerdem nutzen wir <strong>Vercel Analytics</strong>, um die Websitenutzung aggregiert zu messen (z. B.
          Seitenaufrufe und Performance). Dies funktioniert ohne Cookies und ohne seitenübergreifendes Tracking; die
          Daten werden aggregiert und nicht zu deiner persönlichen Identifizierung genutzt. Rechtsgrundlage: Art. 6
          Abs. 1 lit. f DSGVO.
        </p>
      </Section>

      <Section title="4. Registrierung & Nutzerkonto">
        <p>
          Für die Nutzung kannst du ein Konto anlegen. Wir verarbeiten Name, E-Mail-Adresse und Passwort
          (nur als sicherer, nicht umkehrbarer Hash durch unseren Authentifizierungs-Dienstleister gespeichert) sowie
          deinen Lernfortschritt. Backend-Dienstleister ist{" "}
          <strong>Supabase Inc.</strong> (Singapur; Serverinfrastruktur u. a. in den USA).
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
        <p className="mt-2">
          Zur Verhinderung von Missbrauch und Betrug – etwa Mehrfachkonten zur Ausnutzung von Gratis-Tests – können wir
          die bei Registrierung und letztem Login verwendete IP-Adresse speichern. Rechtsgrundlage: Art. 6 Abs. 1 lit.
          f DSGVO (berechtigtes Interesse an der Sicherheit unseres Angebots).
        </p>
        <p className="mt-2">
          Wenn du eine Einzelstunde buchst, dich für den B1-Gruppenkurs anmeldest oder eine kostenlose Probestunde
          anfragst, verarbeiten wir die von dir angegebenen Daten (z. B. Name, E-Mail-Adresse und Wunschzeit), um die
          Buchung bzw. Anmeldung durchzuführen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
        <p className="mt-2">
          Optional kannst du ein Profilbild hochladen. Es wird bei unserem Backend-Dienstleister (Supabase) gespeichert
          und über eine öffentlich erreichbare URL ausgeliefert. Wir verarbeiten es nur zur Anzeige deines Profils;
          Rechtsgrundlage: Art. 6 Abs. 1 lit. a/b DSGVO. Du kannst es jederzeit in deinem Profil ersetzen oder
          entfernen.
        </p>
      </Section>

      <Section title="5. Zahlungen">
        <p>
          Abo-Zahlungen werden über <strong>Stripe</strong> (Managed Payments / Merchant of Record)
          abgewickelt. Stripe zieht die Zahlung ein und kümmert sich um die Umsatzsteuer; wir speichern
          <strong> keine</strong> Kartendaten. Nach dem Checkout gibt es sofort Zugang, jederzeit kündbar.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </Section>

      <Section title="6. Videoinhalte (YouTube)">
        <p>
          Lernvideos binden wir über <strong>YouTube</strong> (Google Ireland Ltd.) im erweiterten
          Datenschutzmodus ein. Cookies werden erst beim aktiven Abspielen gesetzt; dabei können Daten an
          Google übertragen werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </Section>

      <Section title="7. Google-Kalender-Anbindung (Google-Nutzerdaten)">
        <p>
          Unser Lehrer kann einen Google-Kalender mit dem Buchungssystem verbinden, damit deine 1:1-Stunden in
          den Kalender eingetragen und bereits bestehende Termine bei der Anzeige freier Zeiten berücksichtigt
          werden. Diese Google-Verbindung nutzt <strong>ausschließlich der Kontoinhaber (der Lehrer)</strong>;
          Schüler verbinden keine eigenen Google-Konten.
        </p>
        <p className="mt-2">Bei verbundenem Kalender fordern wir die folgenden Google-OAuth-Scopes an:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>.../auth/calendar.events</strong> — zum Anlegen und Entfernen der von uns geplanten Stundentermine;</li>
          <li><strong>.../auth/calendar.readonly</strong> — zum Lesen bestehender Belegt-Zeiten, damit Stunden nicht doppelt gebucht werden;</li>
          <li><strong>openid</strong> und <strong>email</strong> — zur Identifizierung und Bestätigung des verbundenen Google-Kontos. Wir speichern die E-Mail-Adresse dieses Kontos, damit der Inhaber sieht, welches Konto verknüpft ist.</li>
        </ul>
        <p className="mt-2">
          <strong>Schutz dieser Daten:</strong> Google-Zugriffstoken werden verschlüsselt gespeichert und nur über
          verschlüsselte Verbindungen (TLS/HTTPS) übertragen. Sie liegen in zugriffsgeschützter Infrastruktur
          (Supabase) mit Row-Level-Security und sind auf das Konto des Inhabers beschränkt. Wir greifen auf
          Kalenderdaten ausschließlich zu, um Verfügbarkeiten anzuzeigen und Stundentermine zu verwalten — darüber
          hinaus lesen, speichern oder teilen wir deine Kalenderinhalte nicht.
        </p>
        <p className="mt-2">
          <strong>Keine Zweitverwendung:</strong> Google-Nutzerdaten werden niemals für Werbung verwendet, nicht
          verkauft und nicht zur Entwicklung, Verbesserung oder zum Training allgemeiner KI-/ML-Modelle genutzt.
          Eine Weitergabe an Dritte erfolgt nur, soweit für die Funktion zwingend erforderlich oder gesetzlich
          vorgeschrieben.
        </p>
        <p className="mt-2">
          <strong>Widerruf:</strong> Der Inhaber kann den Kalender jederzeit in der App trennen und den Zugriff
          unter{" "}
          <a href="https://myaccount.google.com/permissions" className="text-gold-bright underline underline-offset-4">myaccount.google.com/permissions</a>{" "}
          widerrufen. Beim Trennen oder bei Kontolöschung werden die gespeicherten Google-Token gelöscht.
        </p>
        <p className="mt-2">
          <strong>Limited Use:</strong> Die Nutzung und Weitergabe von Informationen, die wir über Google-APIs
          erhalten, an andere Apps erfolgt im Einklang mit der{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-gold-bright underline underline-offset-4">Google API Services User Data Policy</a>,
          einschließlich der Limited-Use-Anforderungen.
        </p>
      </Section>

      <Section title="8. Zugangscodes">
        <p>
          Manche Schüler schalten die App per Zugangscode frei, den sie über externe Plattformen erhalten.
          Etwaige Zahlungen auf diesen Plattformen wickeln die jeweiligen Anbieter unter ihren eigenen
          Datenschutzbestimmungen ab.
        </p>
      </Section>

      <Section title="9. Cookies &amp; Werbe-Erfolgsmessung">
        <p>
          Wir verwenden technisch notwendige Cookies, um deine Anmeldung (Login-Sitzung) aufrechtzuerhalten. Ohne sie
          ist eine Anmeldung nicht möglich. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO / § 25 Abs. 2 TDDDG
          (unbedingt erforderliche Cookies).
        </p>
        <p className="mt-2">
          Mit deiner Einwilligung nutzen wir <strong>Google Ads</strong> (Google Ireland Ltd.) zur Erfolgsmessung
          unserer Werbung — z. B. ob nach einem Anzeigenklick eine Registrierung erfolgte. Dabei können Cookies
          gesetzt und für &quot;Enhanced Conversions&quot; eine <strong>gehashte (nicht umkehrbare) Fassung deiner
          E-Mail-Adresse</strong> an Google übermittelt werden, um eine Conversion zuzuordnen. Wir setzen den
          Google Consent Mode ein: In der EU/im EWR, in UK und der Schweiz bleiben diese Technologien deaktiviert,
          bis du im Cookie-Banner zustimmst; du kannst ablehnen. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO /
          § 25 Abs. 1 TDDDG (Einwilligung).
        </p>
        <p className="mt-2">
          Mit deiner Einwilligung nutzen wir außerdem den <strong>Meta-Pixel</strong> (Meta Platforms Ireland Ltd.) zur
          Erfolgsmessung unserer Facebook-/Instagram-Werbung — z. B. ob nach einer Anzeige eine Anmeldung,
          Registrierung oder ein Kauf erfolgte. Der Meta-Pixel wird <strong>erst geladen</strong>, nachdem du im
          Cookie-Banner zustimmst, und kann dann Ereignisdaten (bei einem Kauf auch den Betrag) an Meta übermitteln.
          Du kannst ablehnen; bis zur Einwilligung bleibt er deaktiviert. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO /
          § 25 Abs. 1 TDDDG (Einwilligung).
        </p>
        <p className="mt-2">
          Für den Meta-Pixel — und, soweit einschlägig, die Google-Ads-Conversion-Messung — sind wir und der Anbieter
          für die Erhebung und Übermittlung der Ereignisdaten gemeinsam Verantwortliche (Art. 26 DSGVO). Die eigene,
          nachgelagerte Verarbeitung durch den Anbieter erfolgt in dessen alleiniger Verantwortung und nach dessen
          Datenschutzerklärung; die wesentlichen Punkte ergeben sich aus dem Controller-Addendum des Anbieters.
        </p>
      </Section>

      <Section title="10. Live-Videounterricht (Google Meet)">
        <p>
          Einzelstunden, der B1-Gruppenkurs und die kostenlose Probestunde finden als Videocall über{" "}
          <strong>Google Meet</strong> (Google Ireland Ltd.) statt. Beim Beitritt verarbeitet Google Verbindungsdaten
          sowie das von dir freigegebene Audio, Video und einen etwaigen Chat während der Sitzung, damit der Call
          stattfinden kann. Wir nutzen Google Meet ausschließlich zur Durchführung des Unterrichts. Rechtsgrundlage:
          Art. 6 Abs. 1 lit. b DSGVO (Durchführung der Stunde/des Kurses) bzw. für die kostenlose Probestunde Art. 6
          Abs. 1 lit. f DSGVO. Die eigene Verarbeitung durch Google ist in Googles Datenschutzerklärung beschrieben.
        </p>
      </Section>
      <Section title="11. E-Mails, Newsletter &amp; Lead-Formulare (Resend)">
        <p>
          Wir versenden Service-E-Mails (z. B. zu Konto, Buchungen, Stunden-Erinnerungen und Kursbestätigungen) und –
          sofern du zugestimmt hast – Marketing-E-Mails mit Lerntipps und Angeboten. Den Versand übernimmt unser
          Auftragsverarbeiter <strong>Resend, Inc.</strong> (USA); übermittelt werden deine E-Mail-Adresse, ggf. dein
          Name und der Nachrichteninhalt.
        </p>
        <p className="mt-2">
          Bei unseren kostenlosen Angeboten – etwa dem kostenlosen B1-Übungstest und dem kostenlosen
          A1-Geschichten-PDF – kannst du deine E-Mail (und optional deinen Namen) angeben, um dein Ergebnis bzw. das
          Material und weitere Tipps zu erhalten. Für Newsletter nutzen wir ein <strong>Double-Opt-in</strong>:
          Marketing-E-Mails senden wir erst, nachdem du deine Adresse über einen Bestätigungslink bestätigt hast. Dazu
          speichern wir deine E-Mail, ggf. den Namen, das jeweilige Ergebnis bzw. die Anfrage (z. B. dein
          B1-Testergebnis oder einen Wunschtermin für die Probestunde), den Einwilligungstext sowie den Zeitpunkt von
          Anmeldung und Bestätigung als Einwilligungsnachweis. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO und § 7 UWG
          (Einwilligung).
        </p>
        <p className="mt-2">
          Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen – jede Marketing-E-Mail enthält
          einen Abmeldelink, und eine Nachricht an{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>{" "}
          genügt. Service-E-Mails, die zur Durchführung deines Kontos oder einer Buchung erforderlich sind, versenden
          wir auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </Section>
      <Section title="12. KI-Schreib-Feedback (Prüfungstrainer)">
        <p>
          Unser Prüfungstrainer kann dir automatisiertes Feedback zu selbst verfassten Texten geben (z. B. einem
          Übungsbrief oder Aufsatz). Zur Erstellung wird der von dir eingegebene Text – zusammen mit der Aufgabe und
          deinem Zielniveau – an unseren KI-Auftragsverarbeiter <strong>Anthropic</strong> (Anthropic PBC, USA)
          übermittelt, der eine Bewertung und Korrekturen zurückgibt. Bitte gib in Übungstexte keine unnötigen
          personenbezogenen Daten ein.
        </p>
        <p className="mt-2">
          Das Feedback wird automatisch erstellt und ist eine Lernhilfe, keine offizielle Prüfungsbewertung. Nach den
          Bedingungen der kommerziellen Anthropic-API werden über die API übermittelte Daten nicht zum Training der
          Modelle verwendet. Zur Einhaltung von Fair-Use-Limits speichern wir die Abgabe und Nutzungszähler zusätzlich
          in unserer Datenbank. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des Prüfungstrainers).
          Dieses Feedback ist rein beratend und stellt keine automatisierte Entscheidung mit rechtlicher oder ähnlich
          erheblicher Wirkung im Sinne von Art. 22 DSGVO dar.
        </p>
      </Section>
      <Section title="13. Empfänger & Übermittlung in Drittländer">
        <p>Zur Bereitstellung unseres Angebots setzen wir folgende Auftragsverarbeiter ein:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Vercel Inc. (Hosting &amp; aggregierte Analyse, USA)</li>
          <li>Supabase Inc. (Konto &amp; Datenbank, USA/Singapur)</li>
          <li>Stripe (Zahlungsabwicklung / Merchant of Record, USA &amp; Irland)</li>
          <li>Resend, Inc. (E-Mail-Versand, USA)</li>
          <li>Anthropic PBC (KI-Schreib-Feedback im Prüfungstrainer, USA)</li>
          <li>Google Ireland Ltd. / Google LLC (YouTube-Videohosting; Google-Ads-Conversion-Messung; Google Calendar API und Google Meet für Stunden und die Buchungsanbindung; EU/USA)</li>
          <li>Meta Platforms Ireland Ltd. / Meta Platforms, Inc. (Meta-Pixel-Werbemessung, nur mit deiner Einwilligung; EU/USA)</li>
        </ul>
        <p className="mt-2">
          Dabei kann es zu einer Übermittlung in die USA und – bei Supabase – nach Singapur kommen. Soweit ein Land
          nicht durch einen EU-Angemessenheitsbeschluss abgedeckt ist, stützen wir die Übermittlung auf geeignete
          Garantien – EU-Standardvertragsklauseln nach Art. 46 DSGVO oder das EU-US Data Privacy Framework bei danach
          zertifizierten Anbietern. Eine Kopie der jeweiligen Garantien kannst du bei uns über die oben genannte
          Kontaktadresse anfordern.
        </p>
      </Section>

      <Section title="14. Speicherdauer">
        <p>
          Wir speichern Daten nur so lange, wie für die Zwecke erforderlich oder gesetzlich vorgeschrieben.
          Bei Kontolöschung werden die zugehörigen Daten gelöscht, soweit keine Aufbewahrungspflichten
          entgegenstehen. Als Orientierung:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Konto- und Lerndaten: bis zur Löschung deines Kontos.</li>
          <li>Newsletter- und Einwilligungsnachweise: solange du angemeldet bist und – als Einwilligungsnachweis – für die Dauer der gesetzlichen Verjährungsfrist nach deiner Abmeldung.</li>
          <li>IP-Adresse bei Registrierung/letztem Login zur Missbrauchsverhinderung: nur für einen begrenzten Zeitraum.</li>
          <li>Abgaben im Prüfungstrainer: kurz, um dir dein Feedback anzuzeigen und Fair-Use-Limits anzuwenden.</li>
          <li>Abrechnungs- und steuerrelevante Daten (über Stripe): für die gesetzlichen Aufbewahrungsfristen (i. d. R. 6–10 Jahre).</li>
        </ul>
      </Section>

      <Section title="15. Deine Rechte">
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

      <Section title="16. Beschwerderecht bei einer Aufsichtsbehörde">
        <p>
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, insbesondere im
          Mitgliedstaat deines Aufenthaltsorts.
        </p>
      </Section>

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
