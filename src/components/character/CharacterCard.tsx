import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { getCharacterColors } from "@/theme/characterColors";
import type { Character } from "@/types/character";
import { useTranslation } from "react-i18next";

interface CharacterCardProps {
  character: Character;
  onPress: (character: Character) => void;
  isSelected?: boolean;
}

export function CharacterCard({
  character,
  onPress,
  isSelected = false,
}: CharacterCardProps) {
  const { i18n } = useTranslation();
  const displayName =
    i18n.language === "ja" ? character.nameJa : character.name;
  const [colorStart, colorEnd] = getCharacterColors(character.slug);

  return (
    <Pressable
      onPress={() => onPress(character)}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? colors.accent : colors.surface,
          borderColor: isSelected ? colors.accent : colors.border,
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatarHalf,
            {
              backgroundColor: isSelected ? colors.background : colorStart,
            },
          ]}
        />
        <View
          style={[
            styles.avatarHalf,
            {
              backgroundColor: isSelected ? colors.background : colorEnd,
            },
          ]}
        />
        <View style={styles.avatarOverlay}>
          <Text
            style={[
              styles.avatarText,
              { color: isSelected ? colors.accent : "#FFFFFF" },
            ]}
          >
            {character.name.charAt(0)}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.name,
          { color: isSelected ? colors.background : colors.text },
        ]}
        numberOfLines={1}
      >
        {displayName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1.5,
    minWidth: 80,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 6,
  },
  avatarHalf: {
    flex: 1,
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  name: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
