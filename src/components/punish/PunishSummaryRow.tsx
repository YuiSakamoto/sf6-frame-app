import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import type { MovePunishSummary } from "@/services/punishService";
import { FrameValue } from "@/components/frame-data/FrameValue";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { getMoveName } from "@/utils/moveName";

interface PunishSummaryRowProps {
  summary: MovePunishSummary;
  expanded: boolean;
  onToggle: () => void;
}

export function PunishSummaryRow({
  summary,
  expanded,
  onToggle,
}: PunishSummaryRowProps) {
  const { t, i18n } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const reduced = useReducedMotion();
  const { move, punishable, punishes } = summary;
  const name = getMoveName(move, i18n.language);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onToggle}
        disabled={!punishable}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${name} ${
          punishable
            ? t("punish.punishableCount", { count: punishes.length })
            : t("punish.noPunish")
        }`}
        style={styles.row}
      >
        <View style={styles.nameColumn}>
          <Text
            style={[styles.moveName, !punishable && styles.moveNameMuted]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <FrameValue value={move.onBlock} />
        {punishable ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t("punish.punishableCount", { count: punishes.length })}
            </Text>
          </View>
        ) : (
          <Text style={styles.noPunish}>{t("punish.noPunish")}</Text>
        )}
      </Pressable>

      {expanded && punishable && (
        <Animated.View
          entering={reduced ? undefined : FadeIn.duration(150)}
          exiting={reduced ? undefined : FadeOut.duration(100)}
          style={styles.punishList}
        >
          {punishes.map((p, i) => (
            <View key={i} style={styles.punishRow}>
              <Text style={styles.punishName} numberOfLines={1}>
                {getMoveName(p.move, i18n.language)}
              </Text>
              <Text style={styles.punishMeta}>
                {t("frameData.startup")} {p.startup}
              </Text>
              <Text style={styles.punishMeta}>+{p.framesToSpare}F</Text>
              <Text style={styles.punishDamage}>{p.move.damage}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 48,
    },
    nameColumn: {
      flex: 1,
    },
    moveName: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    moveNameMuted: {
      color: theme.colors.textSecondary,
      fontWeight: "400",
    },
    badge: {
      backgroundColor: theme.colors.positiveSubtle,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      minWidth: 72,
      alignItems: "center",
    },
    badgeText: {
      color: theme.colors.framePositive,
      fontSize: theme.fontSize.xs,
      fontWeight: "700",
    },
    noPunish: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      minWidth: 72,
      textAlign: "center",
    },
    punishList: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.framePositive,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.xs,
    },
    punishRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
    },
    punishName: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
    },
    punishMeta: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.xs,
      fontVariant: ["tabular-nums"],
    },
    punishDamage: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontVariant: ["tabular-nums"],
      minWidth: 40,
      textAlign: "right",
    },
  });
