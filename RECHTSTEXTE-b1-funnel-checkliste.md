# Rechtstexte — Stand nach der umfassenden Überarbeitung (Nov 2026)

**Was das ist:** Ich (Claude) habe Datenschutz + AGB umfassend für **alle** auf der Plattform
erhältlichen Angebote überarbeitet und die Texte direkt im Code geändert (zweisprachig EN/DE).
Grundlage: ein vollständiger Code-Scan aller real genutzten Dienste/Datenflüsse + ein
dreifacher Gegen-Check (Code-Deckung, deutsches Verbraucher-/Datenschutzrecht, EN/DE-Parität).

**Wichtig:** Das ist ein **starker Entwurf für die anwaltliche Prüfung**, kein Ersatz dafür.
Unten steht (A) was ich geändert habe und (B) was **du/der Anwalt** noch entscheiden/ergänzen
müsst – das sind Dinge, die kein Text allein lösen kann (Benennung einer realen Person,
Preis-Anzeige im ganzen Funnel, ein UI-Button, eine Geschäftsentscheidung).

Dateien: `src/app/datenschutz/page.tsx` · `src/app/agb/page.tsx` · `src/app/impressum/page.tsx`

---

## A) Was ich bereits umgesetzt habe (im Code, EN+DE)

### Datenschutzerklärung (jetzt 16 Abschnitte, Stand: November 2026)
- **NEU Abschn. 10 – Live-Videounterricht (Google Meet):** Durchführung von Einzelstunden,
  B1-Kurs und Probestunde per Google Meet (Google Ireland Ltd.), Verarbeitung von Audio/Video/Chat.
- **NEU Abschn. 11 – E-Mails, Newsletter & Lead-Formulare (Resend):** Resend, Inc. (USA) als
  Versand-Auftragsverarbeiter; Double-Opt-in; gespeicherte Lead-Daten + Einwilligungsnachweis; § 7 UWG.
- **NEU Abschn. 12 – KI-Schreib-Feedback (Prüfungstrainer):** Anthropic (Anthropic PBC, USA) erhält
  den Schülertext; kein Training über die API; Art.-22-Negativaussage.
- **Abschn. 3:** Vercel Analytics (cookielos) ergänzt.
- **Abschn. 4:** IP-Speicherung (Missbrauchs-/Mehrfachkonto-Schutz, Art. 6 I f) + Buchungs-/
  Kurs-/Probestunden-Daten + **Profilbild-Upload** (Supabase, öffentliche URL) ergänzt; Passwort
  korrekt als „nicht umkehrbarer Hash" (vorher fälschlich „verschlüsselt").
- **Abschn. 7 (Google-Kalender):** Scope-Liste korrigiert – jetzt **vier** Scopes
  (calendar.events, calendar.readonly, **openid, email**) + Hinweis, dass die verbundene
  Google-E-Mail gespeichert wird (wichtig für die Google-OAuth-Prüfung).
- **Abschn. 9 (Cookies):** **Meta-Pixel** ergänzt (einwilligungsgebunden) + **Art.-26-Hinweis**
  (gemeinsame Verantwortlichkeit für Meta-Pixel/Google-Ads-Erhebung).
- **Abschn. 13 (Empfänger/Drittland):** Resend, Anthropic, Meta ergänzt; Google-Zeile um Meet
  erweitert; Vercel um Analyse; Hinweis „Kopie der Garantien auf Anfrage" + Supabase-Singapur.
- **Abschn. 14 (Speicherdauer):** konkrete Fristen/Kriterien je Datenkategorie ergänzt.

### AGB (jetzt 12 Abschnitte, Stand: November 2026)
- **NEU Abschn. 8 – B1-Live-Gruppenkurs:** 290 € einmalig, 8 Wochen/16 Sitzungen à 50 Min.,
  max. 10, Google Meet; 70 Tage App-Zugang inklusive (läuft automatisch aus); **Mindestteilnehmer 4**
  → sonst volle Rückerstattung **binnen 14 Tagen**; verpasste Sitzungen; Widerruf (§ 356 Abs. 4 BGB).
- **NEU Abschn. 9 – Gratis-Test & Zugangscodes:** kostenloser App-Test (ohne Karte, endet
  automatisch) + Zugangscodes externer Plattformen (Preply/Skool).
- **Abschn. 2 (Leistung):** Vokabeltrainer + **Prüfungstrainer mit KI-Feedback** + Haftungs-/
  Erwartungs-Disclaimer zum KI-Feedback.
- **Abschn. 4 (Preis):** Rabatt-/Aktionscode-Satz ergänzt.
- **Abschn. 6 (Widerruf):** **Muster-Widerrufsformular** ergänzt, § 356 Abs. 5 BGB zitiert,
  Folgen des Widerrufs (Rückzahlung binnen 14 Tagen, anteiliger Wertersatz), Bestätigung auf
  dauerhaftem Datenträger.
