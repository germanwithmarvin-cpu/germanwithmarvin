import { ImageResponse } from "next/og";

// Vorschaubild beim Teilen des Links (Open Graph / Twitter), 1200×630.
// Dynamisch gerendert im Markendesign – kein statisches Asset nötig.
export const alt = "German Simplified — Learn German with Marvin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #4A1420 0%, #6E1F2E 55%, #8A3030 100%)",
          color: "#F7E9CE",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 6, color: "#E4B95B", fontWeight: 700 }}>
          MARVIN GRAF
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 800, marginTop: 12, lineHeight: 1.05 }}>
          German Simplified
        </div>
        <div style={{ display: "flex", fontSize: 38, marginTop: 24, color: "#EBD9B4", maxWidth: 940 }}>
          Video lessons, interactive exercises, a flashcard trainer &amp; reading stories — A1 to B2.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
          <div style={{ display: "flex", background: "#E4B95B", color: "#3B2116", fontSize: 30, fontWeight: 800, padding: "10px 28px", borderRadius: 999 }}>
            A1 – B2
          </div>
          <div style={{ display: "flex", border: "3px solid #E4B95B", color: "#F7E9CE", fontSize: 30, fontWeight: 700, padding: "10px 28px", borderRadius: 999 }}>
            germanwithmarvin.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
