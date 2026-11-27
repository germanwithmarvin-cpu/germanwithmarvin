"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE, priceLabel, LESSON, GROUP_COURSE, eurLabel } from "@/lib/config";

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
      <p className="mt-3 text-sm">Last updated: November 2026</p>

      <Section title="1. Provider">
        <p>German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA. Contact: {SITE.contactEmail}.</p>
      </Section>
      <Section title="2. Service">
        <p>
          We provide an online German-learning subscription: video lessons, interactive exercises, a flashcard and
          vocabulary trainer, reading stories and an exam trainer with automated, AI-generated writing feedback —
          accessible via your account on this website.
        </p>
        <p className="mt-2">
          The AI writing feedback is a learning aid to help you practise. It is generated automatically, may contain
          mistakes, and is not an official exam assessment or a guarantee of any exam result.
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
          The monthly subscription costs {priceLabel()} per month and renews automatically each month until
          cancelled. A yearly plan is also available as a single payment for 12 months of access; it does not
          renew automatically. Payment is processed by Stripe. Prices shown exclude tax; any applicable VAT/sales
          tax is added at checkout based on your location. Where we offer a discount or promotional code, it reduces
          the price shown at checkout and has no cash value.
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
          withdrawal period is 14 days from the day the contract is concluded. To exercise it, inform us —
          German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA, {SITE.contactEmail} — by a clear
          statement (e.g. a letter or email). You may use the model withdrawal form below, but it is not mandatory.
          Sending your notice before the period ends is enough to meet the deadline.
        </p>
        <p className="mt-2 font-medium text-cream">Early expiry for digital services:</p>
        <p>
          As the service is a digital service with immediate access, you expressly agree that we begin
          providing it right after checkout and you acknowledge that you thereby <strong>lose your right of
          withdrawal</strong> once performance has begun (§ 356(5) BGB).
        </p>
        <p className="mt-2"><span className="font-medium text-cream">Effects of withdrawal:</span> if you withdraw in
          time, we refund all payments received from you without undue delay and within 14 days, using the same means
          of payment you used. If you asked us to begin a paid service during the withdrawal period, you owe a
          proportionate amount for the part already provided up to your withdrawal.</p>
        <p className="mt-2"><span className="font-medium text-cream">Model withdrawal form</span> (complete and return
          only if you wish to withdraw):</p>
        <p className="mt-1 italic">
          To German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA, {SITE.contactEmail}: I/We hereby
          give notice that I/we withdraw from my/our contract for the following service: ____. Ordered on: ____. Name
          of consumer(s): ____. Address of consumer(s): ____. Date: ____.
        </p>
        <p className="mt-2">After checkout we confirm the contract and this information on a durable medium (e.g. by email).</p>
      </Section>
      <Section title="7. Live 1-on-1 lessons (optional)">
        <p>
          Separately from the app subscription, you can subscribe to a monthly package of private 1-on-1 lessons
          ({LESSON.durationMin} minutes each). You choose how many lessons per month (minimum {LESSON.minHours}). The
          price is ${LESSON.pricePerHour} per lesson. This lesson subscription renews automatically each month and is billed via Stripe.
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
        <p className="mt-2"><span className="font-medium text-cream">Free trial lesson:</span> we may offer one free
          trial lesson per teacher so you can try a lesson before subscribing. It is free of charge, held via Google
          Meet, and the usual booking and no-show rules apply.</p>
      </Section>
      <Section title="8. B1 live exam-prep group course">
        <p>
          Separately from the app subscription, we offer a paid B1 exam-preparation live group course. It runs for{" "}
          {GROUP_COURSE.weeks} weeks with {GROUP_COURSE.totalSessions} live online sessions
          ({GROUP_COURSE.sessionsPerWeek} per week, {GROUP_COURSE.durationMin} minutes each), held by video call
          (Google Meet) in a small group of up to {GROUP_COURSE.maxSeats} participants.
        </p>
        <p className="mt-2">
          The course is a <span className="font-medium text-cream">one-time payment of {eurLabel(GROUP_COURSE.priceEur)}</span>{" "}
          (plus applicable tax, added at checkout based on your location). It is not a subscription and does not renew.
          Payment is processed by Stripe.
        </p>
        <p className="mt-2"><span className="font-medium text-cream">Included app access:</span> the course includes
          {" "}{GROUP_COURSE.appAccessDays} days of free full access to the learning app (otherwise {priceLabel()} per
          month). This access is part of the course, starts with the course and ends automatically when the
          {" "}{GROUP_COURSE.appAccessDays} days expire — it does not turn into a paid subscription.</p>
        <p className="mt-2"><span className="font-medium text-cream">Minimum participants:</span> at least
          {" "}{GROUP_COURSE.minSeats} participants are required. If the group does not reach this minimum, the course
          does not take place and you receive a full refund within 14 days to your original payment method.</p>
        <p className="mt-2"><span className="font-medium text-cream">Missed sessions:</span> the live sessions follow a
          fixed schedule. If you miss a session we share the materials where possible, but individual sessions cannot
          be refunded or rescheduled.</p>
        <p className="mt-2"><span className="font-medium text-cream">Right of withdrawal:</span> as a consumer in the
          EU you have a 14-day right of withdrawal from the course purchase. If the course or the included app access
          begins within this period, you expressly request early performance and acknowledge that your right of
          withdrawal lapses once the course has been fully performed (§ 356(4) German Civil Code), and that the
          included digital app access follows the same early-expiry rule as in section 6. If you withdraw before
          performance begins, you receive a full refund.</p>
        <p className="mt-2"><span className="font-medium text-cream">Free trial session (Probestunde):</span> before
          the course you can join a free, non-binding live group trial session via Google Meet at a fixed weekly time.
          No payment or account is required.</p>
      </Section>
      <Section title="9. Free trial & access codes">
        <p>
          New users can start a <span className="font-medium text-cream">free trial</span> of the learning app without
          entering payment details. The trial is time-limited and ends automatically — there is no automatic charge,
          and no paid subscription is created unless you actively choose a paid plan and complete checkout.
        </p>
        <p className="mt-2">
          Some users unlock the app with an <span className="font-medium text-cream">access code</span> bought on an
          external platform (for example Preply or Skool). Those purchases are governed by the respective
          platform&apos;s own terms and privacy policy.
        </p>
      </Section>
      <Section title="10. Content & fair use">
        <p>
          All content (videos, exercises, texts) is protected and provided for your personal learning only.
          Sharing your account or redistributing content is not permitted.
        </p>
      </Section>
      <Section title="11. Liability">
        <p>
          We provide the service with reasonable care but do not guarantee specific learning outcomes. We are liable
          without limitation for intent and gross negligence and for damage to life, body or health. For slight
          negligence we are liable only where we breach an essential contractual duty (a duty whose fulfilment makes
          proper performance of the contract possible and on which you may regularly rely), and then only for the
          foreseeable, contract-typical damage. Mandatory liability, for example under product-liability law, remains
          unaffected.
        </p>
      </Section>
      <Section title="12. Changes & governing law">
        <p>
          We may update these terms. We will announce material changes at least 30 days before they take effect and
          explain them. For an ongoing contract such a change takes effect only if you do not object before the stated
          date; we will point this out in the notice, and if you object you may terminate to the end of the paid
          period. Statutory consumer-protection rules of your country of residence remain unaffected.
        </p>
      </Section>

    </>
  );
}

