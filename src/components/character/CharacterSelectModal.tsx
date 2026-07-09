import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
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
  const styles = useThemedStyles(createStyles);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={dismissable ? onClose : undefined}
    >
      <View style={styles.overlay}>
        {dismissable && <Pressable style={styles.backdrop} onPress={onClose} />}
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("character.selectMyCharacter")}</Text>
            {dismissable && (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t("common.cancel")}
                hitSlop={8}
              >
                <Text style={styles.closeButton}>✕</Text>
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "flex-end",
    },
    backdrop: {
      flex: 1,
    },
    sheet: {
      backgroundColor: theme.colors.bg,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    closeButton: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
  });
