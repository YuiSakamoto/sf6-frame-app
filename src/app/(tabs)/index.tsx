import { useCallback } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { useDataStore } from "@/stores/useDataStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { Badge } from "@/components/ui/Badge";
import type { Character } from "@/types/character";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, setMyCharacter, isSet } = useMyCharacter();

  const handleCharacterPress = useCallback(
    (character: Character) => {
      router.push(`/character/${character.slug}`);
    },
    [router],
  );

  const handleMyCharacterSelect = useCallback(
    (character: Character) => {
      setMyCharacter(character.slug);
    },
    [setMyCharacter],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          {t("character.myCharacter")}
        </Text>
        {isSet && myCharacter ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: colors.background, fontWeight: "700", fontSize: 16 }}
              >
                {myCharacter.name.charAt(0)}
              </Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              {myCharacter.nameJa}
            </Text>
            <Badge label={myCharacter.name} />
          </View>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            {t("character.selectMyCharacter")}
          </Text>
        )}
      </View>

      {!isSet && (
        <View style={{ maxHeight: 280 }}>
          <CharacterGrid
            characters={characters}
            onSelect={handleMyCharacterSelect}
            selectedSlug={null}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "600",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          {t("character.allCharacters")}
        </Text>
        <CharacterGrid
          characters={characters}
          onSelect={handleCharacterPress}
          selectedSlug={myCharacter?.slug}
        />
      </View>
    </View>
  );
}
