import { useMemo } from "react";
import type { Move } from "@/types/frame-data";
import type { PunishOption } from "@/utils/punishCalc";
import { useFrameData } from "./useFrameData";
import { useMyCharacter } from "./useMyCharacter";
import {
  getPunishableMoves,
  getPunishOptions,
  sortPunishes,
  type SortMode,
} from "@/services/punishService";

interface PunishFinderResult {
  /** 相手の確反可能な技一覧 */
  punishableMoves: Move[];
  /** 選択した相手技に対する確反リスト */
  punishOptions: PunishOption[];
  /** 自キャラデータのロード状態 */
  isLoading: boolean;
  /** 相手キャラデータのロード状態 */
  isOpponentLoading: boolean;
}

export function usePunishFinder(
  opponentSlug: string | null,
  selectedMove: Move | null,
  sortMode: SortMode = "startup",
): PunishFinderResult {
  const { myCharacterSlug } = useMyCharacter();
  const { data: myData, isLoading } = useFrameData(myCharacterSlug);
  const { data: opponentData, isLoading: isOpponentLoading } =
    useFrameData(opponentSlug);

  const punishableMoves = useMemo(() => {
    if (!opponentData) return [];
    return getPunishableMoves(opponentData);
  }, [opponentData]);

  const punishOptions = useMemo(() => {
    if (!selectedMove || !myData) return [];
    const options = getPunishOptions(selectedMove, myData);
    return sortPunishes(options, sortMode);
  }, [selectedMove, myData, sortMode]);

  return {
    punishableMoves,
    punishOptions,
    isLoading,
    isOpponentLoading,
  };
}
