import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/config";

export const metadata = {
  title: "Impressum — German with Marvin",
};

// Rechtlicher Pflicht-Hinweis (Impressum) gemäß § 5 DDG.
export default function ImpressumPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo href="/" />
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">Impressum</h1>

          <div className="mt-8 space-y-8 text-cream-dim leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-cream">Angaben gemäß § 5 DDG</h2>
              <p className="mt-2">
                German with Marvin LLC<br />
                Marvin Hagen Graf (Sole Member)<br />
                30 N Gould St Ste N<br />
                Sheridan, WY 82801<br />
                USA
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-cream">Vertreten durch</h2>
              <p className="mt-2">Marvin Hagen Graf (alleiniger Gesellschafter / Sole Member)</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-cream">Kontakt</h2>
              <p className="mt-2">
                E-Mail:{" "}
                <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">
                  {SITE.contactEmail}
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-cream">Registereintrag / Steuerliche Kennung</h2>
              <p className="mt-2">
                Rechtsform: Limited Liability Company (LLC), Bundesstaat Wyoming, USA<br />
                Employer Identification Number (EIN): 42-3304749
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-cream">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </h2>
              <p className="mt-2">
                Marvin Hagen Graf<br />
                30 N Gould St Ste N<br />
                Sheridan, WY 82801, USA
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-cream">EU-Streitschlichtung</h2>
              <p className="mt-2">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-bright underline underline-offset-4"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                . Unsere E-Mail-Adresse findest du oben.
              </p>
              <p className="mt-2">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>

          <div className="mt-12 flex gap-3">
            <Link href="/datenschutz" className="btn-outline px-5 py-2.5 inline-block">Datenschutz</Link>
            <Link href="/" className="btn-outline px-5 py-2.5 inline-block">← Startseite</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
