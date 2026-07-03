"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "card-media";

// Lädt eine Datei (Bild oder Audio) in den Storage-Bucket und gibt die
// öffentliche URL zurück. Nur Lehrer dürfen hochladen (per Storage-Policy).
export async function uploadMedia(
  file: File,
  kind: "image" | "audio",
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
