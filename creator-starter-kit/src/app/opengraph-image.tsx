import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#09090F", backgroundImage: "radial-gradient(circle at 85% 10%, rgba(139,92,246,0.55), transparent 55%), radial-gradient(circle at 5% 95%, rgba(99,102,241,0.4), transparent 50%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 26, letterSpacing: 8, color: "#C4B5FD", fontWeight: 700 }}>CREATOR STARTER KIT</div>
        <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.05, marginTop: 30, maxWidth: 980 }}>Everything you need to build your digital creator business.</div>
        <div style={{ fontSize: 30, color: "#B4B4CC", marginTop: 34 }}>Templates · TikTok ideas · Notion dashboard · Business guide · AI prompts</div>
      </div>
    ),
    size,
  );
}
