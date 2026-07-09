// src/components/frame-data/FrameTable.tsx
import { useMemo, useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import {
  TABLE_COLUMNS,
  sortMovesByColumn,
  type ColumnKey,
} from "./tableColumns";
import { useResponsive } from "@/hooks/useResponsive";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { getMoveName, getProperties } from "@/utils/moveName";

const ROW_HEIGHT = 48;
const NAME_COLUMN_WIDTH = 132;

interface SortState {
  key: ColumnKey | null;
  direction: "asc" | "desc";
}

interface FrameTableProps {
  moves: Move[];
  onRowPress: (move: Move) => void;
}

export function FrameTable({ moves, onRowPress }: FrameTableProps) {
  const { t, i18n } = useTranslation();
  const { isWide } = useResponsive();
  const styles = useThemedStyles(createStyles);
  const [sort, setSort] = useState<SortState>({ key: null, direction: "asc" });

  const sorted = useMemo(
    () => sortMovesByColumn(moves, sort.key, sort.direction),
    [moves, sort],
  );

  // 同じ列をタップするたび asc → desc → 解除 をトグルする
  const handleSortPress = useCallback((key: ColumnKey) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" };
    });
  }, []);

  const sortIndicator = (key: ColumnKey): string => {
    if (sort.key !== key) return "";
    return sort.direction === "asc" ? " ▲" : " ▼";
  };

  const renderColumnHeader = (withSort: boolean) => (
    <View style={styles.headerRow}>
      {TABLE_COLUMNS.map((col) => (
        <Pressable
          key={col.key}
          disabled={!withSort}
          onPress={() => handleSortPress(col.key)}
          accessibilityRole="button"
          accessibilityLabel={t(col.labelKey)}
          style={[styles.headerCell, { width: col.width }]}
        >
          <Text
            style={[
              styles.headerLabel,
              sort.key === col.key && styles.headerLabelActive,
            ]}
            numberOfLines={1}
          >
            {t(col.labelKey)}
            {sortIndicator(col.key)}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderNameCell = (move: Move, index: number) => (
    <Pressable
      key={`name-${index}`}
      onPress={() => onRowPress(move)}
      accessibilityRole="button"
      accessibilityLabel={getMoveName(move, i18n.language)}
      style={[styles.nameCell, index % 2 === 1 && styles.rowAlt]}
    >
      <Text style={styles.moveName} numberOfLines={1}>
        {getMoveName(move, i18n.language)}
      </Text>
      {getProperties(move, i18n.language) ? (
        <Text style={styles.properties} numberOfLines={1}>
          {getProperties(move, i18n.language)}
        </Text>
      ) : null}
    </Pressable>
  );

  const renderValueRow = (move: Move, index: number) => (
    <Pressable
      key={`values-${index}`}
      onPress={() => onRowPress(move)}
      style={[styles.valueRow, index % 2 === 1 && styles.rowAlt]}
    >
      {TABLE_COLUMNS.map((col) =>
        col.isFrame ? (
          <View key={col.key} style={[styles.valueCell, { width: col.width }]}>
            <FrameValue value={col.getValue(move)} minWidth={col.width - 8} />
          </View>
        ) : (
          <View key={col.key} style={[styles.valueCell, { width: col.width }]}>
            <Text style={styles.valueText} numberOfLines={1}>
              {col.getValue(move)}
            </Text>
          </View>
        ),
      )}
    </Pressable>
  );

  if (isWide) {
    // デスクトップ: 全列を1画面に表示、ヘッダーでソート
    return (
      <ScrollView>
        <View style={styles.wideHeaderRow}>
          <View style={[styles.headerCell, { width: NAME_COLUMN_WIDTH }]}>
            <Text style={styles.headerLabel}>{t("frameData.command")}</Text>
          </View>
          {renderColumnHeader(true)}
        </View>
        {sorted.map((move, i) => (
          <View key={i} style={styles.wideRow}>
            {renderNameCell(move, i)}
            {renderValueRow(move, i)}
          </View>
        ))}
      </ScrollView>
    );
  }

  // モバイル: 技名列固定 + 数値列横スクロール(行高固定で左右同期)
  return (
    <ScrollView>
      <View style={styles.mobileContainer}>
        <View style={styles.nameColumn}>
          <View style={[styles.headerCell, { width: NAME_COLUMN_WIDTH }]}>
            <Text style={styles.headerLabel}>{t("frameData.command")}</Text>
          </View>
          {sorted.map(renderNameCell)}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {renderColumnHeader(true)}
            {sorted.map(renderValueRow)}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    mobileContainer: {
      flexDirection: "row",
    },
    nameColumn: {
      width: NAME_COLUMN_WIDTH,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      backgroundColor: theme.colors.bg,
    },
    headerRow: {
      flexDirection: "row",
      height: 32,
    },
    wideHeaderRow: {
      flexDirection: "row",
      height: 32,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    wideRow: {
      flexDirection: "row",
    },
    headerCell: {
      height: 32,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xs,
    },
    headerLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      fontWeight: "600",
      textAlign: "center",
    },
    headerLabelActive: {
      color: theme.colors.accent,
    },
    nameCell: {
      height: ROW_HEIGHT,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    valueRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowAlt: {
      backgroundColor: theme.colors.surface,
    },
    moveName: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    properties: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      marginTop: 2,
    },
    valueCell: {
      alignItems: "center",
      justifyContent: "center",
    },
    valueText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontVariant: ["tabular-nums"],
      textAlign: "center",
    },
  });
