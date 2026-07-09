import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/useDataStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { usePunishFinder } from "@/hooks/usePunishFinder";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import { VsBar } from "@/components/punish/VsBar";
import { PunishSummaryRow } from "@/components/punish/PunishSummaryRow";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchBar } from "@/components/ui/SearchBar";
import { WebContainer } from "@/components/ui/WebContainer";
import { PageHead } from "@/components/seo/PageHead";
import { searchMoves } from "@/utils/search";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import type { MovePunishSummary } from "@/services/punishService";

export default function PunishScreen() {
  const { t } = useTranslation();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, setMyCharacter } = useMyCharacter();
  const sortMode = useFilterStore((s) => s.sortMode);
  const setSortMode = useFilterStore((s) => s.setSortMode);
  const styles = useThemedStyles(createStyles);

  const [opponentSlug, setOpponentSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [modalTarget, setModalTarget] = useState<"my" | "opponent" | null>(
    null,
  );

  const opponent = useMemo(
    () => characters.find((c) => c.slug === opponentSlug) ?? null,
    [characters, opponentSlug],
  );

  const { summaries, isOpponentLoading } = usePunishFinder(
    opponentSlug,
    sortMode,
  );

  const filtered = useMemo((): MovePunishSummary[] => {
    if (query.trim() === "") return summaries;
    const matchedMoves = new Set(
      searchMoves(
        summaries.map((s) => s.move),
        query,
      ),
    );
    return summaries.filter((s) => matchedMoves.has(s.move));
  }, [summaries, query]);

  const handleSwap = useCallback(() => {
    if (!myCharacter || !opponentSlug) return;
    const prevMySlug = myCharacter.slug;
    setMyCharacter(opponentSlug);
    setOpponentSlug(prevMySlug);
    setExpandedIndex(null);
  }, [myCharacter, opponentSlug, setMyCharacter]);

  return (
    <WebContainer>
      <PageHead
        title="SF6 Punish Finder - Frame Data Punish Calculator"
        description="Find guaranteed punishes after blocking in Street Fighter 6. Select the opponent and instantly see punishable moves with your best punish options."
        path="/punish"
      />
      <VsBar
        myCharacter={myCharacter ?? null}
        opponent={opponent}
        onPressMy={() => setModalTarget("my")}
        onPressOpponent={() => setModalTarget("opponent")}
        onSwap={handleSwap}
      />
      <CharacterSelectModal
        visible={modalTarget !== null}
        characters={characters}
        selectedSlug={modalTarget === "my" ? myCharacter?.slug : opponent?.slug}
        onSelect={(c) => {
          if (modalTarget === "my") {
            setMyCharacter(c.slug);
          } else {
            setOpponentSlug(c.slug);
          }
          setModalTarget(null);
          setExpandedIndex(null);
        }}
        onClose={() => setModalTarget(null)}
      />

      {opponent === null || !myCharacter ? (
        <View style={styles.center}>
          <Text style={styles.hint}>
            {!myCharacter
              ? t("character.selectMyCharacter")
              : t("punish.selectOpponent")}
          </Text>
          <Text style={styles.hintSub}>{t("punish.description")}</Text>
        </View>
      ) : isOpponentLoading ? (
        <View style={styles.center}>
          <Text style={styles.hint}>{t("common.loading")}</Text>
        </View>
      ) : (
        <>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t("punish.searchMoves")}
          />
          <View style={styles.sortRow}>
            <FilterChip
              label={t("sort.startup")}
              selected={sortMode === "startup"}
              onPress={() => setSortMode("startup")}
            />
            <FilterChip
              label={t("sort.damage")}
              selected={sortMode === "damage"}
              onPress={() => setSortMode("damage")}
            />
          </View>
          <Text style={styles.disclaimer}>{t("punish.disclaimer")}</Text>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.move.name}
            renderItem={({ item, index }) => (
              <PunishSummaryRow
                summary={item}
                expanded={expandedIndex === index}
                onToggle={() =>
                  setExpandedIndex((prev) => (prev === index ? null : index))
                }
              />
            )}
          />
        </>
      )}
    </WebContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    hint: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      textAlign: "center",
    },
    hintSub: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      textAlign: "center",
    },
    sortRow: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    disclaimer: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 6,
    },
  });
