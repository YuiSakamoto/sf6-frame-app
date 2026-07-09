import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles, useTheme, type Theme } from "@/theme/ThemeContext";
import { useDataStore } from "@/stores/useDataStore";

interface AppHeaderProps {
  /** 現在の画面名（タブ名やページタイトル） */
  sectionTitle?: string;
  /** 戻るボタンを表示する際に呼び出される */
  onBack?: () => void;
}

/**
 * アプリ共通ヘッダー。
 * - サイト名（SF6 Frame Data）を常に表示し、ランディング時にサイトが分かるようにする
 * - 現在のセクション名を副題として表示
 * - データバージョンを右側に表示
 */
export function AppHeader({ sectionTitle, onBack }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const version = useDataStore((s) => s.version?.version);
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={theme.colors.accent}
            />
          </Pressable>
        ) : null}
        <View style={styles.titleColumn}>
          <Text style={styles.brand} numberOfLines={1}>
            SF6 Frame Data
          </Text>
          {sectionTitle ? (
            <Text style={styles.section} numberOfLines={1}>
              {sectionTitle}
            </Text>
          ) : null}
        </View>
        {version ? (
          <Text style={styles.version} numberOfLines={1}>
            {t("settings.version", { version })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.bg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 8,
    },
    backButton: {
      marginRight: 4,
      marginBottom: 2,
      paddingVertical: 2,
    },
    titleColumn: {
      flex: 1,
      minWidth: 0,
    },
    brand: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    section: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 2,
    },
    version: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontVariant: ["tabular-nums"],
    },
  });
