import { Modal, Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { CharacterGrid } from "./CharacterGrid";
import type { Character } from "@/types/character";
import { useTranslation } from "react-i18next";

interface CharacterSelectModalProps {
  visible: boolean;
  characters: Character[];
  selectedSlug?: string | null;
  /** falseの場合、背景タップやキャンセルで閉じられない（初回選択用） */
  dismissable?: boolean;
  onSelect: (character: Character) => void;
  onClose: () => void;
}

export function CharacterSelectModal({
  visible,
  characters,
  selectedSlug,
  dismissable = true,
  onSelect,
  onClose,
}: CharacterSelectModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={dismissable ? onClose : undefined}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "flex-end",
        }}
      >
        {dismissable && (
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        )}
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              {t("character.selectMyCharacter")}
            </Text>
            {dismissable && (
              <Pressable onPress={onClose}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>✕</Text>
              </Pressable>
            )}
          </View>
          <CharacterGrid
            characters={characters}
            onSelect={onSelect}
            selectedSlug={selectedSlug}
          />
        </View>
      </View>
    </Modal>
  );
}
