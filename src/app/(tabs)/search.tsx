import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/useDataStore";
import { SearchBar } from "@/components/ui/SearchBar";
import { MoveRow } from "@/components/frame-data/MoveRow";
import { searchMoves } from "@/utils/search";
import type { Move } from "@/types/frame-data";
import type { Character } from "@/types/character";
import { WebContainer } from "@/components/ui/WebContainer";
import { PageHead } from "@/components/seo/PageHead";

interface SearchResult {
  character: Character;
  moves: Move[];
}

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const characters = useDataStore((s) => s.characters);
  const loadFrameData = useDataStore((s) => s.loadFrameData);
  const frameDataCache = useDataStore((s) => s.frameDataCache);

  const [query, setQuery] = useState("");
  const [allLoaded, setAllLoaded] = useState(false);

  // 全キャラのフレームデータを事前ロード
  useEffect(() => {
    const loadAll = async () => {
      await Promise.all(characters.map((c) => loadFrameData(c.slug)));
      setAllLoaded(true);
    };
    if (characters.length > 0) {
      loadAll();
    }
  }, [characters, loadFrameData]);

  const results = useMemo((): SearchResult[] => {
    if (!allLoaded || query.trim() === "") return [];

    const matched: SearchResult[] = [];
    for (const char of characters) {
      const data = frameDataCache[char.slug];
      if (!data) continue;
      const moves = searchMoves(data.moves, query);
      if (moves.length > 0) {
        matched.push({ character: char, moves });
      }
    }
    return matched;
  }, [allLoaded, query, characters, frameDataCache]);

  const totalCount = useMemo(
    () => results.reduce((sum, r) => sum + r.moves.length, 0),
    [results],
  );

  // FlatList用にフラット化（セクションヘッダー + 技行）
  type ListItem =
    | { type: "header"; character: Character; count: number }
    | { type: "move"; move: Move };

  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    for (const result of results) {
      items.push({
        type: "header",
        character: result.character,
        count: result.moves.length,
      });
      for (const move of result.moves) {
        items.push({ type: "move", move });
      }
    }
    return items;
  }, [results]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        const name =
          lang === "ja" ? item.character.nameJa : item.character.name;
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionName}>{name}</Text>
            <Text style={styles.sectionCount}>{item.count}</Text>
          </View>
        );
      }
      return <MoveRow move={item.move} />;
    },
    [lang],
  );

  const keyExtractor = useCallback(
    (item: ListItem, index: number) =>
      item.type === "header"
        ? `header-${item.character.slug}`
        : `move-${index}`,
    [],
  );

  return (
    <WebContainer>
      <PageHead
        title="SF6 Move Search - Search All Character Moves"
        description="Search moves across all Street Fighter 6 characters by name or command input. Find frame data for any move instantly."
        path="/search"
      />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t("search.placeholder")}
      />

      {query.trim() !== "" && allLoaded && (
        <Text style={styles.resultCount}>
          {t("search.resultCount", { count: totalCount })}
        </Text>
      )}

      {!allLoaded && query.trim() !== "" ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : query.trim() === "" ? (
        <View style={styles.center}>
          <Text style={styles.hintText}>{t("search.hint")}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.hintText}>{t("search.noResults")}</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={30}
          maxToRenderPerBatch={20}
        />
      )}
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionName: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
