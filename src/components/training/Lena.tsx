"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

// Lena – die Lernbegleiterin im Trainer. Mitlernende auf Augenhöhe, keine Lehrerin.
//
// Sie wird als BILD ausgeliefert, nicht als Vektor: Der gewünschte Anime-Stil
// lebt von weichen Schattierungen und Haardetails, die sich nicht sinnvoll als
// SVG-Pfade schreiben lassen.
//
// Erwartete Dateien in  public/lena/  (PNG mit transparentem Hintergrund,
// gleicher Bildausschnitt und gleiche Größe bei allen, ca. 800 px hoch):
//   neutral.png · cheer.png · encourage.png · explain.png · oops.png · wave.png
//
// Solange eine Datei fehlt, wird schlicht nichts angezeigt – die Oberfläche
// bleibt dadurch immer sauber, auch wenn erst ein Teil der Posen da ist.

export type LenaMood = "neutral" | "cheer" | "encourage" | "explain" | "oops" | "wave";

// Versionsnummer der Bilddateien. Statische Dateien werden lange gecacht, und
// die Dateinamen bleiben gleich - ohne diesen Zusatz behalten Besucher, die die
// Seite schon einmal geladen haben, dauerhaft die alten Bilder.
// BEI JEDEM AUSTAUSCH DER BILDER HOCHZAEHLEN.
const ASSET_VERSION = 2;

export default function Lena({
  mood = "neutral",
  size = 120,
  className = "",
}: {
  mood?: LenaMood;
  size?: number;
  className?: string;
}) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;

  return (
    <img
      src={`/lena/${mood}.png?v=${ASSET_VERSION}`}
      alt=""
      width={size}
      height={size}
      onError={() => setMissing(true)}
      className={`object-contain object-bottom select-none ${className}`}
      style={{ width: size, height: "auto" }}
      draggable={false}
    />
  );
}
