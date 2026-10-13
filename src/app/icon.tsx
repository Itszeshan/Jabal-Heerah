import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1b1e22",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 16, height: 16, background: "#c44912" }} />
        <div style={{ width: 16, height: 16, background: "#f2f4f6" }} />
        <div style={{ width: 16, height: 16, background: "#5c6b73" }} />
        <div style={{ width: 16, height: 16, background: "#121417" }} />
      </div>
    ),
    size,
  );
}
