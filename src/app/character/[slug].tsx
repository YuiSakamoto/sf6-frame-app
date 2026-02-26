import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { colors } from "@/theme/colors";
import { useFrameData } from "@/hooks/useFrameData";
import { useFilterStore } from "@/stores/useFilterStore";
import { MoveList } from "@/components/frame-data/MoveList";
import { FilterChip } from "@/components/ui/FilterChip";
import { useTranslation } from "react-i18next";
import type { MoveCategory } from "@/types/frame-data";

const CATEGORIES: Array<MoveCategory | "all"> = [
  "all",
  "normal",
  "unique",
  "special",
  "super",
  "throw",
  "command-normal",
];

export default function CharacterDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { data, isLoading, error } = useFrameData(slug ?? null);
  const [categoryFilter, setCategoryFilter] = useState<MoveCategory | "all">("all");

  // ヘッダーにキャラクター名を表示
  useEffect(() => {
    if (data) {
      navigation.setOptions({
        title: i18n.language === "ja" ? data.nameJa : data.name,
      });
    }
  }, [data, i18n.language, navigation]);

  if (isLoading || !data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.textMuted }}>
          {isLoading ? t("common.loading") : error ?? t("common.noData")}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t("settings.version", { version: data.version })}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, marginBottom: 4, flexGrow: 0 }}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={t(`filter.${cat === "command-normal" ? "commandNormal" : cat}`)}
            selected={categoryFilter === cat}
            onPress={() => setCategoryFilter(cat)}
          />
        ))}
      </ScrollView>

      <MoveList moves={data.moves} categoryFilter={categoryFilter} />
    </View>
  );
}
