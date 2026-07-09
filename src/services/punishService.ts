import type { Move, CharacterFrameData } from "@/types/frame-data";
import type { PunishOption } from "@/utils/punishCalc";
import { findPunishes } from "@/utils/punishCalc";
import { isPunishable, parseFrameValue } from "@/utils/frameAdvantage";

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

export interface MovePunishSummary {
  move: Move;
  punishable: boolean;
  punishes: PunishOption[];
}

/**
 * 相手の全技に対する確反サマリを事前計算する。
 * onBlock がパース不能な技(投げ・データなし)はリストから除外する。
 */
export function getPunishSummaries(
  opponentData: CharacterFrameData,
  myData: CharacterFrameData,
): MovePunishSummary[] {
  return opponentData.moves
    .filter((move) => parseFrameValue(move.onBlock) !== null)
    .map((move) => {
      const punishes = findPunishes(move.onBlock, myData.moves);
      return { move, punishable: punishes.length > 0, punishes };
    });
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
