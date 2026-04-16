import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { colors } from "@/theme/colors";
import { useFrameData } from "@/hooks/useFrameData";
import { MoveList } from "@/components/frame-data/MoveList";
import type { FrameSortMode } from "@/components/frame-data/MoveList";
import { FilterChip } from "@/components/ui/FilterChip";
import { AdBanner } from "@/components/ads/BannerAd";
import { useTranslation } from "react-i18next";
import type { MoveCategory } from "@/types/frame-data";
import { WebContainer } from "@/components/ui/WebContainer";
import { PageHead } from "@/components/seo/PageHead";

const CATEGORIES: Array<MoveCategory | "all"> = [
  "all",
  "normal",
  "unique",
  "special",
  "super",
  "throw",
  "common",
];

export default function CharacterDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { data, isLoading, error } = useFrameData(slug ?? null);
  const [categoryFilter, setCategoryFilter] = useState<MoveCategory | "all">(
    "all",
  );
  const [sortMode, setSortMode] = useState<FrameSortMode>("default");

  useEffect(() => {
    if (data) {
      navigation.setOptions({
        title: i18n.language === "ja" ? data.nameJa : data.name,
      });
    }
  }, [data, i18n.language, navigation]);

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {isLoading ? t("common.loading") : (error ?? t("common.noData"))}
        </Text>
      </View>
    );
  }

  return (
    <WebContainer>
      <PageHead
        title={`${data.name} Frame Data - SF6 ${data.name} Moves, Startup & Advantage`}
        description={`Complete ${data.name} frame data for Street Fighter 6. All normals, specials, supers with startup, active, recovery, block advantage, and hit advantage frames.`}
        path={`/character/${slug}`}
      />

      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={t(`filter.${cat}`)}
              selected={categoryFilter === cat}
              onPress={() => setCategoryFilter(cat)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.sortRow}>
        <FilterChip
          label={t("sort.default")}
          selected={sortMode === "default"}
          onPress={() => setSortMode("default")}
        />
        <FilterChip
          label={t("sort.startup")}
          selected={sortMode === "startup"}
          onPress={() => setSortMode("startup")}
        />
        <FilterChip
          label={t("sort.onBlock")}
          selected={sortMode === "onBlock"}
          onPress={() => setSortMode("onBlock")}
        />
        <FilterChip
          label={t("sort.damage")}
          selected={sortMode === "damage"}
          onPress={() => setSortMode("damage")}
        />
      </View>

      <MoveList
        moves={data.moves}
        categoryFilter={categoryFilter}
        sortMode={sortMode}
      />

      <AdBanner />
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textMuted,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterContent: {
    alignItems: "center",
  },
  sortRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
