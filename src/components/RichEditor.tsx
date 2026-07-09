"use client";

import { useEffect, useRef } from "react";

// Einfacher „Google-Docs-Stil"-Editor: Toolbar mit Überschrift, Fett, Kursiv.
// Speichert den Inhalt als HTML (wird 1:1 formatiert angezeigt).
export default function RichEditor({
  value,
  onChange,
  placeholder = "",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Startinhalt nur beim Mounten setzen (sonst springt der Cursor).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    onChange(ref.current?.innerHTML ?? "");
  }

  function cmd(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  return (
    <div className="rounded-lg border border-gold/25 bg-bordeaux-deep/60 focus-within:border-gold overflow-hidden">
      <div className="flex items-center gap-1 border-b border-gold/15 px-2 py-1.5">
        <ToolBtn title="Heading" onClick={() => cmd("formatBlock", "H2")}><span className="font-bold">H</span></ToolBtn>
        <ToolBtn title="Normal text" onClick={() => cmd("formatBlock", "P")}><span className="text-cream-dim">¶</span></ToolBtn>
        <span className="w-px h-4 bg-gold/20 mx-1" />
        <ToolBtn title="Bold" onClick={() => cmd("bold")}><span className="font-bold">B</span></ToolBtn>
        <ToolBtn title="Italic" onClick={() => cmd("italic")}><span className="italic font-serif">I</span></ToolBtn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder={placeholder}
        className="richtext richtext-editor min-h-[10rem] max-h-[28rem] overflow-y-auto px-3 py-2.5 outline-none text-sm text-cream"
      />
    </div>
  );
}

function ToolBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      // Verhindert, dass der Klick die Textauswahl im Editor verliert.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-8 h-8 grid place-items-center rounded hover:bg-gold/15 text-cream"
    >
      {children}
    </button>
  );
}
