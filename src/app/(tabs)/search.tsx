import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/useDataStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";

const LANGUAGES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "es-419", label: "Español (Latinoamérica)" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "ko", label: "한국어" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "ar", label: "العربية" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
] as const;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, setMyCharacter, isSet } = useMyCharacter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 自キャラ設定 */}
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: "600",
          textTransform: "uppercase",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        {t("character.myCharacter")}
      </Text>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        {isSet && myCharacter ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.background,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {myCharacter.name.charAt(0)}
              </Text>
            </View>
            <Text
              style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}
            >
              {i18n.language === "ja" ? myCharacter.nameJa : myCharacter.name}
            </Text>
          </View>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            {t("character.selectMyCharacter")}
          </Text>
        )}
        <Text style={{ color: colors.accent, fontSize: 12 }}>
          {t("common.change")}
        </Text>
      </Pressable>

      {/* 言語設定 */}
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: "600",
          textTransform: "uppercase",
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 8,
        }}
      >
        {t("settings.language")}
      </Text>
      {LANGUAGES.map((lang) => {
        const isSelected = i18n.language === lang.code;
        return (
          <Pressable
            key={lang.code}
            onPress={() => i18n.changeLanguage(lang.code)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: isSelected
                ? colors.surfaceLight
                : colors.surface,
            }}
          >
            <Text
              style={{
                color: isSelected ? colors.accent : colors.text,
                fontSize: 14,
                fontWeight: isSelected ? "700" : "400",
              }}
            >
              {lang.label}
            </Text>
            {isSelected && (
              <Text style={{ color: colors.accent, fontSize: 14 }}>✓</Text>
            )}
          </Pressable>
        );
      })}

      <CharacterSelectModal
        visible={modalVisible}
        characters={characters}
        selectedSlug={myCharacter?.slug}
        onSelect={(c) => {
          setMyCharacter(c.slug);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}
