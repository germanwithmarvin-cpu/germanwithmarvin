"use client";

// Leichter Lese-Fortschritt für Geschichten – clientseitig (localStorage),
// ohne DB-Migration. Reicht für den "Lese-Pfad" (gelesen ✓ / als Nächstes).
const KEY = "gs_read_stories";

export function getReadStories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isStoryRead(id: string): boolean {
  return getReadStories().includes(id);
}

export function markStoryRead(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = new Set(getReadStories());
    set.add(id);
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* Speicher voll/gesperrt – Fortschritt ist nur eine nette Zugabe. */
  }
}
