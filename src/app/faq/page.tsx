/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import LegalFooter from "@/components/LegalFooter";
import { SITE } from "@/lib/config";

const BASE = "https://www.germanwithmarvin.com";

export const metadata: Metadata = {
  title: "FAQ — German with Marvin",
  description:
    "Answers to common questions about German with Marvin: the free trial, pricing ($29/month or $19 paid yearly), levels A1–B2, Goethe/telc exam prep, 1-on-1 lessons, and cancelling.",
  alternates: { canonical: `${BASE}/faq` },
  openGraph: { title: "German with Marvin — FAQ", description: "Free trial, pricing, levels, exam prep and 1-on-1 lessons — your questions answered.", url: `${BASE}/faq`, type: "website" },
};

type QA = { q: string; a: string; link?: { href: string; label: string } };
type Cat = { title: string; items: QA[] };

// Sichtbarer Inhalt UND FAQ-Schema (JSON-LD) stammen aus derselben Quelle,
// damit beides immer übereinstimmt (Google verlangt: Markup = sichtbarer Text).
const FAQ: Cat[] = [
  {
    title: "Getting started",
    items: [
      { q: "What is German with Marvin?", a: "It's a complete, structured German course from A1 to B2, built by a real German teacher. You get video lessons, flashcards recorded in Marvin's own voice, short stories, interactive exercises, a vocabulary game and an exam trainer — all in one place, so you follow one clear path instead of juggling five apps." },
      { q: "Do I need to know any German to start?", a: "No. The course starts at complete-beginner level (A1) and takes you step by step up to B2. If you already know some German, you can jump in at your level." },
      { q: "Who is it for?", a: "Learners who want to actually use German — for work, studying in Germany, moving to a German-speaking country, passing an exam, or everyday life. Explanations are in English; the German content grows with you from A1 to B2." },
      { q: "Is it self-paced?", a: "Yes. You learn whenever it suits you, at your own speed. There are no fixed class times for the course. If you want live practice, you can add 1-on-1 lessons separately." },
      { q: "What devices can I use?", a: "Everything runs in your web browser on your phone, tablet or computer — nothing to install. You can add it to your phone's home screen and use it like an app." },
    ],
  },
  {
    title: "Free trial & pricing",
    items: [
      { q: "Is there a free trial?", a: "Yes — you can try the course free for 5 days, with no credit card required. You only choose a plan if you decide to stay." },
      { q: "How much does it cost?", a: "The full course is $29 per month, or $228 for a whole year — that works out to $19 per month. Applicable tax is added at checkout based on your location." },
      { q: "Can I cancel anytime?", a: "Yes. The monthly plan can be cancelled anytime. The yearly plan is a single payment for 12 months and does not renew automatically, so there's nothing to cancel later." },
      { q: "What's included in the subscription?", a: "Everything in the course: all video lessons from A1 to B2, 2,600+ flashcards in Marvin's own voice, short stories, interactive exercises, the vocabulary game and the exam trainer with AI writing feedback." },
      { q: "Do I pay before I can try it?", a: "No. You experience the full course free for 5 days first, without entering any card details. You decide to subscribe only once you know it's right for you." },
    ],
  },
  {
    title: "Exams (Goethe / telc)",
    items: [
      { q: "Can this help me pass a Goethe or telc exam?", a: "Yes. The exam trainer has full mock exams in the real Goethe/telc format — Reading, Listening and Writing — with instant scoring and AI feedback on your writing. It's built to train exactly what the exams test." },
      { q: "Can I try an exam for free?", a: "Yes — there's a free practice exam for each level (A1–B2) you can take right now without an account. Reading and Listening are graded instantly.", link: { href: "/free-exam", label: "Try a free exam" } },
      { q: "Is speaking practice included?", a: "The course covers Reading, Listening and Writing. For speaking, the best practice is a 1-on-1 lesson with a real teacher — that's where you get live feedback on how you sound." },
    ],
  },
  {
    title: "Levels & progress",
    items: [
      { q: "How do I find out my level?", a: "Take the free 5-minute level test — you'll get your estimated level (A1–B2) straight away, so you know where to start.", link: { href: "/level-test", label: "Take the free level test" } },
      { q: "How long until I can actually use German?", a: "That depends on how much time you put in — but the whole point of the structured path is to get you using German, not just understanding it. Short daily sessions add up fast, and the exercises and exam practice push you to produce the language, not just recognise it." },
      { q: "What levels does the course cover?", a: "The full range from A1 (complete beginner) to B2 (upper intermediate) — the levels most people need for work, study and exams in Germany." },
    ],
  },
  {
    title: "1-on-1 lessons",
    items: [
      { q: "Can I take private lessons with a real teacher?", a: "Yes. You can book 1-on-1 online lessons with Marvin or his co-teacher Ha — 50-minute sessions from $30 per lesson, tailored to your level and goals.", link: { href: "/online-german-lessons", label: "See 1-on-1 lessons" } },
      { q: "Do I have to buy the course to book lessons?", a: "No. Private lessons are separate from the course subscription — you can book them on their own, or combine them with the course if you want both." },
    ],
  },
  {
    title: "About & support",
    items: [
      { q: "Who is Marvin?", a: "Marvin is a German teacher who has given 2,500+ online lessons and holds a 4.9-star rating from his students on Preply. German with Marvin brings his teaching, method and materials together in one structured course." },
      { q: "In what language are the lessons taught?", a: "Explanations and instructions are in English, while the German you learn — the videos, examples, flashcards and stories — is of course in German, getting more natural as you move up the levels." },
      { q: "How do I get help if I'm stuck?", a: "Just reply to any of our emails or write to our support address — a real person answers. You can also book a 1-on-1 lesson if you want direct teaching help." },
    ],
  },
];

