import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/useDataStore";
import { SearchBar } from "@/components/ui/SearchBar";
import { MoveRow } from "@/components/frame-data/MoveRow";
import { FilterChip } from "@/components/ui/FilterChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import { searchMoves } from "@/utils/search";
import {
  applyFilters,
  DEFAULT_FILTERS,
  type SearchFilters,
} from "@/utils/searchFilters";
import type { Move } from "@/types/frame-data";
import type { Character } from "@/types/character";
import { WebContainer } from "@/components/ui/WebContainer";
import { PageHead } from "@/components/seo/PageHead";

const STARTUP_PRESETS = [5, 7, 10];
const ONBLOCK_PRESETS = [-4, -6, -8];
// カテゴリは既存の filter.* i18n キー(キャラ詳細画面と共通)を使う
const CATEGORY_PRESETS = ["normal", "special", "super", "throw"] as const;

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
  const styles = useThemedStyles(createStyles);

  const [query, setQuery] = useState("");
  const [allLoaded, setAllLoaded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [charModalVisible, setCharModalVisible] = useState(false);

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

  const hasQuery = query.trim() !== "";
  const hasFilter =
    filters.characterSlug !== null ||
    filters.category !== "all" ||
    filters.maxStartup !== null ||
    filters.maxOnBlock !== null;

  const results = useMemo((): SearchResult[] => {
    if (!allLoaded || (!hasQuery && !hasFilter)) return [];

    const matched: SearchResult[] = [];
    for (const char of characters) {
      if (filters.characterSlug && char.slug !== filters.characterSlug)
        continue;
      const data = frameDataCache[char.slug];
      if (!data) continue;
      const bySearch = hasQuery ? searchMoves(data.moves, query) : data.moves;
      const moves = applyFilters(bySearch, filters);
      if (moves.length > 0) {
        matched.push({ character: char, moves });
      }
    }
    return matched;
  }, [
    allLoaded,
    hasQuery,
    hasFilter,
    query,
    filters,
    characters,
    frameDataCache,
  ]);

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
    [lang, styles],
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <FilterChip
          label={
            filters.characterSlug
              ? ((lang === "ja"
                  ? characters.find((c) => c.slug === filters.characterSlug)
                      ?.nameJa
                  : characters.find((c) => c.slug === filters.characterSlug)
                      ?.name) ?? t("searchFilter.allCharacters"))
              : t("searchFilter.allCharacters")
          }
          selected={filters.characterSlug !== null}
          onPress={() => setCharModalVisible(true)}
        />
        {STARTUP_PRESETS.map((n) => (
          <FilterChip
            key={`su-${n}`}
            label={t("searchFilter.startupMax", { n })}
            selected={filters.maxStartup === n}
            onPress={() =>
              setFilters((f) => ({
                ...f,
                maxStartup: f.maxStartup === n ? null : n,
              }))
            }
          />
        ))}
        {ONBLOCK_PRESETS.map((n) => (
          <FilterChip
            key={`ob-${n}`}
            label={t("searchFilter.onBlockMax", { n })}
            selected={filters.maxOnBlock === n}
            onPress={() =>
              setFilters((f) => ({
                ...f,
                maxOnBlock: f.maxOnBlock === n ? null : n,
              }))
            }
          />
        ))}
        {CATEGORY_PRESETS.map((cat) => (
          <FilterChip
            key={`cat-${cat}`}
            label={t(`filter.${cat}`)}
            selected={filters.category === cat}
            onPress={() =>
              setFilters((f) => ({
                ...f,
                category: f.category === cat ? "all" : cat,
              }))
            }
          />
        ))}
      </ScrollView>

      <CharacterSelectModal
        visible={charModalVisible}
        characters={characters}
        selectedSlug={filters.characterSlug ?? undefined}
        onSelect={(c) => {
          setFilters((f) => ({
            ...f,
            characterSlug: f.characterSlug === c.slug ? null : c.slug,
          }));
          setCharModalVisible(false);
        }}
        onClose={() => setCharModalVisible(false)}
      />

      {(hasQuery || hasFilter) && allLoaded && (
        <Text style={styles.resultCount}>
          {t("search.resultCount", { count: totalCount })}
        </Text>
      )}

      {!allLoaded && (hasQuery || hasFilter) ? (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={40} />
          ))}
        </View>
      ) : !hasQuery && !hasFilter ? (
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    filterRow: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      alignItems: "center",
    },
    resultCount: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    skeletonContainer: {
      padding: 16,
      gap: 12,
    },
    hintText: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.bg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionName: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: "700",
    },
    sectionCount: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
  });
