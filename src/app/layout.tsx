import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.germanwithmarvin.com"),
  title: {
    default: "German Simplified — Learn German with Marvin",
    template: "%s · German Simplified",
  },
  description:
    "Learn German the simple way: video lessons, interactive exercises, a smart flashcard trainer and reading stories — from A1 to B2, with Marvin Graf.",
  applicationName: "German Simplified",
  authors: [{ name: "Marvin Graf" }],
  keywords: [
    "learn German", "German course", "German A1", "German A2", "German B1", "German B2",
    "German flashcards", "German grammar", "German exercises", "Deutsch lernen", "Marvin Graf",
  ],
  openGraph: {
    type: "website",
    siteName: "German Simplified",
    title: "German Simplified — Learn German with Marvin",
    description:
      "Video lessons, interactive exercises, a flashcard trainer and reading stories — from A1 to B2.",
    url: "https://www.germanwithmarvin.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "German Simplified — Learn German with Marvin",
    description:
      "Video lessons, interactive exercises, a flashcard trainer and reading stories — from A1 to B2.",
  },
  alternates: { canonical: "https://www.germanwithmarvin.com" },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    title: "German Simplified",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff1d2",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <div className="app-bg" aria-hidden="true" />
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
        <PwaRegister />
      </body>
    </html>
  );
}
