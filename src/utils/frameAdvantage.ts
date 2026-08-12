/**
 * フレーム値文字列をパースして数値に変換する
 * 例: "-8" → -8, "+2" → 2, "8~10" → 8（最小値）
 */
export function parseFrameValue(value: string): number | null {
  const cleaned = value.trim();
  if (cleaned === "" || cleaned === "-" || cleaned === "N/A") {
    return null;
  }
  // "8~10" のようなレンジは最小値を取る
  const rangeMatch = cleaned.match(/^(-?\d+)~(-?\d+)$/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1], 10);
  }
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

export type FrameTone = "positive" | "negative" | "neutral";

/**
 * フレーム値の意味種別を返す(色はテーマ側で解決する)
 */
export function getFrameTone(value: string): FrameTone {
  const num = parseFrameValue(value);
  if (num === null || num === 0) return "neutral";
  return num > 0 ? "positive" : "negative";
}

/**
 * ガード時フレーム値が確反可能かどうかを判定する
 * （負のフレームアドバンテージ = 確反の可能性あり）
 */
export function isPunishable(onBlock: string): boolean {
  const value = parseFrameValue(onBlock);
  return value !== null && value < 0;
}
