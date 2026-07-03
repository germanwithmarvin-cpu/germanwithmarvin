import Link from "next/link";

// `size` = Höhe in Pixeln (optional). Ohne size: große Variante für Landing/Header.
export default function Logo({ href = "/", size }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="flex items-center gap-3 group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Marvin Graf — German Simplified"
        className={size ? "w-auto object-contain" : "h-20 md:h-28 w-auto object-contain"}
        style={size ? { height: size } : undefined}
      />
    </Link>
  );
}
