// src/components/frame-data/MoveDetailSheet.tsx
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import { useResponsive } from "@/hooks/useResponsive";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import {
  getMoveName,
  getComboScaling,
  getNotes,
  getProperties,
} from "@/utils/moveName";

interface MoveDetailSheetProps {
  move: Move | null;
  visible: boolean;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  const styles = useThemedStyles(createStyles);
  if (!value || value === "" || value === "-") return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function MoveDetailSheet({
  move,
  visible,
  onClose,
}: MoveDetailSheetProps) {
  const { t, i18n } = useTranslation();
  const { isWide } = useResponsive();
  const styles = useThemedStyles(createStyles);
  if (!move) return null;

  const lang = i18n.language;
  const stats: Array<{ label: string; value: string; isFrame: boolean }> = [
    { label: t("frameData.startup"), value: move.startup, isFrame: false },
    { label: t("frameData.onBlock"), value: move.onBlock, isFrame: true },
    { label: t("frameData.onHit"), value: move.onHit, isFrame: true },
    { label: t("frameData.damage"), value: move.damage, isFrame: false },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t("common.close")}
      >
        <Pressable
          style={[styles.sheet, isWide && styles.sheetWide]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>{getMoveName(move, lang)}</Text>
            {getProperties(move, lang) ? (
              <Text style={styles.subtitle}>{getProperties(move, lang)}</Text>
            ) : null}
          </View>
          <View style={styles.statRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                {s.isFrame ? (
                  <FrameValue value={s.value} fontSize={16} minWidth={0} />
                ) : (
                  <Text style={styles.statValue}>{s.value || "-"}</Text>
                )}
              </View>
            ))}
          </View>
          <ScrollView style={styles.detailList}>
            <DetailRow label={t("frameData.active")} value={move.active} />
            <DetailRow label={t("frameData.recovery")} value={move.recovery} />
            <DetailRow label={t("frameData.cancel")} value={move.cancel} />
            <DetailRow
              label={t("frameData.comboScaling")}
              value={getComboScaling(move, lang)}
            />
            <DetailRow
              label={t("frameData.driveGaugeGain")}
              value={move.driveGaugeGain}
            />
            <DetailRow
              label={t("frameData.driveGaugeLossBlock")}
              value={move.driveGaugeLossBlock}
            />
            <DetailRow
              label={t("frameData.driveGaugeLossPc")}
              value={move.driveGaugeLossPc}
            />
            <DetailRow
              label={t("frameData.saGaugeGain")}
              value={move.saGaugeGain}
            />
            {getNotes(move, lang) ? (
              <Text style={styles.notes}>{getNotes(move, lang)}</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.surfaceRaised,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      maxHeight: "75%",
    },
    sheetWide: {
      alignSelf: "center",
      width: 480,
      borderRadius: theme.radius.lg,
      marginBottom: "auto",
      marginTop: "auto",
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: "center",
      marginVertical: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      flexShrink: 1,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.sm,
    },
    statRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      gap: 2,
    },
    statLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
    },
    statValue: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    detailList: {
      flexGrow: 0,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    detailLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.sm,
    },
    detailValue: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontVariant: ["tabular-nums"],
      flexShrink: 1,
      textAlign: "right",
    },
    notes: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      lineHeight: 20,
      marginTop: theme.spacing.md,
    },
  });
