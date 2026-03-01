import { FlatList, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import type { PunishOption } from "@/utils/punishCalc";
import { PunishMoveRow } from "./PunishMoveRow";
import { useTranslation } from "react-i18next";

interface PunishResultProps {
  punishes: PunishOption[];
  selectedMoveName: string;
}

export function PunishResult({
  punishes,
  selectedMoveName,
}: PunishResultProps) {
  const { t } = useTranslation();

  if (punishes.length === 0) {
    return (
      <View
        style={{
          padding: 32,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.frameNegative,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {t("punish.noPunish")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={punishes}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{ color: colors.accent, fontSize: 13, fontWeight: "600" }}
          >
            vs {selectedMoveName}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}
          >
            {t("punish.result", { count: punishes.length })}
          </Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <PunishMoveRow punish={item} isFastest={index === 0} />
      )}
    />
  );
}
