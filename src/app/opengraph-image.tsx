import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FluxCo - One Call. Global Power.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0f1a 0%, #0d1526 40%, #111d35 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(45,140,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45,140,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45,140,255,0.12) 0%, transparent 70%)",
            top: "10%",
            right: "15%",
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "linear-gradient(135deg, #2d8cff, #1a6fdd)",
            marginBottom: 32,
            boxShadow: "0 0 40px rgba(45,140,255,0.3)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        {/* FLUXCO text */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          FLUXCO
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 48,
          }}
        >
          One Call. Global Power.
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(45,140,255,0.6), transparent)",
            marginBottom: 32,
          }}
        />

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Transformer procurement, marketplace, and manufacturing for the American grid.
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #2d8cff, #1a6fdd, #2d8cff)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
