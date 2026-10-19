import type { Metadata } from "next";
import LevelTest from "@/components/LevelTest";

const BASE = "https://www.germanwithmarvin.com";
const title = "Free German Level Test (Goethe / telc style) — German with Marvin";
const description = "Find your German level in 5 minutes with our free placement test. Get your result instantly, then unlock your personalized study plan and real Goethe / telc mock exams.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/level-test` },
  openGraph: {
    title: "What's your German level? Free 5-minute test",
    description,
    url: `${BASE}/level-test`,
    type: "website",
    images: [{ url: `${BASE}/ads/level-test-og.jpg`, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "What's your German level? Free test", description },
};

export default function Page() {
  return <LevelTest />;
}
