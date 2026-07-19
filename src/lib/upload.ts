"use client";

import { createClient } from "@/lib/supabase/client";

// Erlaubte Dateitypen: PDF + Bilder (PNG/JPG).
const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];

// Lädt eine Datei in einen öffentlichen Bucket und gibt die URL zurück.
// Standard-Bucket "uploads" (Lehrer-Material). Für Profilbilder: bucket="avatars".
export async function uploadFile(
  file: File,
  folder: string,
  bucket: string = "uploads",
): Promise<{ url?: string; error?: string }> {
  if (!ALLOWED.includes(file.type)) return { error: "Please choose a PDF, PNG or JPG file." };
  if (file.size > 50 * 1024 * 1024) return { error: "File is too large (max 50 MB)." };

  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
