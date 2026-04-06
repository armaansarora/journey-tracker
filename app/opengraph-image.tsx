import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Journey Realty Group — AI Automation Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", background: "linear-gradient(135deg, #2563EB, #1D4ED8)", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: "white", marginBottom: 12 }}>Journey Realty Group</div>
        <div style={{ fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>AI Automation Tracker</div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", marginTop: 24 }}>34 steps · 4 phases</div>
      </div>
    ),
    { ...size }
  );
}
