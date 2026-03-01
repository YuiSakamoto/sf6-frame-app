import { FlatList, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("punish.noPunish")}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={punishes}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>vs {selectedMoveName}</Text>
          <Text style={styles.headerSubtitle}>
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

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    color: colors.frameNegative,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
