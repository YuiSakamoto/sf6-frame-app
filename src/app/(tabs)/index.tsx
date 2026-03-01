import { useCallback, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { useDataStore } from "@/stores/useDataStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import { MyCharacterBar } from "@/components/ui/MyCharacterBar";
import type { Character } from "@/types/character";

export default function HomeScreen() {
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
      <MyCharacterBar
        character={myCharacter}
        isSet={isSet}
        onPress={() => setModalVisible(true)}
      />
      <CharacterGrid characters={characters} onSelect={handleCharacterPress} />
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
