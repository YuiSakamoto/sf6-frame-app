import { useState, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { useFrameData } from "@/hooks/useFrameData";
import { FrameTable } from "@/components/frame-data/FrameTable";
import { MoveDetailSheet } from "@/components/frame-data/MoveDetailSheet";
import { FilterChip } from "@/components/ui/FilterChip";
import { AdBanner } from "@/components/ads/BannerAd";
import { useTranslation } from "react-i18next";
import type { Move, MoveCategory } from "@/types/frame-data";
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
  const [detailMove, setDetailMove] = useState<Move | null>(null);
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    if (data) {
      navigation.setOptions({
        title: i18n.language === "ja" ? data.nameJa : data.name,
      });
    }
  }, [data, i18n.language, navigation]);

  // data 読み込み前は空配列(フックは早期 return より前に置く)
  const filteredMoves = useMemo(() => {
    const moves = data?.moves ?? [];
    return categoryFilter === "all"
      ? moves
      : moves.filter((m) => m.category === categoryFilter);
  }, [data?.moves, categoryFilter]);

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

      <FrameTable moves={filteredMoves} onRowPress={setDetailMove} />
      <MoveDetailSheet
        move={detailMove}
        visible={detailMove !== null}
        onClose={() => setDetailMove(null)}
      />

      <AdBanner />
    </WebContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: theme.colors.textMuted,
    },
    filterRow: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    filterContent: {
      alignItems: "center",
    },
  });
