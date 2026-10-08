import type { Metadata } from "next";
import AudienceLanding from "@/components/AudienceLanding";

export const metadata: Metadata = {
  title: "Goethe & telc exam prep (A1–B2) | German with Marvin",
  description:
    "Prepare for your Goethe or telc exam (A1–B2) in the real exam format — speaking, writing, listening and reading — with a teacher who knows the exam inside out. 5-day free trial.",
  alternates: { canonical: "https://www.germanwithmarvin.com/german-exam-prep-b1-b2" },
};

export default function Page() {
  return (
    <AudienceLanding
      eyebrow="German exam prep"
      h1="Walk into your"
      h1accent="Goethe or telc exam ready."
      sub="Prepare for Goethe or telc A1–B2 in the exam's own format — speaking, writing, listening and reading — guided by a teacher who prepares students for these exams every week."
      levelTitle="Goethe & telc · A1 through B2"
      levelText="Prepare with model tasks in the real exam format for every section."
      whyHeading="Prep that matches the real exam"
      points={[
        { icon: "📝", title: "Learn in the exam format", text: "Model tasks for speaking, writing, listening and reading — no surprises on the day." },
        { icon: "🧭", title: "Target your weak spots", text: "A placement test and a plan that focuses on exactly what you need to improve." },
        { icon: "🗣️", title: "Beat speaking nerves", text: "Optional 1-on-1 practice with a teacher who has coached students through the Goethe speaking exam." },
        { icon: "🏆", title: "Proven results", text: "Real students have passed their Goethe B1 after preparing with Marvin." },
      ]}
    />
  );
}
