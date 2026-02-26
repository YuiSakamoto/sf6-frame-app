import { Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";
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

  return (
    <Pressable
      onPress={() => onPress(character)}
      style={{
        backgroundColor: isSelected ? colors.accent : colors.surface,
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: isSelected ? colors.accent : colors.border,
        minWidth: 80,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: isSelected
            ? colors.background
            : colors.surfaceLight,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: isSelected ? colors.accent : colors.textSecondary,
          }}
        >
          {character.name.charAt(0)}
        </Text>
      </View>
      <Text
        style={{
          color: isSelected ? colors.background : colors.text,
          fontSize: 11,
          fontWeight: "600",
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {displayName}
      </Text>
    </Pressable>
  );
}
