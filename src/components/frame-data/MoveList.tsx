import { FlatList, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import type { Move, MoveCategory } from "@/types/frame-data";
import { MoveRow } from "./MoveRow";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const filteredMoves =
    categoryFilter === "all"
      ? moves
      : moves.filter((m) => m.category === categoryFilter);

  return (
    <FlatList
      data={filteredMoves}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              flex: 1,
              color: colors.textMuted,
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            {t("frameData.command")}
          </Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                minWidth: 36,
                textAlign: "center",
              }}
            >
              {t("frameData.startup")}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                minWidth: 36,
                textAlign: "center",
              }}
            >
              {t("frameData.onBlock")}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                minWidth: 36,
                textAlign: "center",
              }}
            >
              {t("frameData.onHit")}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                minWidth: 40,
                textAlign: "center",
              }}
            >
              {t("frameData.damage")}
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => <MoveRow move={item} onPress={onMovePress} />}
      stickyHeaderIndices={[0]}
    />
  );
}
