import { SITE } from "@/lib/config";

// TikTok + Instagram als Icon-Links. target=_blank, rel=noopener. Erbt die
// Textfarbe (currentColor), passt sich also hellem/dunklem Footer an.
export default function SocialLinks({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="opacity-80 hover:opacity-100 transition">
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.6 5.82a4.28 4.28 0 0 1-1.01-2.82h-3.1v12.45a2.59 2.59 0 1 1-1.83-2.48V9.8a5.68 5.68 0 1 0 4.93 5.63V9.01a7.35 7.35 0 0 0 4.3 1.38V7.28a4.28 4.28 0 0 1-2.29-1.46Z" />
        </svg>
      </a>
      <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-80 hover:opacity-100 transition">
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </div>
  );
}
