import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 12,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
    fontSize: 13,
    flex: 1,
  },
  trailing: {
    color: colors.accent,
    fontSize: 12,
  },
  trailingAccent: {
    color: colors.accent,
    fontSize: 12,
  },
});
