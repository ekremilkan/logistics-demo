import { ImageResponse } from "next/og";

export const alt = "Hafenkraft — Umzüge & Transporte aus Bremen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1C1E1F",
          color: "#F2F1EC",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, opacity: 0.7 }}>
          <span>HAFENKRAFT · UMZÜGE & TRANSPORTE</span>
          <span>53.0951° N · 8.7738° E</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 900, lineHeight: 0.95, letterSpacing: -4 }}>
          <span>Wir bewegen,</span>
          <span style={{ display: "flex" }}>
            was&nbsp;<span style={{ borderBottom: "22px solid #F2C230" }}>zählt.</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ background: "#F2C230", color: "#1C1E1F", padding: "14px 24px", fontSize: 30, fontWeight: 800 }}>
            Preis in 60 Sekunden →
          </div>
          <span style={{ fontSize: 24, opacity: 0.7 }}>Bremen seit 1987 · Festpreis-Garantie</span>
        </div>
      </div>
    ),
    size,
  );
}
