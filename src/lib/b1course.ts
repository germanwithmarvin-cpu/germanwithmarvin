// Alle sichtbaren Texte des B1-Funnels an EINER Stelle (Englisch, einfache Sätze
// für A2/B1-Leser). Zahlen/Termine kommen aus GROUP_COURSE in config.ts — hier
// stehen nur Texte, damit später eine deutsche Version leicht daneben passt:
// einfach `B1_COPY_DE` mit denselben Schlüsseln anlegen und je nach Sprache wählen.
//
// Regeln: keine erfundenen Zahlen/Bewertungen hier reinschreiben — echte Zahlen
// kommen aus reviews.ts / landing.ts / config.ts.

export const B1_COPY = {
  // ---- /b1-test : kostenlose B1-Probeprüfung (ein Ziel, kein Wegklicken) ----
  test: {
    metaTitle: "Free B1 German practice test",
    metaDescription:
      "Try a free B1 German practice test. See where you stand for your Einbürgerung or residence permit.",
    introEyebrow: "Free B1 practice test",
    introH1: "Are you ready for the B1 exam?",
    introSub:
      "Take this short, free practice test. It uses the real Goethe/telc format. In a few minutes you will see where you stand.",
    introStart: "Start the free test",
    introNote: "No account needed. It takes about 20 minutes.",
    // E-Mail-Gate vor dem Ergebnis
    gateEyebrow: "Almost done",
    gateH1: "Where should we send your result?",
    gateSub:
      "Enter your email to see your score and a short explanation. You also get free tips to prepare for the real B1 exam.",
    gateEmailLabel: "Your email",
    gateButton: "Show my result",
    gateSending: "Checking…",
    // DSGVO: klarer Einwilligungstext direkt am Formular
    gateConsent:
      "I want free B1 tips by email and agree that German with Marvin may contact me. I can unsubscribe at any time.",
    gatePrivacyPrefix: "See our",
    gatePrivacyLink: "Privacy Policy",
    gateCheckInbox:
      "Check your inbox and click the link to confirm. Then your result is on the way.",
    // Ergebnis-Screen (zusätzlich zur vorhandenen Prozent-/Bestehensgrenze)
    resultAtB1: "Good — you are close to B1 level. With focused practice you can pass.",
    resultBelowB1: "You are not at B1 yet. That is normal — the right practice closes the gap fast.",
    resultCourseCta: "See the B1 exam prep course",
    resultTrialLessonCta: "Join a free live trial lesson",
  },

  // ---- /b1-course : Kursseite ------------------------------------------------
  course: {
    metaTitle: "B1 Exam Prep — Live Group Course",
    metaDescription:
      "An 8-week live group course to prepare for the German B1 exam (Goethe/telc) for Einbürgerung and residence permit.",
    eyebrow: "Live group course",
    h1: "Pass your B1 German exam",
    h1accent: "with a clear 8-week plan",
    sub: "Taught by Marvin himself, built for the B1 exam you need for Einbürgerung or a residence permit — and far more personal than a normal group course.",
    // Nutzenversprechen
    benefitsHeading: "What you get",
    benefits: [
      "Live online classes taught by Marvin himself — 16 sessions over 8 weeks (2 per week, 50 min).",
      "The complete self-study app included free for the whole course (normally $29/month).",
      "Real practice for your Goethe or telc B1 exam: reading, listening, writing and speaking.",
      "A small group of max 10 people, so everyone gets real attention.",
      "Your own weekly homework, with personal written feedback from Marvin.",
    ],
    // Alleinstellung: individueller als ein normaler Gruppenkurs
    differentHeading: "More personal than a normal group course",
    different: [
      { title: "Taught by Marvin himself", text: "Marvin leads every live class himself — 4+ years teaching German full-time and thousands of 1-on-1 lessons. Not a recording, not a faceless course." },
      { title: "Your own homework", text: "You get homework made for you, chosen for what you personally need — not one fixed task for the whole group." },
      { title: "Personal written feedback", text: "After the sessions, Marvin writes you personal feedback on how you are doing and what to practise next." },
      { title: "Ask your own questions", text: "Bring the questions that matter to you and get answers from Marvin directly." },
      { title: "It adapts to you", text: "The course follows your needs. It is not a generic telc class where everyone does the same task." },
      { title: "Small group, real attention", text: "Groups are capped at 10 people, so there is real time and attention for everyone." },
    ],
    // Komplette App gratis dabei
    includedHeading: "Your complete learning platform — included free",
    includedIntro: "For all 8 weeks of the course, you also get the complete self-study app for free (normally $29/month).",
    includedItems: [
      "All video lessons, A1 to B2",
      "Interactive exercises after every lesson",
      "Smart flashcard trainer — 2,600+ cards in Marvin's own voice",
      "Reading stories at your level",
      "The Word Rocket vocab game",
      "Grammar topics, one at a time",
      "Exam trainer with instant AI writing feedback",
      "Progress statistics",
    ],
    includedNote: "It is your whole practice toolkit between classes — the vocab trainer, videos, grammar, stories and more, yours at no extra cost.",
    // Für wen
    forWhoHeading: "Who this is for",
    forWho: [
      "You live in Germany and need B1 for Einbürgerung or a residence permit.",
      "You understand some German (A2) and want to reach B1.",
      "You want a clear plan and a real teacher, not only an app.",
    ],
    // Ablauf
    outlineHeading: "The 8 weeks",
    outline: [
      "Weeks 1–2: The exam format + reading and listening basics",
      "Weeks 3–4: Writing — letters and emails that pass",
      "Weeks 5–6: Speaking — talk about yourself and react naturally",
      "Weeks 7–8: Full mock exams + your weak points",
    ],
    scheduleHeading: "When we meet",
    scheduleNote: "Two live sessions per week. All times below are shown in your time zone and in German time.",
    priceHeading: "Price",
    priceFounderNote: "Founder price for the first group.",
    moneyBackNote: "If fewer than the minimum number of people join, the course does not start and you get your money back.",
    taxNote: "Price in EUR. VAT is added at checkout based on your country.",
    teacherHeading: "Your teacher",
    reviewsHeading: "What students say",
    faqHeading: "Questions & answers",
    faq: [
      {
        q: "Do I need to be at B1 already?",
        a: "No. You should understand some German (around A2). The course takes you to B1 exam level.",
      },
      {
        q: "What if I miss a class?",
        a: "You get the materials and can ask your questions in the next class. Try to join live when you can.",
      },
      {
        q: "Is this the Goethe or the telc exam?",
        a: "We prepare the skills both exams test: reading, listening, writing and speaking at B1.",
      },
      {
        q: "What do I need?",
        a: "A phone or computer with internet. We meet online in a video call.",
      },
      {
        q: "Is the learning app really included?",
        a: "Yes. For the 8 weeks of the course you get full, free access to the whole self-study app (normally $29/month) — videos, the flashcard trainer, stories, grammar and the exam trainer.",
      },
      {
        q: "What if too few people join?",
        a: "The course needs a minimum group size. If we do not reach it, the round does not start and you get a full refund.",
      },
    ],
    bookButton: "Join the course",
    bookingBusy: "…",
    seatsLeft: "spots left",
    trialLessonCta: "Not sure yet? Try a free live trial lesson",
  },

  // ---- Probestunde (freie Live-Schnupperstunde, feste Zeit) ------------------
  probestunde: {
    eyebrow: "Free trial lesson",
    h1: "Try a free live B1 lesson",
    sub: "Come to a free live group lesson. Meet Marvin, see how the course works, and ask your questions. No payment, no account.",
    nameLabel: "Your name",
    emailLabel: "Your email",
    timeLabel: "When is best for you?",
    timeOptions: [
      "Weekend morning",
      "Tuesday midday",
      "Evening",
    ],
    button: "Save my free spot",
    busy: "Saving…",
    consent:
      "I agree that German with Marvin may email me about the trial lesson and the course. I can unsubscribe at any time.",
    successTitle: "You're in!",
    successBody: "Check your email — we sent you the time and the link for the free trial lesson.",
  },

  // ---- Startseiten-Abschnitt -------------------------------------------------
  home: {
    eyebrow: "New: live group course",
    h1: "B1 Exam Prep — live, in a small group",
    sub: "Need B1 for Einbürgerung or a residence permit? Join an 8-week live course with Marvin.",
    // Startseiten-Weiche (zwei klare Wege)
    forkHeading: "Two ways to learn German",
    forkSub: "Start on your own in the app, or join Marvin's live B1 course. Pick the one that fits you.",
    selfPacedTitle: "Start today, learn at your pace",
    selfPacedText: "Get the full app and learn whenever you want — videos, exercises, flashcards and more. 5 days free, no credit card, cancel anytime. From $19/month.",
    courseTitle: "Live B1 course with Marvin",
    courseText: "An 8-week live course for your Einbürgerung or residence B1 exam, taught by Marvin himself in a small group. Your own homework, personal feedback, and the full app included free.",
    courseCta: "See the course",
    testCta: "Try the free B1 test",
    // Dezentes E-Mail-Formular
    emailPrompt: "Not sure about your level? Get your free B1 practice test by email.",
    emailLabel: "Your email",
    emailButton: "Send me the test",
    emailConsent:
      "I agree to receive the free B1 test and tips by email. I can unsubscribe any time.",
  },
};

export type B1Copy = typeof B1_COPY;
