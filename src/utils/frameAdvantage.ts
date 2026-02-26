import { colors } from "@/theme/colors";

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

/**
 * フレーム値の表示色を返す
 */
export function getFrameColor(value: string): string {
  const num = parseFrameValue(value);
  if (num === null) return colors.frameNeutral;
  if (num > 0) return colors.framePositive;
  if (num < 0) return colors.frameNegative;
  return colors.frameNeutral;
}

/**
 * ガード時フレーム値が確反可能かどうかを判定する
 * （負のフレームアドバンテージ = 確反の可能性あり）
 */
export function isPunishable(onBlock: string): boolean {
  const value = parseFrameValue(onBlock);
  return value !== null && value < 0;
}
