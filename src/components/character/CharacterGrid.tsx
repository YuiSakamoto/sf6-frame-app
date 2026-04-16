import { FlatList, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { Character } from "@/types/character";
import { CharacterCard } from "./CharacterCard";
import { useResponsive } from "@/hooks/useResponsive";

interface CharacterGridProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  selectedSlug?: string | null;
}

export function CharacterGrid({
  characters,
  onSelect,
  selectedSlug,
}: CharacterGridProps) {
  const { gridColumns } = useResponsive();
  const maxWidthPercent = `${100 / gridColumns}%` as const;

  return (
    <FlatList
      key={gridColumns}
      data={characters}
      keyExtractor={(item) => item.slug}
      numColumns={gridColumns}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.column}
      renderItem={({ item, index }) => (
        <Animated.View
          entering={FadeInUp.delay(index * 30).duration(200)}
          style={[styles.item, { maxWidth: maxWidthPercent }]}
        >
          <CharacterCard
            character={item}
            onPress={onSelect}
            isSelected={item.slug === selectedSlug}
          />
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
  },
  column: {
    gap: 8,
  },
  item: {
    flex: 1,
  },
});
