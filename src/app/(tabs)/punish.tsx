import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { useDataStore } from "@/stores/useDataStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { usePunishFinder } from "@/hooks/usePunishFinder";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import { PunishResult } from "@/components/punish/PunishResult";
import { MoveRow } from "@/components/frame-data/MoveRow";
import { ColumnHeader } from "@/components/frame-data/ColumnHeader";
import { FilterChip } from "@/components/ui/FilterChip";
import { MyCharacterBar } from "@/components/ui/MyCharacterBar";
import { Stepper } from "@/components/ui/Stepper";
import type { Character } from "@/types/character";
import type { Move } from "@/types/frame-data";
import { useTranslation } from "react-i18next";
import { getMoveName } from "@/utils/moveName";

type Step = "select-opponent" | "select-move" | "result";
const STEP_INDEX: Record<Step, number> = {
  "select-opponent": 0,
  "select-move": 1,
  result: 2,
};

export default function PunishScreen() {
  const { t, i18n } = useTranslation();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, isSet, setMyCharacter } = useMyCharacter();
  const sortMode = useFilterStore((s) => s.sortMode);
  const setSortMode = useFilterStore((s) => s.setSortMode);

  const [step, setStep] = useState<Step>("select-opponent");
  const [opponentSlug, setOpponentSlug] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);

  const { punishableMoves, punishOptions, isOpponentLoading } = usePunishFinder(
    opponentSlug,
    selectedMove,
    sortMode,
  );

  const handleSelectOpponent = useCallback((character: Character) => {
    setOpponentSlug(character.slug);
    setSelectedMove(null);
    setStep("select-move");
  }, []);

  const handleSelectMove = useCallback((move: Move) => {
    setSelectedMove(move);
    setStep("result");
  }, []);

  const handleBack = useCallback(() => {
    if (step === "result") {
      setSelectedMove(null);
      setStep("select-move");
    } else if (step === "select-move") {
      setOpponentSlug(null);
      setStep("select-opponent");
    }
  }, [step]);

  const handleReset = useCallback(() => {
    setStep("select-opponent");
    setOpponentSlug(null);
    setSelectedMove(null);
  }, []);

  if (!isSet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {t("character.selectMyCharacter")}
        </Text>
        <Text style={styles.emptyDescription}>{t("punish.description")}</Text>
        <CharacterSelectModal
          visible
          characters={characters}
          dismissable={false}
          onSelect={(c) => setMyCharacter(c.slug)}
          onClose={() => {}}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MyCharacterBar
        character={myCharacter}
        isSet={isSet}
        onPress={handleReset}
        trailingLabel={t("character.myCharacter")}
      />

      <Stepper
        steps={[
          t("character.opponent"),
          t("punish.selectOpponentMove"),
          t("punish.resultStep"),
        ]}
        currentStep={STEP_INDEX[step]}
      />

      {step === "select-opponent" && (
        <View style={styles.flex}>
          <Text style={styles.sectionLabel}>{t("character.opponent")}</Text>
          <CharacterGrid
            characters={characters}
            onSelect={handleSelectOpponent}
            selectedSlug={opponentSlug}
          />
        </View>
      )}

      {step === "select-move" && (
        <View style={styles.flex}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>
              {"< "}
              {t("character.opponent")}
            </Text>
          </Pressable>
          <Text style={styles.sectionLabel}>
            {t("punish.selectOpponentMove")}
          </Text>
          <ColumnHeader leadingLabel={t("frameData.title")} />
          {isOpponentLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          ) : (
            <ScrollView>
              {punishableMoves.map((move, index) => (
                <MoveRow
                  key={index}
                  move={move}
                  onPress={handleSelectMove}
                  expandable={false}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {step === "result" && selectedMove && (
        <View style={styles.flex}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>
              {"< "}
              {t("punish.selectOpponentMove")}
            </Text>
          </Pressable>
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
          <PunishResult
            punishes={punishOptions}
            selectedMoveName={getMoveName(selectedMove, i18n.language)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    color: colors.accent,
    fontSize: 12,
  },
  sortRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    color: colors.textMuted,
  },
});
