"use client";

import { createClient } from "@/lib/supabase/client";

// Lädt eine PDF-Datei in den öffentlichen "uploads"-Bucket und gibt die
// Download-URL zurück. Nur Lehrer dürfen hochladen (per Storage-Policy).
export async function uploadPdf(file: File, folder: string): Promise<{ url?: string; error?: string }> {
  if (file.type !== "application/pdf") return { error: "Please choose a PDF file." };
  if (file.size > 50 * 1024 * 1024) return { error: "File is too large (max 50 MB)." };

  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(path, file, { contentType: "application/pdf", upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("uploads").getPublicUrl(path);
  return { url: data.publicUrl };
}
