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
import { Skeleton } from "@/components/ui/Skeleton";
import { WebContainer } from "@/components/ui/WebContainer";
import { PageHead } from "@/components/seo/PageHead";
import { searchMoves } from "@/utils/search";
import { lightImpact } from "@/utils/haptics";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import type { MovePunishSummary } from "@/services/punishService";
import type { Move } from "@/types/frame-data";

export default function PunishScreen() {
  const { t } = useTranslation();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, setMyCharacter } = useMyCharacter();
  const sortMode = useFilterStore((s) => s.sortMode);
  const setSortMode = useFilterStore((s) => s.setSortMode);
  const styles = useThemedStyles(createStyles);

  const [opponentSlug, setOpponentSlug] = useState<string | null>(null);
  // 画面内だけの自キャラ上書き。null なら設定の自キャラをそのまま使う
  const [myOverrideSlug, setMyOverrideSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedMove, setExpandedMove] = useState<Move | null>(null);
  const [modalTarget, setModalTarget] = useState<"my" | "opponent" | null>(
    null,
  );

  const effectiveMySlug = myOverrideSlug ?? myCharacter?.slug ?? null;
  const effectiveMyCharacter = useMemo(
    () => characters.find((c) => c.slug === effectiveMySlug) ?? null,
    [characters, effectiveMySlug],
  );

  const opponent = useMemo(
    () => characters.find((c) => c.slug === opponentSlug) ?? null,
    [characters, opponentSlug],
  );

  const { summaries, isOpponentLoading } = usePunishFinder(
    opponentSlug,
    sortMode,
    myOverrideSlug,
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

  // swap は画面内のみの入れ替え。永続設定(自キャラ設定)は変更しない
  const handleSwap = useCallback(() => {
    if (!effectiveMySlug || !opponentSlug) return;
    const prevEffectiveMySlug = effectiveMySlug;
    setMyOverrideSlug(opponentSlug);
    setOpponentSlug(prevEffectiveMySlug);
    setExpandedMove(null);
  }, [effectiveMySlug, opponentSlug]);

  return (
    <WebContainer>
      <PageHead
        title="SF6 Punish Finder - Frame Data Punish Calculator"
        description="Find guaranteed punishes after blocking in Street Fighter 6. Select the opponent and instantly see punishable moves with your best punish options."
        path="/punish"
      />
      <VsBar
        myCharacter={effectiveMyCharacter}
        opponent={opponent}
        onPressMy={() => setModalTarget("my")}
        onPressOpponent={() => setModalTarget("opponent")}
        onSwap={handleSwap}
      />
      <CharacterSelectModal
        visible={modalTarget !== null}
        characters={characters}
        selectedSlug={
          modalTarget === "my" ? effectiveMyCharacter?.slug : opponent?.slug
        }
        onSelect={(c) => {
          if (modalTarget === "my") {
            // VsBar から明示的に選んだ場合は本命キャラ変更とみなし、永続設定に保存する
            setMyCharacter(c.slug);
            setMyOverrideSlug(null);
          } else {
            setOpponentSlug(c.slug);
          }
          setModalTarget(null);
          setExpandedMove(null);
        }}
        onClose={() => setModalTarget(null)}
      />

      {opponent === null || !effectiveMyCharacter ? (
        <View style={styles.center}>
          <Text style={styles.hint}>
            {!effectiveMyCharacter
              ? t("character.selectMyCharacter")
              : t("punish.selectOpponent")}
          </Text>
          <Text style={styles.hintSub}>{t("punish.description")}</Text>
        </View>
      ) : isOpponentLoading ? (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={40} />
          ))}
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
            keyExtractor={(item, index) => `${item.move.name}-${index}`}
            renderItem={({ item }) => (
              <PunishSummaryRow
                summary={item}
                expanded={expandedMove === item.move}
                onToggle={() => {
                  lightImpact();
                  setExpandedMove((prev) =>
                    prev === item.move ? null : item.move,
                  );
                }}
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
    skeletonContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
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
