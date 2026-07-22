"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import Lena from "@/components/training/Lena";
import { hasBeenWelcomed, markWelcomed } from "@/lib/onboarding";

const WELCOME_VIDEO = "https://youtu.be/kDVR9XRFQQw";

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "video" | "lena">("loading");
  const [saving, setSaving] = useState(false);

  // Wer das Willkommen schon gesehen hat, landet direkt im Dashboard.
  useEffect(() => {
    let cancelled = false;
    hasBeenWelcomed().then((seen) => {
      if (cancelled) return;
      if (seen) router.replace("/dashboard");
      else setStep("video");
    });
    return () => { cancelled = true; };
  }, [router]);

  async function finish() {
    setSaving(true);
    await markWelcomed();
    router.replace("/dashboard");
  }

  if (step === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Fortschritt der zwei Schritte */}
      <div className="flex items-center justify-center gap-2">
        {["video", "lena"].map((s) => (
          <span key={s} className="h-1.5 rounded-full transition-all"
            style={{ width: s === step ? 34 : 18, background: s === step ? "var(--gold-bright)" : "var(--bordeaux-deep)" }} />
        ))}
      </div>

      {step === "video" && (
        <div className="space-y-5">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome! 👋</h1>
            <p className="text-cream-dim mt-2">
              Two minutes on how this platform works — then you are ready to go.
            </p>
          </div>

          <VideoPlayer videoId={WELCOME_VIDEO} title="Welcome to German Simplified" />

          <div className="flex justify-center">
            <button onClick={() => setStep("lena")} className="btn-gold px-8 py-3.5 text-lg font-bold">
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === "lena" && (
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <Lena mood="wave" size={200} className="shrink-0" />
            <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
              <h2 className="text-2xl font-bold">Hi, I&apos;m Lena!</h2>
              <p className="text-[17px] leading-8">
                I&apos;m your <b style={{ color: "var(--bordeaux)" }}>study companion</b> — and I&apos;m learning
                German right alongside you, so we go through this together.
              </p>
              <p className="text-[17px] leading-8">
                You will see me in the <b style={{ color: "var(--bordeaux)" }}>Training</b> area: I cheer when you
                nail something, and whenever you slip I show you <b style={{ color: "var(--bordeaux)" }}>exactly why</b> —
                never just &quot;wrong&quot;. On your overview I drop a study tip every now and then.
              </p>
              <p className="text-cream-dim">Ready when you are.</p>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button onClick={finish} disabled={saving} className="btn-gold px-8 py-3.5 text-lg font-bold disabled:opacity-50">
              {saving ? "One moment…" : "Let's start 🚀"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
