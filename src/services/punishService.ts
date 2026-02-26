import type { Move, CharacterFrameData } from "@/types/frame-data";
import type { PunishOption } from "@/utils/punishCalc";
import { findPunishes } from "@/utils/punishCalc";
import { isPunishable } from "@/utils/frameAdvantage";

/**
 * 確反可能な技のみをフィルタリングして返す
 */
export function getPunishableMoves(data: CharacterFrameData): Move[] {
  return data.moves.filter((move) => isPunishable(move.onBlock));
}

/**
 * 相手の技に対する確反リストを返す
 */
export function getPunishOptions(
  opponentMove: Move,
  myCharacterData: CharacterFrameData,
): PunishOption[] {
  return findPunishes(opponentMove.onBlock, myCharacterData.moves);
}

export type SortMode = "startup" | "damage";

/**
 * 確反リストをソートする
 */
export function sortPunishes(
  punishes: PunishOption[],
  mode: SortMode,
): PunishOption[] {
  const sorted = [...punishes];
  if (mode === "damage") {
    sorted.sort((a, b) => b.damageValue - a.damageValue);
  }
  // "startup" はデフォルトの並び順なのでそのまま
  return sorted;
}
