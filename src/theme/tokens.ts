// Pro Data Tool デザイン: ニュートラルダーク/ライト + 単一ブルーアクセント。
// 値を変更したら contrast.test.ts が WCAG 基準を検証する。

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  /** accent の淡い背景(選択状態など)。rgba 可 */
  accentSubtle: string;
  framePositive: string;
  frameNegative: string;
  frameNeutral: string;
  /** framePositive の淡い背景(確反バッジなど)。rgba 可 */
  positiveSubtle: string;
}

export const darkColors: ThemeColors = {
  bg: "#101013",
  surface: "#121216",
  surfaceRaised: "#1A1A20",
  border: "#26262E",
  divider: "#202027",
  textPrimary: "#E8E8EC",
  textSecondary: "#9A9AA4",
  textMuted: "#71717B",
  accent: "#5B93FF",
  accentSubtle: "rgba(91, 147, 255, 0.14)",
  framePositive: "#3DD68C",
  frameNegative: "#F17878",
  frameNeutral: "#9A9AA4",
  positiveSubtle: "rgba(61, 214, 140, 0.12)",
};

export const lightColors: ThemeColors = {
  bg: "#FAFAFB",
  surface: "#FFFFFF",
  surfaceRaised: "#F2F2F5",
  border: "#E1E1E8",
  divider: "#ECECF0",
  textPrimary: "#1A1A20",
  textSecondary: "#55555F",
  textMuted: "#71717B",
  accent: "#2563EB",
  accentSubtle: "rgba(37, 99, 235, 0.10)",
  framePositive: "#0E7A4E",
  frameNegative: "#C93A3A",
  frameNeutral: "#55555F",
  positiveSubtle: "rgba(14, 122, 78, 0.10)",
};

/** 4px 基準のスペーシングスケール */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
} as const;