- **Abschn. 7 (Einzelstunden):** kostenlose Probestunde (1 je Lehrkraft, Google Meet) ergänzt.
- **Abschn. 11 (Haftung):** **Kardinalpflichten-Carve-out** ergänzt (§ 307/§ 309 Nr. 7 BGB) –
  die alte Klausel war für B2C wahrscheinlich unwirksam.
- **Abschn. 12 (Änderungen):** § 308 Nr. 4 BGB-Schutz (Ankündigung, Widerspruchsrecht, Kündigung).

### Config
- `GROUP_COURSE.meetLink` / `PROBESTUNDE.meetLink`: Kommentar auf **Google Meet** präzisiert
  (Link trägst du noch ein – siehe B).

---

## B) Was DU / der Anwalt noch erledigen müsst (kein Text allein)

1. **[BLOCKER] Art.-27-DSGVO-EU-Vertreter benennen.** Eine US-LLC, die den EU-Markt anspricht,
   braucht einen benannten EU-Vertreter mit Name + EU-Anschrift (im Datenschutz **und** Impressum).
   Ich kann hier **keinen** Namen erfinden – du musst einen Dienst/Vertreter beauftragen und mir die
   Daten geben, dann trage ich sie ein. (Das ist der Punkt, den ein deutscher Prüfer zuerst anmerkt.)

2. **[BLOCKER] Preisangabe für Verbraucher (PAngV/UWG).** Verbraucher in DE/EU müssen den
   **Gesamtpreis inkl. USt.** sehen, nicht „netto + Steuer an der Kasse". Das betrifft die ganze
   Preis-Anzeige (config `TAX_NOTE`, alle Preis-Labels) + evtl. Stripe-Tax-Einstellung – also ein
   **Produkt-/Anzeige-Thema**, das ich nicht still im Hintergrund umstellen wollte. Entscheidung nötig:
   EU-Verbraucherpreise brutto anzeigen (Stripe Tax „inclusive") **oder** mit dem Anwalt klären, wie
   die MoR-Konstellation (Stripe = Merchant of Record) das verschiebt. Danach setze ich es um.

3. **[WICHTIG] Kündigungsbutton (§ 312k BGB).** Für die laufenden Abos (App + Stunden) verlangt das
   Gesetz einen leicht erreichbaren **Kündigungs-Button** auf der Website – E-Mail/Stripe-Link reicht
   nicht. Das ist ein **UI-Feature** (Code), kein AGB-Text. Sag Bescheid, dann baue ich ihn.

4. **[WICHTIG, Geschäftsentscheidung] Stunden-Guthaben-Verfall.** Dass ungenutztes Guthaben nach
   5 Wochen verfällt und nicht erstattet wird, kann nach § 307 BGB als unangemessene Benachteiligung
   gelten. Das ist **deine kaufmännische Entscheidung** (längere Gültigkeit? Erstattung?). Ich habe die
   aktuelle Regel gelassen; sag, ob ich sie ändern soll.

5. **[WICHTIG] Widerruf + MoR final klären.** Ich habe ein Muster-Widerrufsformular eingefügt, das
   die **German with Marvin LLC** als Vertragspartner nennt (konsistent mit den AGB). Weil **Stripe als
   Merchant of Record** verkauft, muss der Anwalt bestätigen, wer rechtlich Widerrufs-Adressat ist und
   ob die formelle Muster-Widerrufsbelehrung noch exakt angepasst werden muss.

6. **Impressum:** inhaltlich unverändert (außer dass der Art.-27-Vertreter hier ebenfalls rein muss,
   sobald benannt – Punkt 1). Sonst nur gegenprüfen.

7. **Cookie-Banner-Text:** sicherstellen, dass **Meta** neben Google als Zweck genannt ist (Pixel ist
   bereits einwilligungsgebunden – nur der Banner-Text).

8. **Noch offen auf deiner Seite (nicht Rechtstext):** echter **Google-Meet-Link** für Kurs +
   Probestunde (Config `meetLink`), B1-Hör-Audios veröffentlichen, finale anwaltliche Prüfung vor Go-live.

---

### Kurz-Checkliste (offen)
- [ ] EU-Vertreter (Art. 27) benennen → in Datenschutz + Impressum (ich trage ein)
- [ ] Verbraucher-Bruttopreise (PAngV) entscheiden/umsetzen
- [ ] Kündigungsbutton (§ 312k) bauen
- [ ] Guthaben-Verfall (§ 307) kaufmännisch entscheiden
- [ ] Widerruf/MoR-Adressat anwaltlich bestätigen
- [ ] Cookie-Banner: Meta als Zweck nennen
- [ ] Google-Meet-Links in Config eintragen
- [ ] Gesamtes Paket anwaltlich prüfen lassen, bevor der Funnel live geht
