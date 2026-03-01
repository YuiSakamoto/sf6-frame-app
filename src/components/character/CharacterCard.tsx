import { Pressable, Text, View } from "react-native";
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
      style={{
        backgroundColor: isSelected ? colors.accent : colors.surface,
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: isSelected ? colors.accent : colors.border,
        minWidth: 80,
      }}
    >
      {/* キャラクターアバター（グラデーション風背景） */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        {/* 上半分 */}
        <View
          style={{
            flex: 1,
            backgroundColor: isSelected ? colors.background : colorStart,
          }}
        />
        {/* 下半分 */}
        <View
          style={{
            flex: 1,
            backgroundColor: isSelected ? colors.background : colorEnd,
          }}
        />
        {/* 頭文字オーバーレイ */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: isSelected ? colors.accent : "#FFFFFF",
              textShadowColor: "rgba(0,0,0,0.4)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {character.name.charAt(0)}
          </Text>
        </View>
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
