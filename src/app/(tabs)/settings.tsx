import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/useDataStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WebContainer } from "@/components/ui/WebContainer";

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
  const router = useRouter();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, setMyCharacter, isSet } = useMyCharacter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <WebContainer>
      <ScrollView style={styles.root}>
        {/* 自キャラ設定 */}
        <SectionHeader label={t("character.myCharacter")} />
        <Pressable onPress={() => setModalVisible(true)} style={styles.row}>
          {isSet && myCharacter ? (
            <View style={styles.charRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {myCharacter.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.charName}>
                {i18n.language === "ja" ? myCharacter.nameJa : myCharacter.name}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>
              {t("character.selectMyCharacter")}
            </Text>
          )}
          <Text style={styles.changeLabel}>{t("common.change")}</Text>
        </Pressable>

        {/* 言語設定 */}
        <SectionHeader label={t("settings.language")} />
        {LANGUAGES.map((lang) => {
          const isSelected = i18n.language === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => i18n.changeLanguage(lang.code)}
              style={[styles.langRow, isSelected && styles.langRowSelected]}
            >
              <Text
                style={[
                  styles.langLabel,
                  isSelected && styles.langLabelSelected,
                ]}
              >
                {lang.label}
              </Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          );
        })}

        {/* 支援 */}
        <SectionHeader label={t("support.title")} />
        <View style={styles.supportDescRow}>
          <Text style={styles.supportDesc}>{t("support.description")}</Text>
        </View>
        <Pressable
          style={styles.linkRow}
          onPress={() =>
            Linking.openURL("https://github.com/sponsors/YuiSakamoto")
          }
        >
          <Text style={styles.linkLabel}>{t("support.github")}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.linkRow}
          onPress={() =>
            Linking.openURL("https://buymeacoffee.com/yui_tang")
          }
        >
          <Text style={styles.linkLabel}>{t("support.buymeacoffee")}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.linkRow}
          onPress={() =>
            Linking.openURL("https://github.com/YuiSakamoto/sf6-frame-app")
          }
        >
          <Text style={styles.linkLabel}>{t("support.githubRepo")}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* クレジット・プライバシーポリシー */}
        <SectionHeader label={t("credits.title")} />
        <Pressable
          style={styles.linkRow}
          onPress={() => router.push("/credits")}
        >
          <Text style={styles.linkLabel}>{t("credits.title")}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.linkRow}
          onPress={() => router.push("/privacy-policy")}
        >
          <Text style={styles.linkLabel}>{t("credits.privacyPolicy")}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </ScrollView>
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
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  charRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 12,
  },
  charName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  placeholder: {
    color: colors.textMuted,
    fontSize: 14,
  },
  changeLabel: {
    color: colors.accent,
    fontSize: 12,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  langRowSelected: {
    backgroundColor: colors.surfaceLight,
  },
  langLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  langLabelSelected: {
    color: colors.accent,
    fontWeight: "700",
  },
  checkmark: {
    color: colors.accent,
    fontSize: 14,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  linkLabel: {
    color: colors.text,
    fontSize: 14,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 18,
  },
  supportDescRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  supportDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