export default function FAQPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap((c) => c.items).map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a + (i.link ? ` ${i.link.label}: ${BASE}${i.link.href}` : "") },
    })),
  };

  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-16 md:h-[90px] w-auto object-contain" />
        </Link>
        <PublicNav ctaLabel="Start free" ctaHref="/register?src=faq" />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pt-6 pb-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">FAQ</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#8A3030]">Questions, answered</h1>
          <p className="mt-3 text-[#3B2922]/75">Everything about the free trial, pricing, levels, exams and 1-on-1 lessons. Still unsure? <a href={`mailto:${SITE.contactEmail}`} className="text-[#8A3030] underline underline-offset-4 font-semibold">Just email us</a> — a real person replies.</p>
        </div>

        <div className="space-y-10">
          {FAQ.map((cat) => (
            <section key={cat.title}>
              <h2 className="text-xs font-bold uppercase tracking-wide text-[#E3A12F] mb-3">{cat.title}</h2>
              <div className="space-y-3">
                {cat.items.map((i) => (
                  <details key={i.q} className="group rounded-xl bg-white/70 border border-[#E3A12F]/25 p-4 open:bg-white">
                    <summary className="font-semibold text-[#3B2922] cursor-pointer list-none flex items-start justify-between gap-3">
                      <span>{i.q}</span>
                      <span className="text-[#E3A12F] shrink-0 transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="mt-2 text-[15px] text-[#3B2922]/80 leading-relaxed">
                      {i.a}
                      {i.link && (
                        <> <Link href={i.link.href} className="text-[#8A3030] underline underline-offset-4 font-semibold">{i.link.label} →</Link></>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-[#8A3030] text-white p-8 text-center space-y-3">
          <h2 className="text-2xl font-bold">Ready to try it?</h2>
          <p className="text-white/85">5 days free, no credit card. See if the clear path works for you.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register?src=faq" className="inline-block px-7 py-3.5 rounded-xl bg-[#E3A12F] text-[#3b2116] font-bold hover:brightness-105">Start your 5-day free trial →</Link>
            <Link href="/free-exam" className="inline-block px-7 py-3.5 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10">Try a free exam</Link>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
