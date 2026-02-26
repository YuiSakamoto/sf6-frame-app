export const colors = {
  background: "#0A0A0F",
  surface: "#14141E",
  surfaceLight: "#1E1E2E",
  accent: "#00D4FF",
  accentDim: "#0099BB",
  punishSuccess: "#00FF88",
  framePositive: "#44CC66",
  frameNegative: "#FF4444",
  frameNeutral: "#AAAAAA",
  text: "#FFFFFF",
  textSecondary: "#888899",
  textMuted: "#555566",
  border: "#2A2A3A",
} as const;

export type ColorKey = keyof typeof colors;
