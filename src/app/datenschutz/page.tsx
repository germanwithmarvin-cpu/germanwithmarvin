import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/config";

export const metadata = {
  title: "Datenschutzerklärung — German with Marvin",
};

// Datenschutzerklärung (DSGVO). Hinweis: rechtlich prüfen lassen (siehe Ende).
export default function DatenschutzPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo href="/" />
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto text-cream-dim leading-relaxed">
          <h1 className="text-3xl font-bold text-cream">Datenschutzerklärung</h1>
          <p className="mt-3 text-sm">Stand: Juli 2026</p>

          <Section title="1. Verantwortlicher">
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p className="mt-2">
              German with Marvin LLC<br />
              Marvin Hagen Graf (Sole Member)<br />
              30 N Gould St Ste N<br />
              Sheridan, WY 82801, USA<br />
              E-Mail:{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">
                {SITE.contactEmail}
              </a>
            </p>
          </Section>

          <Section title="2. Allgemeines zur Datenverarbeitung">
            <p>
              Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur
              Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich
              ist. Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), lit. a
              (Einwilligung) und lit. f DSGVO (berechtigtes Interesse).
            </p>
          </Section>

          <Section title="3. Aufruf der Website (Server-Logs & Hosting)">
            <p>
              Diese Website wird bei <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut, CA 91789, USA)
              gehostet. Beim Aufruf werden technisch notwendige Daten (z. B. IP-Adresse, Datum/Uhrzeit,
              abgerufene Seite, Browsertyp) verarbeitet, um die Auslieferung und Sicherheit der Seite zu
              gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </Section>

          <Section title="4. Registrierung & Nutzerkonto">
            <p>
              Für die Nutzung der Lernplattform kannst du ein Konto anlegen. Dabei verarbeiten wir deinen
              Namen, deine E-Mail-Adresse und dein Passwort (verschlüsselt gespeichert). Diese Daten sowie dein
              Lernfortschritt (z. B. bearbeitete Karten, Statistiken, abgeschlossene Lektionen) werden über
              unseren Backend-Dienstleister <strong>Supabase Inc.</strong> (970 Toa Payoh North, Singapur; Server­infrastruktur u. a. in den USA)
              gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des Nutzungsvertrags).
            </p>
          </Section>

          <Section title="5. Schreibaufgaben & KI-Korrektur">
            <p>
              Wenn du die Funktion „Writing tasks" nutzt und einen Text zur Korrektur einreichst, wird dieser
              Text zur automatisierten sprachlichen Auswertung an <strong>Anthropic PBC</strong> (San Francisco, CA, USA)
              übermittelt. Bitte gib in diesen Texten keine besonders sensiblen personenbezogenen Daten an.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </Section>

          <Section title="6. Videoinhalte (YouTube)">
            <p>
              Lernvideos binden wir über <strong>YouTube</strong> (Google Ireland Ltd., Irland) im erweiterten
              Datenschutzmodus ein. In diesem Modus setzt YouTube nach eigener Aussage erst dann Cookies, wenn
              du ein Video aktiv abspielst. Beim Abspielen können Daten an Google übertragen werden.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </Section>

          <Section title="7. Zahlungen">
            <p>
              Der Zugang zu kostenpflichtigen Inhalten wird ausschließlich über die externen Plattformen
              <strong> Skool</strong> und <strong>Preply</strong> abgewickelt. Zahlungen erfolgen dort; wir
              erheben und speichern <strong>keine</strong> Zahlungsdaten auf dieser Website. Es gelten
              zusätzlich die Datenschutzbestimmungen der jeweiligen Plattform.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Wir verwenden technisch notwendige Cookies, um deine Anmeldung (Login-Sitzung) aufrechtzuerhalten.
              Ohne diese Cookies ist ein Login nicht möglich. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
              bzw. § 25 Abs. 2 TDDDG (unbedingt erforderliche Cookies).
            </p>
          </Section>

          <Section title="9. Empfänger & Übermittlung in Drittländer">
            <p>
              Zur Bereitstellung unseres Angebots setzen wir folgende Dienstleister (Auftragsverarbeiter) ein:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Vercel Inc. (Hosting, USA)</li>
              <li>Supabase Inc. (Konto & Datenbank, USA/Singapur)</li>
              <li>Anthropic PBC (KI-Textkorrektur, USA)</li>
              <li>Google Ireland Ltd. / YouTube (Videohosting, EU/USA)</li>
            </ul>
            <p className="mt-2">
              Dabei kann es zu einer Übermittlung personenbezogener Daten in die USA kommen. Soweit erforderlich,
              stützen wir solche Übermittlungen auf geeignete Garantien (z. B. EU-Standardvertragsklauseln nach
              Art. 46 DSGVO bzw. den EU-US Data Privacy Framework, soweit der Anbieter zertifiziert ist).
            </p>
          </Section>

          <Section title="10. Speicherdauer">
            <p>
              Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich
              ist oder gesetzliche Aufbewahrungsfristen bestehen. Löschst du dein Konto, werden die zugehörigen
              Daten gelöscht, soweit keine Aufbewahrungspflichten entgegenstehen.
            </p>
          </Section>

          <Section title="11. Deine Rechte">
            <p>Dir stehen nach der DSGVO folgende Rechte zu:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
              <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Zur Ausübung deiner Rechte genügt eine Nachricht an{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">
                {SITE.contactEmail}
              </a>
              .
            </p>
          </Section>

          <Section title="12. Beschwerderecht bei einer Aufsichtsbehörde">
            <p>
              Unbeschadet anderer Rechtsbehelfe hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde
              zu beschweren, insbesondere in dem Mitgliedstaat deines Aufenthaltsorts.
            </p>
          </Section>

          <p className="mt-10 text-xs italic">
            Hinweis: Diese Datenschutzerklärung wurde nach bestem Wissen erstellt, ersetzt aber keine
            Rechtsberatung. Aufgrund der Konstellation (US-Gesellschaft mit US-Dienstleistern, Nutzer in der EU)
            empfehlen wir eine anwaltliche Prüfung vor dem produktiven Verkaufsstart.
          </p>

          <div className="mt-8 flex gap-3">
            <Link href="/impressum" className="btn-outline px-5 py-2.5 inline-block">Impressum</Link>
            <Link href="/" className="btn-outline px-5 py-2.5 inline-block">← Startseite</Link>
          </div>
        </div>
      </main>
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
