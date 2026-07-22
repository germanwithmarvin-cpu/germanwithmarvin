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
          <path d="M84 102 Q92 99 100 101" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M120 101 Q128 99 136 102" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
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
      {mood === "explain" && <ellipse cx="110" cy="145" rx="5" ry="4" fill={INK} />}
      {mood === "oops" && <path d="M100 147 Q106 142 112 147 Q118 152 122 146" stroke={INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />}
    </g>
  );
}

// Hände/Arme je nach Stimmung. Der Arm wird als durchgehender Strich von der
// Schulter gezeichnet, damit die Hand nie frei zu schweben scheint.
function Hands({ mood }: { mood: LenaMood }) {
  const arm = (d: string) => <path d={d} stroke={JACKET} strokeWidth="17" strokeLinecap="round" fill="none" />;

  if (mood === "cheer") {
    return (
      <g>
        {arm("M74 208 Q52 184 46 158")}
        {arm("M146 208 Q168 184 174 158")}
        <circle cx="45" cy="152" r="12" fill={SKIN} />
        <circle cx="175" cy="152" r="12" fill={SKIN} />
      </g>
    );
  }
  if (mood === "wave") {
    return (
      <g>
        {arm("M146 208 Q172 190 182 162")}
        <circle cx="184" cy="155" r="13" fill={SKIN} />
        <path d="M178 141 l3 -8 M187 140 l2 -9 M194 144 l6 -6" stroke={SKIN_SHADE} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    );
  }
  if (mood === "encourage") {
    return (
      <g>
        {arm("M146 210 Q172 204 180 184")}
        <circle cx="182" cy="178" r="13" fill={SKIN} />
        <rect x="178" y="157" width="8" height="16" rx="4" fill={SKIN} />
      </g>
    );
  }
  if (mood === "explain") {
    return (
      <g>
        {arm("M146 208 Q172 198 186 178")}
        <circle cx="189" cy="174" r="12" fill={SKIN} />
        <rect x="195" y="170" width="17" height="8" rx="4" fill={SKIN} />
      </g>
    );
  }
  if (mood === "oops") {
    return (
      <g>
        {arm("M146 210 Q168 200 172 178")}
        <circle cx="173" cy="171" r="11" fill={SKIN} />
      </g>
    );
  }
  return null;
}
