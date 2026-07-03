import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LegalFooter from "@/components/LegalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marvin Graf — German Simplified",
  description: "Deutsch lernen mit Videos, interaktiven Quizzen und persönlichem Coaching.",
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
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col">{children}</div>
          <LegalFooter />
        </div>
      </body>
    </html>
  );
}
