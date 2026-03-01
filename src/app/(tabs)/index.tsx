import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { useDataStore } from "@/stores/useDataStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import type { Character } from "@/types/character";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, setMyCharacter, isSet } = useMyCharacter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCharacterPress = useCallback(
    (character: Character) => {
      router.push(`/character/${character.slug}`);
    },
    [router],
  );

  const handleMyCharacterSelect = useCallback(
    (character: Character) => {
      setMyCharacter(character.slug);
      setModalVisible(false);
    },
    [setMyCharacter],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 自キャラ表示バー */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {isSet && myCharacter ? (
          <>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.background,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {myCharacter.name.charAt(0)}
              </Text>
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: "600",
                marginLeft: 8,
                flex: 1,
              }}
            >
              {i18n.language === "ja" ? myCharacter.nameJa : myCharacter.name}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 12 }}>
              {t("common.change")}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>
              {t("character.selectMyCharacter")}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 12 }}>
              {t("common.settings")}
            </Text>
          </>
        )}
      </Pressable>

      {/* キャラクター一覧 */}
      <CharacterGrid characters={characters} onSelect={handleCharacterPress} />

      {/* 自キャラ選択モーダル（初回は閉じられない） */}
      <CharacterSelectModal
        visible={!isSet || modalVisible}
        characters={characters}
        selectedSlug={myCharacter?.slug}
        dismissable={isSet}
        onSelect={handleMyCharacterSelect}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
