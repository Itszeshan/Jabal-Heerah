import { ImageResponse } from "next/og";

export const alt = "Jabal Al Heerah Auto Paints, Sharjah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1b1e22",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 42, height: 42, background: "#c44912" }} />
          <div style={{ width: 42, height: 42, background: "#f2f4f6" }} />
          <div style={{ width: 42, height: 42, background: "#5c6b73" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
          <span>Jabal Al Heerah</span>
          <span style={{ color: "#c44912" }}>Auto Paints</span>
        </div>
        <div style={{ fontSize: 32 }}>Sharjah Industrial Area 4</div>
      </div>
    ),
    size,
  );
}
