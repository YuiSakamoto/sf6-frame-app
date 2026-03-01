import { FlatList, StyleSheet, View } from "react-native";
import type { Character } from "@/types/character";
import { CharacterCard } from "./CharacterCard";

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
  return (
    <FlatList
      data={characters}
      keyExtractor={(item) => item.slug}
      numColumns={4}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.column}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <CharacterCard
            character={item}
            onPress={onSelect}
            isSelected={item.slug === selectedSlug}
          />
        </View>
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
    maxWidth: "25%",
  },
});
