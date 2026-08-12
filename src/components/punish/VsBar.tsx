import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { Character } from "@/types/character";
import { useTheme, useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { getCharacterColors } from "@/theme/characterColors";

interface VsBarProps {
  myCharacter: Character | null;
  opponent: Character | null;
  onPressMy: () => void;
  onPressOpponent: () => void;
  onSwap: () => void;
}

function CharacterChip({
  character,
  placeholder,
  onPress,
}: {
  character: Character | null;
  placeholder: string;
  onPress: () => void;
}) {
  const { i18n, t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const name = character
    ? i18n.language === "ja"
      ? character.nameJa
      : character.name
    : placeholder;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name} (${t("common.change")})`}
      style={styles.chip}
    >
      {character ? (
        <View
          style={[
            styles.avatar,
            { backgroundColor: getCharacterColors(character.slug)[0] },
          ]}
        >
          <Text style={styles.avatarText}>{character.name.charAt(0)}</Text>
        </View>
      ) : null}
      <Text
        style={[styles.chipName, !character && styles.chipPlaceholder]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text style={styles.caret}>▾</Text>
    </Pressable>
  );
}

export function VsBar({
  myCharacter,
  opponent,
  onPressMy,
  onPressOpponent,
  onSwap,
}: VsBarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <CharacterChip
        character={myCharacter}
        placeholder={t("character.selectMyCharacter")}
        onPress={onPressMy}
      />
      <Text style={styles.vs}>vs</Text>
      <CharacterChip
        character={opponent}
        placeholder={t("punish.selectOpponent")}
        onPress={onPressOpponent}
      />
      <Pressable
        onPress={onSwap}
        disabled={!myCharacter || !opponent}
        accessibilityRole="button"
        accessibilityLabel={t("punish.swap")}
        style={styles.swapButton}
      >
        <Ionicons
          name="swap-horizontal"
          size={18}
          color={
            myCharacter && opponent
              ? theme.colors.textSecondary
              : theme.colors.textMuted
          }
        />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    chip: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      minHeight: 44,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: theme.radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: theme.fontSize.xs,
      fontWeight: "700",
    },
    chipName: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    chipPlaceholder: {
      color: theme.colors.textMuted,
      fontWeight: "400",
    },
    vs: {
      color: theme.colors.accent,
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    swapButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    caret: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
    },
  });
