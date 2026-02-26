import { Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import { useTranslation } from "react-i18next";

interface MoveRowProps {
  move: Move;
  onPress?: (move: Move) => void;
}

export function MoveRow({ move, onPress }: MoveRowProps) {
  const { i18n } = useTranslation();
  const displayName = i18n.language === "ja" ? move.nameJa : move.name;

  return (
    <Pressable
      onPress={() => onPress?.(move)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text
          style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {move.input}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
        <FrameValue value={move.startup} />
        <FrameValue value={move.onBlock} />
        <FrameValue value={move.onHit} />
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            minWidth: 40,
            textAlign: "center",
            fontVariant: ["tabular-nums"],
          }}
        >
          {move.damage}
        </Text>
      </View>
    </Pressable>
  );
}