function TermsDE() {
  return (
    <>
      <h1 className="text-3xl font-bold text-cream">AGB &amp; Widerruf</h1>
      <p className="mt-3 text-sm">Stand: November 2026</p>

      <Section title="1. Anbieter">
        <p>German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA. Kontakt: {SITE.contactEmail}.</p>
      </Section>
      <Section title="2. Leistung">
        <p>
          Wir bieten ein Online-Abo zum Deutschlernen: Videolektionen, interaktive Aufgaben, einen Karteikarten- und
          Vokabeltrainer, Lesegeschichten und einen Prüfungstrainer mit automatischem, KI-gestütztem Schreib-Feedback
          – zugänglich über dein Konto auf dieser Website.
        </p>
        <p className="mt-2">
          Das KI-Schreib-Feedback ist eine Lernhilfe zum Üben. Es wird automatisch erzeugt, kann Fehler enthalten und
          ist weder eine offizielle Prüfungsbewertung noch eine Garantie für ein Prüfungsergebnis.
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
          Das Monatsabo kostet {priceLabel()} pro Monat und verlängert sich automatisch monatlich, bis es
          gekündigt wird. Alternativ gibt es einen Jahreszugang als Einmalzahlung für 12 Monate, der sich nicht
          automatisch verlängert. Die Zahlung wickelt Stripe ab. Die angegebenen Preise verstehen sich zzgl. der
          jeweils anwendbaren Steuer (USt./VAT), die Stripe standortabhängig an der Kasse aufschlägt. Sofern wir einen
          Rabatt- oder Aktionscode anbieten, reduziert er den an der Kasse angezeigten Preis und hat keinen Barwert.
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
          Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsschlusses. Zur Ausübung informiere uns –
          German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA, {SITE.contactEmail} – mittels einer
          eindeutigen Erklärung (z. B. Brief oder E-Mail). Du kannst dafür das unten stehende Muster-Widerrufsformular
          verwenden, musst es aber nicht. Zur Wahrung der Frist genügt es, die Erklärung vor Fristablauf abzusenden.
        </p>
        <p className="mt-2 font-medium text-cream">Vorzeitiges Erlöschen bei digitalen Leistungen:</p>
        <p>
          Da es sich um eine digitale Leistung mit sofortigem Zugang handelt, stimmst du ausdrücklich zu, dass
          wir direkt nach dem Checkout mit der Ausführung beginnen, und bestätigst, dass du damit dein{" "}
          <strong>Widerrufsrecht verlierst</strong>, sobald mit der Ausführung begonnen wurde (§ 356 Abs. 5 BGB).
        </p>
        <p className="mt-2"><span className="font-medium text-cream">Folgen des Widerrufs:</span> Wenn du rechtzeitig
          widerrufst, erstatten wir dir alle erhaltenen Zahlungen unverzüglich und spätestens binnen 14 Tagen über
          dasselbe Zahlungsmittel zurück. Hast du verlangt, dass eine kostenpflichtige Dienstleistung während der
          Widerrufsfrist beginnt, schuldest du einen anteiligen Betrag für die bis zum Widerruf bereits erbrachte
          Leistung.</p>
        <p className="mt-2"><span className="font-medium text-cream">Muster-Widerrufsformular</span> (nur ausfüllen und
          zurücksenden, wenn du den Vertrag widerrufen willst):</p>
        <p className="mt-1 italic">
          An German with Marvin LLC, 30 N Gould St Ste N, Sheridan, WY 82801, USA, {SITE.contactEmail}: Hiermit
          widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über die folgende Dienstleistung: ____. Bestellt
          am: ____. Name des/der Verbraucher(s): ____. Anschrift des/der Verbraucher(s): ____. Datum: ____.
        </p>
        <p className="mt-2">Nach dem Checkout bestätigen wir den Vertrag und diese Informationen auf einem dauerhaften Datenträger (z. B. per E-Mail).</p>
      </Section>
      <Section title="7. Live-Einzelstunden (optional)">
        <p>
          Unabhängig vom App-Abo kannst du ein Monatspaket für private Einzelstunden ({LESSON.durationMin} Minuten je
          Stunde) abschließen. Du wählst die Anzahl der Stunden pro Monat (mindestens {LESSON.minHours}). Der Preis
          beträgt ${LESSON.pricePerHour} pro Stunde. Dieses Stunden-Abo verlängert sich automatisch monatlich und wird über Stripe abgerechnet.
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
        <p className="mt-2"><span className="font-medium text-cream">Kostenlose Probestunde:</span> Wir können je
          Lehrkraft eine kostenlose Probestunde anbieten, damit du vor Abschluss eines Abos eine Stunde ausprobieren
          kannst. Sie ist kostenlos und findet über Google Meet statt; es gelten die üblichen Buchungs- und
          No-Show-Regeln.</p>
      </Section>
      <Section title="8. B1-Live-Gruppenkurs (Prüfungsvorbereitung)">
        <p>
          Unabhängig vom App-Abo bieten wir einen kostenpflichtigen B1-Live-Gruppenkurs zur Prüfungsvorbereitung an.
          Er läuft über {GROUP_COURSE.weeks} Wochen mit {GROUP_COURSE.totalSessions} Live-Online-Sitzungen
          ({GROUP_COURSE.sessionsPerWeek} pro Woche, je {GROUP_COURSE.durationMin} Minuten) per Videocall (Google Meet)
          in einer kleinen Gruppe von bis zu {GROUP_COURSE.maxSeats} Teilnehmenden.
        </p>
        <p className="mt-2">
          Der Kurs ist eine <span className="font-medium text-cream">einmalige Zahlung von {eurLabel(GROUP_COURSE.priceEur)}</span>{" "}
          (zzgl. der standortabhängig an der Kasse aufgeschlagenen Steuer). Es ist kein Abo und verlängert sich nicht.
          Die Zahlung wickelt Stripe ab.
        </p>
        <p className="mt-2"><span className="font-medium text-cream">Inbegriffener App-Zugang:</span> Der Kurs enthält
          {" "}{GROUP_COURSE.appAccessDays} Tage kostenlosen Vollzugang zur Lern-App (sonst {priceLabel()} pro Monat).
          Dieser Zugang ist Teil des Kurses, beginnt mit dem Kurs und endet automatisch nach Ablauf der
          {" "}{GROUP_COURSE.appAccessDays} Tage — er wird nicht zu einem kostenpflichtigen Abo.</p>
        <p className="mt-2"><span className="font-medium text-cream">Mindestteilnehmerzahl:</span> Es sind mindestens
          {" "}{GROUP_COURSE.minSeats} Teilnehmende erforderlich. Wird diese Zahl nicht erreicht, findet der Kurs nicht
          statt und du erhältst den vollen Betrag binnen 14 Tagen über dein ursprüngliches Zahlungsmittel zurück.</p>
        <p className="mt-2"><span className="font-medium text-cream">Verpasste Sitzungen:</span> Die Live-Sitzungen
          folgen einem festen Plan. Verpasst du eine Sitzung, stellen wir nach Möglichkeit die Materialien bereit;
          einzelne Sitzungen werden jedoch nicht erstattet oder nachgeholt.</p>
        <p className="mt-2"><span className="font-medium text-cream">Widerrufsrecht:</span> Als Verbraucher in der EU
          hast du ein 14-tägiges Widerrufsrecht für den Kurskauf. Beginnt der Kurs oder der inbegriffene App-Zugang
          innerhalb dieser Frist, verlangst du ausdrücklich den vorzeitigen Leistungsbeginn und bestätigst, dass dein
          Widerrufsrecht mit vollständiger Erbringung des Kurses erlischt (§ 356 Abs. 4 BGB) und dass für den
          inbegriffenen digitalen App-Zugang dieselbe Regel zum vorzeitigen Erlöschen wie in Abschnitt 6 gilt.
          Widerrufst du vor Leistungsbeginn, erhältst du den vollen Betrag zurück.</p>
        <p className="mt-2"><span className="font-medium text-cream">Kostenlose Gruppen-Probestunde:</span> Vor dem
          Kurs kannst du an einer kostenlosen, unverbindlichen Live-Gruppen-Probestunde über Google Meet zu einer
          festen wöchentlichen Zeit teilnehmen. Dafür ist weder eine Zahlung noch ein Konto nötig.</p>
      </Section>
      <Section title="9. Gratis-Test & Zugangscodes">
        <p>
          Neue Nutzer können die Lern-App <span className="font-medium text-cream">kostenlos testen</span>, ohne
          Zahlungsdaten anzugeben. Der Test ist zeitlich begrenzt und endet automatisch — es erfolgt keine automatische
          Abbuchung, und es entsteht kein kostenpflichtiges Abo, solange du nicht aktiv einen bezahlten Tarif wählst
          und den Checkout abschließt.
        </p>
        <p className="mt-2">
          Manche Nutzer schalten die App per <span className="font-medium text-cream">Zugangscode</span> frei, den sie
          über eine externe Plattform (z. B. Preply oder Skool) gekauft haben. Diese Käufe richten sich nach den AGB
          und Datenschutzbestimmungen der jeweiligen Plattform.
        </p>
      </Section>
      <Section title="10. Inhalte & Nutzung">
        <p>
          Alle Inhalte (Videos, Aufgaben, Texte) sind geschützt und ausschließlich für dein persönliches Lernen
          bestimmt. Das Teilen deines Kontos oder Weiterverbreiten von Inhalten ist nicht gestattet.
        </p>
      </Section>
      <Section title="11. Haftung">
        <p>
          Wir erbringen die Leistung mit angemessener Sorgfalt, garantieren aber keinen bestimmten Lernerfolg. Für
          Vorsatz und grobe Fahrlässigkeit sowie bei Schäden an Leben, Körper oder Gesundheit haften wir unbeschränkt.
          Bei einfacher Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht (einer Pflicht,
          deren Erfüllung die ordnungsgemäße Durchführung des Vertrags erst ermöglicht und auf deren Einhaltung du
          regelmäßig vertrauen darfst), und zwar begrenzt auf den vorhersehbaren, vertragstypischen Schaden. Eine
          zwingende Haftung, etwa nach dem Produkthaftungsgesetz, bleibt unberührt.
        </p>
      </Section>
      <Section title="12. Änderungen & Recht">
        <p>
          Wir können diese Bedingungen anpassen. Wesentliche Änderungen kündigen wir mindestens 30 Tage vor
          Inkrafttreten an und erläutern sie. Bei einem Dauerschuldverhältnis wird eine solche Änderung nur wirksam,
          wenn du nicht vor dem genannten Zeitpunkt widersprichst; darauf weisen wir in der Ankündigung hin, und im
          Falle deines Widerspruchs kannst du zum Ende der bezahlten Periode kündigen. Zwingende
          Verbraucherschutzregeln deines Wohnsitzlandes bleiben unberührt.
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
