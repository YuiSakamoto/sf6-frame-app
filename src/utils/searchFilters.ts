import type { Move, MoveCategory } from "@/types/frame-data";
import { parseFrameValue } from "./frameAdvantage";

export interface SearchFilters {
  characterSlug: string | null;
  category: MoveCategory | "all";
  /** 発生 N フレーム以下(null = 無効) */
  maxStartup: number | null;
  /** ガード時 N 以下(負数。null = 無効)。確反探し用 */
  maxOnBlock: number | null;
}

export const DEFAULT_FILTERS: SearchFilters = {
  characterSlug: null,
  category: "all",
  maxStartup: null,
  maxOnBlock: null,
};

export function applyFilters(
  moves: Move[],
  filters: Omit<SearchFilters, "characterSlug">,
): Move[] {
  return moves.filter((move) => {
    if (filters.category !== "all" && move.category !== filters.category) {
      return false;
    }
    if (filters.maxStartup !== null) {
      const startup = parseFrameValue(move.startup);
      if (startup === null || startup > filters.maxStartup) return false;
    }
    if (filters.maxOnBlock !== null) {
      const onBlock = parseFrameValue(move.onBlock);
      if (onBlock === null || onBlock > filters.maxOnBlock) return false;
    }
    return true;
  });
}
