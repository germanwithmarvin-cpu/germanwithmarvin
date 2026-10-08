import type { Metadata } from "next";
import AudienceLanding from "@/components/AudienceLanding";

export const metadata: Metadata = {
  title: "German for your Ausbildung — reach B1 | German with Marvin",
  description:
    "The vocational training (Ausbildung) visa usually needs German B1. Get there with a structured A1–B1 course, a real teacher, video lessons and daily practice. 5-day free trial.",
  alternates: { canonical: "https://www.germanwithmarvin.com/german-for-ausbildung" },
};

export default function Page() {
  return (
    <AudienceLanding
      eyebrow="German for your Ausbildung"
      h1="Reach the German your"
      h1accent="Ausbildung needs."
      sub="The vocational training visa usually asks for German B1. This structured course takes you from A1 to B1 — with a real teacher, clear video lessons and daily practice that actually sticks."
      levelTitle="Ausbildung visa: usually German B1"
      levelText="Requirements vary by case — check yours. Source: Make it in Germany."
      whyHeading="Everything you need to reach B1 for your Ausbildung"
      points={[
        { icon: "🎯", title: "A clear path to B1", text: "Learn in the right order, A1 → B1 — no guessing what to study next." },
        { icon: "📝", title: "Exam-ready", text: "Practice in the Goethe / telc format, so the certificate is no surprise." },
        { icon: "🔊", title: "Real pronunciation", text: "Flashcards spoken and recorded by Marvin — not a robot." },
        { icon: "👩‍🏫", title: "A real teacher", text: "Add 1-on-1 lessons any time to practice speaking and get unstuck." },
      ]}
    />
  );
}
