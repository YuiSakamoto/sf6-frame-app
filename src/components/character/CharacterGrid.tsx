import { FlatList, View } from "react-native";
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
      contentContainerStyle={{ padding: 16, gap: 8 }}
      columnWrapperStyle={{ gap: 8 }}
      renderItem={({ item }) => (
        <View style={{ flex: 1, maxWidth: "25%" }}>
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
