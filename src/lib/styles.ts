import type { CSSProperties } from "react";

// ─── CONSTANTES DE ESTILO ─────────────────────────────────────────────────────
export const MONO: CSSProperties = { fontFamily: "JetBrains Mono, monospace" };
export const DISPLAY: CSSProperties = { fontFamily: "Albert Sans, sans-serif" };

// ─── TOOLTIP RECHARTS ────────────────────────────────────────────────────────
export const ttStyle = {
  contentStyle: {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#f0f0f0",
    fontSize: "12px",
  },
  labelStyle: { color: "#757575" },
  cursor: { fill: "rgba(255,255,255,0.03)" },
} as const;
