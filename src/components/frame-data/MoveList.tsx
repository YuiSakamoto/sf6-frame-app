import { useMemo } from "react";
import { FlatList } from "react-native";
import type { Move, MoveCategory } from "@/types/frame-data";
import { MoveRow } from "./MoveRow";
import { ColumnHeader } from "./ColumnHeader";
import { parseFrameValue } from "@/utils/frameAdvantage";

export type FrameSortMode = "default" | "startup" | "onBlock" | "damage";

interface MoveListProps {
  moves: Move[];
  onMovePress?: (move: Move) => void;
  categoryFilter?: MoveCategory | "all";
  sortMode?: FrameSortMode;
}

function sortMoves(moves: Move[], mode: FrameSortMode): Move[] {
  if (mode === "default") return moves;

  return [...moves].sort((a, b) => {
    const aVal = parseFrameValue(mode === "damage" ? a.damage : a[mode]);
    const bVal = parseFrameValue(mode === "damage" ? b.damage : b[mode]);
    // null値は末尾に
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    // ダメージは降順、それ以外は昇順
    return mode === "damage" ? bVal - aVal : aVal - bVal;
  });
}

export function MoveList({
  moves,
  onMovePress,
  categoryFilter = "all",
  sortMode = "default",
}: MoveListProps) {
  const filteredAndSorted = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? moves
        : moves.filter((m) => m.category === categoryFilter);
    return sortMoves(filtered, sortMode);
  }, [moves, categoryFilter, sortMode]);

  return (
    <FlatList
      data={filteredAndSorted}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={<ColumnHeader />}
      renderItem={({ item }) => <MoveRow move={item} onPress={onMovePress} />}
      stickyHeaderIndices={[0]}
    />
  );
}
