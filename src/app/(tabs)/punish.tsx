import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { useDataStore } from "@/stores/useDataStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { usePunishFinder } from "@/hooks/usePunishFinder";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { PunishResult } from "@/components/punish/PunishResult";
import { MoveRow } from "@/components/frame-data/MoveRow";
import { FilterChip } from "@/components/ui/FilterChip";
import type { Character } from "@/types/character";
import type { Move } from "@/types/frame-data";
import { useTranslation } from "react-i18next";
import { getMoveName } from "@/utils/moveName";

type Step = "select-opponent" | "select-move" | "result";

export default function PunishScreen() {
  const { t, i18n } = useTranslation();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, isSet, setMyCharacter } = useMyCharacter();
  const sortMode = useFilterStore((s) => s.sortMode);
  const setSortMode = useFilterStore((s) => s.setSortMode);

  const [step, setStep] = useState<Step>("select-opponent");
  const [opponentSlug, setOpponentSlug] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);

  const { punishableMoves, punishOptions, isOpponentLoading } =
    usePunishFinder(opponentSlug, selectedMove, sortMode);

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

  if (!isSet) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            {t("character.selectMyCharacter")}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            {t("punish.description")}
          </Text>
        </View>
        <CharacterGrid
          characters={characters}
          onSelect={(c) => setMyCharacter(c.slug)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Pressable
        onPress={() => {
          setStep("select-opponent");
          setOpponentSlug(null);
          setSelectedMove(null);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.background, fontWeight: "700", fontSize: 14 }}>
            {myCharacter?.name.charAt(0)}
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700", marginLeft: 8 }}>
          {i18n.language === "ja" ? myCharacter?.nameJa : myCharacter?.name}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: "auto" }}>
          {t("character.myCharacter")}
        </Text>
      </Pressable>

      {step === "select-opponent" && (
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            {t("character.opponent")}
          </Text>
          <CharacterGrid
            characters={characters}
            onSelect={handleSelectOpponent}
            selectedSlug={opponentSlug}
          />
        </View>
      )}

      {step === "select-move" && (
        <View style={{ flex: 1 }}>
          <Pressable onPress={handleBack} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: colors.accent, fontSize: 12 }}>
              {"< "}{t("character.opponent")}
            </Text>
          </Pressable>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              paddingHorizontal: 16,
              paddingBottom: 8,
            }}
          >
            {t("punish.selectOpponentMove")}
          </Text>
          {isOpponentLoading ? (
            <View style={{ padding: 32, alignItems: "center" }}>
              <Text style={{ color: colors.textMuted }}>{t("common.loading")}</Text>
            </View>
          ) : (
            <ScrollView>
              {punishableMoves.map((move, index) => (
                <MoveRow key={index} move={move} onPress={handleSelectMove} expandable={false} />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {step === "result" && selectedMove && (
        <View style={{ flex: 1 }}>
          <Pressable onPress={handleBack} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: colors.accent, fontSize: 12 }}>
              {"< "}{t("punish.selectOpponentMove")}
            </Text>
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 16, marginBottom: 8 }}
          >
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
          </ScrollView>
          <PunishResult
            punishes={punishOptions}
            selectedMoveName={getMoveName(selectedMove, i18n.language)}
          />
        </View>
      )}
    </View>
  );
}
