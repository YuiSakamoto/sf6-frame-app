import type { Move } from "@/types/frame-data";
import { parseFrameValue } from "./frameAdvantage";

export interface PunishOption {
  move: Move;
  /** 自キャラの技の発生フレーム */
  startup: number;
  /** 余裕フレーム（|onBlock| - startup） */
  framesToSpare: number;
  /** ダメージ値（パース済み） */
  damageValue: number;
}

/**
 * 確定反撃の検索
 *
 * 確反成立条件: |相手技のonBlock| >= 自キャラの技のstartup
 *
 * @param onBlockValue 相手技のガード時フレーム（負の値）
 * @param myMoves 自キャラの全技リスト
 * @returns 確反可能な技のリスト（startup昇順）
 */
export function findPunishes(
  onBlockValue: string,
  myMoves: Move[],
): PunishOption[] {
  const blockFrame = parseFrameValue(onBlockValue);
  if (blockFrame === null || blockFrame >= 0) {
    return [];
  }

  const advantage = Math.abs(blockFrame);

  const punishes: PunishOption[] = [];

  for (const move of myMoves) {
    const startup = parseFrameValue(move.startup);
    if (startup === null || startup <= 0) continue;

    if (startup <= advantage) {
      const damageValue = parseDamage(move.damage);
      punishes.push({
        move,
        startup,
        framesToSpare: advantage - startup,
        damageValue,
      });
    }
  }

  // startup昇順ソート（同じstartupならダメージ降順）
  punishes.sort((a, b) => {
    if (a.startup !== b.startup) return a.startup - b.startup;
    return b.damageValue - a.damageValue;
  });

  return punishes;
}

/**
 * ダメージ文字列をパースして数値に変換
 * 例: "800", "500x2" → 1000, "300+200" → 500
 */
function parseDamage(damage: string): number {
  const cleaned = damage.trim();
  if (cleaned === "" || cleaned === "-") return 0;

  // "500x2" パターン
  const multiHitMatch = cleaned.match(/^(\d+)\s*x\s*(\d+)$/i);
  if (multiHitMatch) {
    return parseInt(multiHitMatch[1], 10) * parseInt(multiHitMatch[2], 10);
  }

  // "300+200" パターン
  if (cleaned.includes("+")) {
    return cleaned
      .split("+")
      .reduce((sum, part) => sum + (parseInt(part.trim(), 10) || 0), 0);
  }

  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}
