import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";

interface ColumnHeaderProps {
  /** 左側のラベル（技名の列見出し） */
  leadingLabel?: string;
}

export function ColumnHeader({ leadingLabel }: ColumnHeaderProps) {
  const { t } = useTranslation();
  const label = leadingLabel ?? t("frameData.command");

  return (
    <View style={styles.container}>
      <Text style={[styles.label, styles.leading]}>{label}</Text>
      <View style={styles.columns}>
        <Text style={[styles.label, styles.column]}>
          {t("frameData.startup")}
        </Text>
        <Text style={[styles.label, styles.column]}>
          {t("frameData.onBlock")}
        </Text>
        <Text style={[styles.label, styles.column]}>
          {t("frameData.onHit")}
        </Text>
        <Text style={[styles.label, styles.columnWide]}>
          {t("frameData.damage")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  leading: {
    flex: 1,
  },
  columns: {
    flexDirection: "row",
    gap: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  column: {
    minWidth: 36,
    textAlign: "center",
  },
  columnWide: {
    minWidth: 40,
    textAlign: "center",
  },
});
