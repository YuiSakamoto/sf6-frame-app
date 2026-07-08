import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles, useTheme, type Theme } from "@/theme/ThemeContext";
import type { PunishOption } from "@/utils/punishCalc";
import { FrameValue } from "@/components/frame-data/FrameValue";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "react-i18next";
import { getMoveName, getComboScaling, getProperties } from "@/utils/moveName";

interface PunishMoveRowProps {
  punish: PunishOption;
  isFastest: boolean;
}

export function PunishMoveRow({ punish, isFastest }: PunishMoveRowProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const displayName = getMoveName(punish.move, lang);
  const displayComboScaling = getComboScaling(punish.move, lang);
  const displayProperties = getProperties(punish.move, lang);
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isFastest
            ? theme.colors.positiveSubtle
            : theme.colors.surface,
          borderLeftWidth: isFastest ? 3 : 0,
        },
      ]}
    >
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.moveName} numberOfLines={1}>
            {displayName}
          </Text>
          {isFastest && (
            <Badge
              label={t("punish.fastestPunish")}
              color={theme.colors.surface}
              bgColor={theme.colors.framePositive}
            />
          )}
        </View>
        <View style={styles.subRow}>
          <Text style={styles.input}>{punish.move.input}</Text>
          {punish.framesToSpare > 0 && (
            <Text style={styles.framesToSpare}>
              {t("punish.framesToSpare", { frames: punish.framesToSpare })}
            </Text>
          )}
        </View>
        {displayComboScaling ? (
          <Text style={styles.comboScaling}>
            {t("frameData.comboScaling")}: {displayComboScaling}
          </Text>
        ) : null}
      </View>
      <View style={styles.values}>
        <View style={styles.frameRow}>
          <FrameValue value={String(punish.startup)} />
          <Text style={styles.damage}>{punish.move.damage}</Text>
        </View>
        {displayProperties ? (
          <Text style={styles.properties}>{displayProperties}</Text>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      borderLeftColor: theme.colors.framePositive,
    },
    info: {
      flex: 1,
      marginRight: 8,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    moveName: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "600",
    },
    subRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
    },
    input: {
      color: theme.colors.textSecondary,
      fontSize: 11,
    },
    framesToSpare: {
      color: theme.colors.framePositive,
      fontSize: 10,
    },
    comboScaling: {
      color: theme.colors.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    values: {
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 2,
    },
    frameRow: {
      flexDirection: "row",
      gap: 4,
      alignItems: "center",
    },
    damage: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      minWidth: 40,
      textAlign: "center",
      fontVariant: ["tabular-nums"],
    },
    properties: {
      color: theme.colors.accent,
      fontSize: 9,
      textAlign: "right",
    },
  });
