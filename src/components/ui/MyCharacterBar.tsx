import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import type { Character } from "@/types/character";
import { useTranslation } from "react-i18next";

interface MyCharacterBarProps {
  character: Character | null;
  isSet: boolean;
  onPress: () => void;
  /** 右端に表示するラベル */
  trailingLabel?: string;
}

export function MyCharacterBar({
  character,
  isSet,
  onPress,
  trailingLabel,
}: MyCharacterBarProps) {
  const { t, i18n } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const displayName =
    character && i18n.language === "ja" ? character.nameJa : character?.name;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {isSet && character ? (
        <>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{character.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.trailing}>
            {trailingLabel ?? t("common.change")}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.placeholder}>
            {t("character.selectMyCharacter")}
          </Text>
          <Text style={styles.trailingAccent}>
            {trailingLabel ?? t("common.settings")}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: theme.colors.surface,
      fontWeight: "700",
      fontSize: 12,
    },
    name: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
      flex: 1,
    },
    placeholder: {
      color: theme.colors.textMuted,
      fontSize: 13,
      flex: 1,
    },
    trailing: {
      color: theme.colors.accent,
      fontSize: 12,
    },
    trailingAccent: {
      color: theme.colors.accent,
      fontSize: 12,
    },
  });
