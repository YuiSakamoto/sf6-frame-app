import { useMemo } from "react";
import { useFrameData } from "./useFrameData";
import { useMyCharacter } from "./useMyCharacter";
import {
  getPunishSummaries,
  sortPunishes,
  type MovePunishSummary,
  type SortMode,
} from "@/services/punishService";

interface PunishFinderResult {
  /** 相手の全技の確反サマリ(確反リストはソート済み) */
  summaries: MovePunishSummary[];
  isLoading: boolean;
  isOpponentLoading: boolean;
}

export function usePunishFinder(
  opponentSlug: string | null,
  sortMode: SortMode = "startup",
): PunishFinderResult {
  const { myCharacterSlug } = useMyCharacter();
  const { data: myData, isLoading } = useFrameData(myCharacterSlug);
  const { data: opponentData, isLoading: isOpponentLoading } =
    useFrameData(opponentSlug);

  const summaries = useMemo(() => {
    if (!opponentData || !myData) return [];
    return getPunishSummaries(opponentData, myData).map((s) => ({
      ...s,
      punishes: sortPunishes(s.punishes, sortMode),
    }));
  }, [opponentData, myData, sortMode]);

  return { summaries, isLoading, isOpponentLoading };
}
