import type { Metadata } from "next";
import AudienceLanding from "@/components/AudienceLanding";

export const metadata: Metadata = {
  title: "Learn German before you move to Germany | German with Marvin",
  description:
    "Moving to Germany for the Chancenkarte, a job or family? Your plans depend on your German level. Start from zero and build real, everyday German with a real teacher. 5-day free trial.",
  alternates: { canonical: "https://www.germanwithmarvin.com/german-for-moving-to-germany" },
};

export default function Page() {
  return (
    <AudienceLanding
      eyebrow="Moving to Germany"
      h1="Learn German"
      h1accent="before you move."
      sub="Whether it's the Chancenkarte, a job or family reunification, your move depends on your German. Start from zero and build real, everyday German — with a real teacher who explains things in your own language."
      levelTitle="Chancenkarte: German A1 (or English B2)"
      levelText="Recognition of qualifications and family reunification often need A1–A2. Requirements vary — check yours. Source: Make it in Germany."
      whyHeading="Built for people moving to Germany"
      points={[
        { icon: "🛫", title: "German you will actually use", text: "Everyday language for your first weeks in Germany — the Amt, housing, work and daily life." },
        { icon: "🧭", title: "Start from zero, the right way", text: "A clear path A1 → A2 → B1, one topic at a time, no overwhelm." },
        { icon: "🔊", title: "Real pronunciation", text: "Flashcards spoken by Marvin, so you sound natural from the start." },
        { icon: "👩‍🏫", title: "Help in your language", text: "1-on-1 lessons with explanations in English — and in Vietnamese with Thanh Ha." },
      ]}
    />
  );
}
