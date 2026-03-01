import { FlatList } from "react-native";
import type { Move, MoveCategory } from "@/types/frame-data";
import { MoveRow } from "./MoveRow";
import { ColumnHeader } from "./ColumnHeader";

interface MoveListProps {
  moves: Move[];
  onMovePress?: (move: Move) => void;
  categoryFilter?: MoveCategory | "all";
}

export function MoveList({
  moves,
  onMovePress,
  categoryFilter = "all",
}: MoveListProps) {
  const filteredMoves =
    categoryFilter === "all"
      ? moves
      : moves.filter((m) => m.category === categoryFilter);

  return (
    <FlatList
      data={filteredMoves}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={<ColumnHeader />}
      renderItem={({ item }) => <MoveRow move={item} onPress={onMovePress} />}
      stickyHeaderIndices={[0]}
    />
  );
}
