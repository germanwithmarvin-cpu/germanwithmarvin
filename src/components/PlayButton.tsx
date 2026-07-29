"use client";

// Kleiner Play-Button: spielt eine Aufnahme nur auf Klick ab (kein Autoplay,
// keine Timeline/Sekunden). stopPropagation, damit Eltern-Klicks (z. B. Karte
// umdrehen) nicht ausgelöst werden. Rendert nichts, wenn keine URL vorliegt.
export default function PlayButton({
  url,
  label = "Play",
  size = "md",
}: {
  url: string | null;
  label?: string;
  size?: "sm" | "md";
}) {
  if (!url) return null;
  const dim = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); const a = new Audio(url); void a.play().catch(() => {}); }}
      className={`inline-grid place-items-center ${dim} rounded-full border border-gold/40 hover:border-gold hover:bg-gold/10 text-cream shrink-0 align-middle leading-none`}
      title={label}
      aria-label={label}
    >
      <span className="text-[10px] translate-x-[1px]">▶</span>
    </button>
  );
}
