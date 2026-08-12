import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";
import { useThemedStyles, useTheme, type Theme } from "@/theme/ThemeContext";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import { useTranslation } from "react-i18next";
import {
  getMoveName,
  getComboScaling,
  getProperties,
  getNotes,
} from "@/utils/moveName";
import { lightImpact } from "@/utils/haptics";

interface MoveRowProps {
  move: Move;
  onPress?: (move: Move) => void;
  /** trueの場合タップで詳細を展開する（デフォルト: true） */
  expandable?: boolean;
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  const styles = useThemedStyles(createStyles);
  if (!value || value === "" || value === "-") return null;
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function MoveRow({ move, onPress, expandable = true }: MoveRowProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const displayName = getMoveName(move, lang);
  const displayProperties = getProperties(move, lang);
  const displayComboScaling = getComboScaling(move, lang);
  const displayNotes = getNotes(move, lang);
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const reduced = useReducedMotion();

  return (
    <Pressable
      onPress={() => {
        if (expandable) {
          lightImpact();
          setExpanded((prev) => !prev);
        }
        onPress?.(move);
      }}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={displayName}
      style={[
        styles.container,
        {
          backgroundColor: expanded
            ? theme.colors.surfaceRaised
            : theme.colors.surface,
        },
      ]}
    >
      <View style={styles.mainRow}>
        {expandable && <Text style={styles.arrow}>{expanded ? "▾" : "▸"}</Text>}
        <View style={styles.nameColumn}>
          <Text style={styles.moveName} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.subRow}>
            {move.input ? <Text style={styles.input}>{move.input}</Text> : null}
            {displayProperties ? (
              <Text style={styles.properties}>{displayProperties}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.frameColumns}>
          <FrameValue value={move.startup} />
          <FrameValue value={move.onBlock} />
          <FrameValue value={move.onHit} />
          <Text style={styles.damage}>{move.damage}</Text>
        </View>
      </View>

      {expanded && (
        <Animated.View
          entering={reduced ? undefined : FadeIn.duration(200)}
          exiting={reduced ? undefined : FadeOut.duration(150)}
          layout={reduced ? undefined : LinearTransition.duration(200)}
          style={styles.details}
        >
          <View style={styles.detailColumns}>
            <View style={styles.detailColumn}>
              <DetailItem label={t("frameData.active")} value={move.active} />
              <DetailItem
                label={t("frameData.recovery")}
                value={move.recovery}
              />
              <DetailItem label={t("frameData.cancel")} value={move.cancel} />
              <DetailItem
                label={t("frameData.comboScaling")}
                value={displayComboScaling}
              />
            </View>
            <View style={styles.detailColumn}>
              <DetailItem
                label={t("frameData.driveGaugeGain")}
                value={move.driveGaugeGain}
              />
              <DetailItem
                label={t("frameData.driveGaugeLossBlock")}
                value={move.driveGaugeLossBlock}
              />
              <DetailItem
                label={t("frameData.driveGaugeLossPc")}
                value={move.driveGaugeLossPc}
              />
              <DetailItem
                label={t("frameData.saGaugeGain")}
                value={move.saGaugeGain}
              />
            </View>
          </View>
          {displayNotes ? (
            <Text style={styles.notes}>{displayNotes}</Text>
          ) : null}
        </Animated.View>
      )}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    mainRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    arrow: {
      color: theme.colors.textMuted,
      fontSize: 10,
      marginRight: 6,
      width: 12,
    },
    nameColumn: {
      flex: 1,
      marginRight: 8,
    },
    moveName: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "600",
    },
    subRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    input: {
      color: theme.colors.textSecondary,
      fontSize: 11,
    },
    properties: {
      color: theme.colors.accent,
      fontSize: 10,
      fontWeight: "600",
    },
    frameColumns: {
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
    details: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    detailColumns: {
      flexDirection: "row",
      gap: 16,
    },
    detailColumn: {
      flex: 1,
    },
    detailItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 3,
    },
    detailLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
    },
    detailValue: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontVariant: ["tabular-nums"],
    },
    notes: {
      color: theme.colors.textMuted,
      fontSize: 10,
      marginTop: 4,
    },
  });
