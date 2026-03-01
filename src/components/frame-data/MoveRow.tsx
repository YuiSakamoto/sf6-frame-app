import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import { useTranslation } from "react-i18next";
import {
  getMoveName,
  getComboScaling,
  getProperties,
  getNotes,
} from "@/utils/moveName";

interface MoveRowProps {
  move: Move;
  onPress?: (move: Move) => void;
  /** trueの場合タップで詳細を展開する（デフォルト: true） */
  expandable?: boolean;
}

function DetailItem({ label, value }: { label: string; value?: string }) {
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

  return (
    <Pressable
      onPress={() => {
        if (expandable) setExpanded((prev) => !prev);
        onPress?.(move);
      }}
      style={[
        styles.container,
        { backgroundColor: expanded ? colors.surfaceLight : colors.surface },
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
        <View style={styles.details}>
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
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 10,
    marginRight: 6,
    width: 12,
  },
  nameColumn: {
    flex: 1,
    marginRight: 8,
  },
  moveName: {
    color: colors.text,
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
    color: colors.textSecondary,
    fontSize: 11,
  },
  properties: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "600",
  },
  frameColumns: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  damage: {
    color: colors.textSecondary,
    fontSize: 12,
    minWidth: 40,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    color: colors.textMuted,
    fontSize: 11,
  },
  detailValue: {
    color: colors.textSecondary,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  notes: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
});
