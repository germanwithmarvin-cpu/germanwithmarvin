// Holt aus jeder YouTube-Eingabe die reine Video-ID heraus:
// - reine ID:            ABCdef12345
// - watch-Link:          https://www.youtube.com/watch?v=ABCdef12345
// - Kurzlink:            https://youtu.be/ABCdef12345
// - Embed/Shorts-Link:   https://www.youtube.com/embed/ABCdef12345
export function youTubeId(input: string): string {
  if (!input) return "";
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s; // schon eine reine ID
  try {
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1, 12);
    const v = url.searchParams.get("v");
    if (v) return v.slice(0, 11);
    const m = url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/);
    if (m) return m[1];
  } catch {
    // kein gültiger URL – unten per Muster versuchen
  }
  const m = s.match(/[\w-]{11}/);
  return m ? m[0] : s;
}

export default function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const id = youTubeId(videoId);
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video bg-black">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
