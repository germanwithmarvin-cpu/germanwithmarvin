"use client";

// Lena – die Lernbegleiterin im Trainer. Mitlernende auf Augenhöhe, keine Lehrerin.
// Am Stil der Vorlage orientiert: magenta-lila Bob mit geradem Pony, schwarzer
// Choker, rosa Oberteil, dunkelviolette Jacke. Bewusst als Vektor gezeichnet,
// damit alle Stimmungen aus einer Figur ableitbar und beliebig skalierbar sind.

export type LenaMood = "neutral" | "cheer" | "encourage" | "explain" | "oops" | "wave";

const HAIR = "#7A2E63";
const HAIR_DARK = "#63244F";
const HAIR_LIGHT = "#95407A";
const JACKET = "#332A4D";
const JACKET_DARK = "#28203C";
const TOP = "#F2A2C0";
const SKIN = "#F7CFAE";
const SKIN_SHADE = "#EBBB95";
const CHOKER = "#221D2B";
const INK = "#2B2333";

export default function Lena({ mood = "neutral", size = 120, className = "" }: { mood?: LenaMood; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 220 250" width={size} height={size * (250 / 220)} className={className} aria-hidden="true">
      {/* Haar hinten */}
      <path d="M52 132 Q46 66 110 62 Q174 66 168 132 L168 186 Q140 178 110 178 Q80 178 52 186 Z" fill={HAIR_DARK} />

      {/* Schultern + Jacke */}
      <path d="M40 250 Q42 200 78 188 L142 188 Q178 200 180 250 Z" fill={JACKET} />
      {/* Rosa Oberteil im Ausschnitt */}
      <path d="M92 188 L110 214 L128 188 Q140 192 146 200 L110 236 L74 200 Q80 192 92 188 Z" fill={TOP} />
      {/* Jackenkanten */}
      <path d="M92 188 L110 214 L98 250 L74 250 Q72 214 78 196 Z" fill={JACKET_DARK} />
      <path d="M128 188 L110 214 L122 250 L146 250 Q148 214 142 196 Z" fill={JACKET_DARK} />

      {/* Hals + Choker */}
      <rect x="96" y="150" width="28" height="42" rx="12" fill={SKIN_SHADE} />
      <rect x="93" y="168" width="34" height="13" rx="6" fill={CHOKER} />

      {/* Kopf */}
      <ellipse cx="110" cy="118" rx="47" ry="53" fill={SKIN} />
      {/* Wange-Schatten */}
      <ellipse cx="110" cy="140" rx="34" ry="20" fill={SKIN_SHADE} opacity="0.25" />

      {/* Bob-Seiten */}
      <path d="M63 108 Q58 158 70 176 Q78 168 78 140 Q72 122 74 106 Z" fill={HAIR} />
      <path d="M157 108 Q162 158 150 176 Q142 168 142 140 Q148 122 146 106 Z" fill={HAIR} />
      {/* Pony */}
      <path d="M62 106 Q60 62 110 60 Q160 62 158 106 Q150 88 130 84 Q120 96 110 84 Q96 96 88 84 Q70 88 62 106 Z" fill={HAIR} />
      <path d="M96 66 Q112 60 132 68" stroke={HAIR_LIGHT} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />

      <Face mood={mood} />
      <Hands mood={mood} />
    </svg>
  );
}

function Face({ mood }: { mood: LenaMood }) {
  const happyEyes = mood === "cheer";
  const wink = mood === "encourage";

  return (
    <g>
      {/* Augenbrauen */}
      {mood === "oops" ? (
        <>
          <path d="M84 100 Q92 96 100 100" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M120 100 Q128 96 136 100" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M84 98 Q92 93 100 97" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M120 97 Q128 93 136 98" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Augen */}
      {happyEyes ? (
        <>
          <path d="M83 120 Q92 111 101 120" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M119 120 Q128 111 137 120" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="92" cy="118" rx="7" ry="9" fill="#fff" />
          <circle cx="92.5" cy="119" r="5" fill={INK} />
          <circle cx="94.5" cy="116" r="1.8" fill="#fff" />
          {wink ? (
            <path d="M119 119 Q128 112 137 119" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="128" cy="118" rx="7" ry="9" fill="#fff" />
              <circle cx="128.5" cy="119" r="5" fill={INK} />
              <circle cx="130.5" cy="116" r="1.8" fill="#fff" />
            </>
          )}
        </>
      )}

      {/* Wangenröte */}
      <ellipse cx="78" cy="133" rx="9" ry="5.5" fill="#F2909E" opacity="0.45" />
      <ellipse cx="142" cy="133" rx="9" ry="5.5" fill="#F2909E" opacity="0.45" />

      {/* Mund */}
      {mood === "cheer" && <path d="M96 141 Q110 156 124 141 Q110 149 96 141 Z" fill={INK} />}
      {mood === "encourage" && <path d="M98 142 Q110 152 122 142" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
      {mood === "neutral" && <path d="M101 143 Q110 149 119 143" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
      {mood === "wave" && <path d="M99 142 Q110 151 121 142" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
      {mood === "explain" && <ellipse cx="110" cy="145" rx="6" ry="7" fill={INK} />}
      {mood === "oops" && <path d="M100 147 Q106 142 112 147 Q118 152 122 146" stroke={INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />}
    </g>
  );
}

// Hände/Arme je nach Stimmung – bewusst schlicht, damit die Figur klar bleibt.
function Hands({ mood }: { mood: LenaMood }) {
  if (mood === "cheer") {
    return (
      <g>
        <rect x="36" y="150" width="17" height="46" rx="8" fill={JACKET} transform="rotate(18 44 173)" />
        <circle cx="34" cy="150" r="12" fill={SKIN} />
        <rect x="167" y="150" width="17" height="46" rx="8" fill={JACKET} transform="rotate(-18 176 173)" />
        <circle cx="186" cy="150" r="12" fill={SKIN} />
      </g>
    );
  }
  if (mood === "wave") {
    return (
      <g>
        <rect x="167" y="146" width="17" height="48" rx="8" fill={JACKET} transform="rotate(-22 176 170)" />
        <circle cx="188" cy="144" r="13" fill={SKIN} />
        <path d="M182 134 l4 -8 M190 133 l3 -9 M196 137 l6 -6" stroke={SKIN_SHADE} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === "encourage") {
    // Daumen hoch
    return (
      <g>
        <rect x="168" y="168" width="17" height="40" rx="8" fill={JACKET} transform="rotate(-12 176 188)" />
        <circle cx="184" cy="168" r="13" fill={SKIN} />
        <rect x="180" y="147" width="8" height="16" rx="4" fill={SKIN} />
      </g>
    );
  }
  if (mood === "explain") {
    // zeigt zur Seite
    return (
      <g>
        <rect x="166" y="172" width="17" height="38" rx="8" fill={JACKET} transform="rotate(-28 174 190)" />
        <circle cx="190" cy="170" r="12" fill={SKIN} />
        <rect x="196" y="165" width="18" height="8" rx="4" fill={SKIN} />
      </g>
    );
  }
  if (mood === "oops") {
    // Hand an der Wange
    return (
      <g>
        <rect x="160" y="176" width="16" height="34" rx="8" fill={JACKET} transform="rotate(-34 168 192)" />
        <circle cx="176" cy="164" r="11" fill={SKIN} />
      </g>
    );
  }
  return null;
}
