import { FlatList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
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
  const styles = useThemedStyles(createStyles);

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
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>vs {selectedMoveName}</Text>
            <Text style={styles.headerSubtitle}>
              {t("punish.result", { count: punishes.length })}
            </Text>
          </View>
          <View style={styles.columnHeader}>
            <Text style={[styles.columnLabel, styles.columnLeading]}>
              {t("frameData.title")}
            </Text>
            <Text style={styles.columnLabel}>{t("frameData.startup")}</Text>
            <Text style={[styles.columnLabel, styles.columnWide]}>
              {t("frameData.damage")}
            </Text>
          </View>
        </>
      }
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 40).duration(200)}>
          <PunishMoveRow punish={item} isFastest={index === 0} />
        </Animated.View>
      )}
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyContainer: {
      padding: 32,
      alignItems: "center",
    },
    emptyText: {
      color: theme.colors.frameNegative,
      fontSize: 14,
      fontWeight: "600",
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.bg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: "600",
    },
    headerSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    columnHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.bg,
    },
    columnLeading: {
      flex: 1,
    },
    columnLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: "600",
      minWidth: 36,
      textAlign: "center",
    },
    columnWide: {
      minWidth: 40,
    },
  });
