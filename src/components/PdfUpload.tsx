"use client";

import { useRef, useState } from "react";
import { uploadPdf } from "@/lib/upload";

// Kleiner Upload-Button für PDF-Dateien. Ruft nach dem Hochladen onUploaded(url, name) auf.
export default function PdfUpload({
  folder,
  onUploaded,
  label = "⬆ Upload PDF",
}: {
  folder: string;
  onUploaded: (url: string, name: string) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    const { url, error } = await uploadPdf(file, folder);
    setBusy(false);
    if (ref.current) ref.current.value = "";
    if (error || !url) { setErr(error ?? "Upload failed"); return; }
    onUploaded(url, file.name);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input ref={ref} type="file" accept="application/pdf" onChange={handle} className="hidden" />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {busy ? "Uploading…" : label}
      </button>
      {err && <span className="text-xs text-red-300">{err}</span>}
    </span>
  );
}
