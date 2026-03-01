import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { useDataStore } from "@/stores/useDataStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { usePunishFinder } from "@/hooks/usePunishFinder";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import { PunishResult } from "@/components/punish/PunishResult";
import { MoveRow } from "@/components/frame-data/MoveRow";
import { FilterChip } from "@/components/ui/FilterChip";
import type { Character } from "@/types/character";
import type { Move } from "@/types/frame-data";
import { useTranslation } from "react-i18next";
import { getMoveName } from "@/utils/moveName";
import { Stepper } from "@/components/ui/Stepper";

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

  if (!isSet) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {t("character.selectMyCharacter")}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {t("punish.description")}
        </Text>
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
          <Text
            style={{
              color: colors.background,
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            {myCharacter?.name.charAt(0)}
          </Text>
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: "700",
            marginLeft: 8,
          }}
        >
          {i18n.language === "ja" ? myCharacter?.nameJa : myCharacter?.name}
        </Text>
        <Text
          style={{ color: colors.textMuted, fontSize: 11, marginLeft: "auto" }}
        >
          {t("character.myCharacter")}
        </Text>
      </Pressable>

      <Stepper
        steps={[
          t("character.opponent"),
          t("punish.selectOpponentMove"),
          t("punish.resultStep"),
        ]}
        currentStep={STEP_INDEX[step]}
      />

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
          <Pressable
            onPress={handleBack}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={{ color: colors.accent, fontSize: 12 }}>
              {"< "}
              {t("character.opponent")}
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
          {/* 見出し行 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                {t("frameData.title")}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 10,
                  minWidth: 36,
                  textAlign: "center",
                }}
              >
                {t("frameData.startup")}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 10,
                  minWidth: 36,
                  textAlign: "center",
                }}
              >
                {t("frameData.onBlock")}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 10,
                  minWidth: 36,
                  textAlign: "center",
                }}
              >
                {t("frameData.onHit")}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 10,
                  minWidth: 40,
                  textAlign: "center",
                }}
              >
                {t("frameData.damage")}
              </Text>
            </View>
          </View>
          {isOpponentLoading ? (
            <View style={{ padding: 32, alignItems: "center" }}>
              <Text style={{ color: colors.textMuted }}>
                {t("common.loading")}
              </Text>
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
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={handleBack}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={{ color: colors.accent, fontSize: 12 }}>
              {"< "}
              {t("punish.selectOpponentMove")}
            </Text>
          </Pressable>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
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
