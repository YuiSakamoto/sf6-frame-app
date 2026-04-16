import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { useDataStore } from "@/stores/useDataStore";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { WebContainer } from "@/components/ui/WebContainer";
import { PageHead } from "@/components/seo/PageHead";
import { useTranslation } from "react-i18next";
import type { Character } from "@/types/character";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const characters = useDataStore((s) => s.characters);

  const handleCharacterPress = useCallback(
    (character: Character) => {
      router.push(`/character/${character.slug}`);
    },
    [router],
  );

  return (
    <WebContainer>
      <PageHead
        title="SF6 Frame Data - Street Fighter 6 Frame Data & Punish Finder"
        description="Complete Street Fighter 6 frame data for all 29 characters. Startup, recovery, block advantage, hit advantage, and punish finder. Updated for the latest SF6 patch."
        path="/"
      />
      <View style={styles.guideRow}>
        <Text style={styles.guideText}>{t("character.gridGuide")}</Text>
      </View>
      <CharacterGrid characters={characters} onSelect={handleCharacterPress} />
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  guideRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  guideText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
