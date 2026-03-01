import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { colors } from "@/theme/colors";
import { useFrameData } from "@/hooks/useFrameData";
import { MoveList } from "@/components/frame-data/MoveList";
import { FilterChip } from "@/components/ui/FilterChip";
import { AdBanner } from "@/components/ads/BannerAd";
import { useTranslation } from "react-i18next";
import type { MoveCategory } from "@/types/frame-data";

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
    <View style={styles.root}>
      <View style={styles.versionRow}>
        <Text style={styles.versionText}>
          {t("settings.version", { version: data.version })}
        </Text>
      </View>

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

      <MoveList moves={data.moves} categoryFilter={categoryFilter} />

      <AdBanner />
    </View>
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
  versionRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterContent: {
    alignItems: "center",
  },
});
