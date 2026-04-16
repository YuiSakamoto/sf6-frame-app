import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { WebContainer } from "@/components/ui/WebContainer";

const DATA_SOURCE = {
  name: "CAPCOM / Street Fighter 6",
  url: "https://www.streetfighter.com/6",
};

const OSS_LICENSES = [
  {
    name: "React Native",
    license: "MIT",
    url: "https://github.com/facebook/react-native",
  },
  { name: "Expo", license: "MIT", url: "https://github.com/expo/expo" },
  {
    name: "NativeWind",
    license: "MIT",
    url: "https://github.com/marklawlor/nativewind",
  },
  { name: "Zustand", license: "MIT", url: "https://github.com/pmndrs/zustand" },
  {
    name: "i18next",
    license: "MIT",
    url: "https://github.com/i18next/i18next",
  },
  {
    name: "React Navigation",
    license: "MIT",
    url: "https://github.com/react-navigation/react-navigation",
  },
  {
    name: "Google Mobile Ads SDK",
    license: "Apache-2.0",
    url: "https://github.com/invertase/react-native-google-mobile-ads",
  },
  {
    name: "Firebase",
    license: "Apache-2.0",
    url: "https://github.com/invertase/react-native-firebase",
  },
] as const;

function LinkRow({
  label,
  sub,
  url,
}: {
  label: string;
  sub?: string;
  url: string;
}) {
  return (
    <Pressable style={styles.row} onPress={() => Linking.openURL(url)}>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

export default function CreditsScreen() {
  const { t } = useTranslation();

  return (
    <WebContainer>
      <Stack.Screen options={{ title: t("credits.title") }} />
      <ScrollView style={styles.root}>
        {/* データ引用元 */}
        <Text style={styles.sectionTitle}>{t("credits.dataSource")}</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{t("credits.dataNotice")}</Text>
        </View>
        <LinkRow label={DATA_SOURCE.name} url={DATA_SOURCE.url} />

        {/* OSSライセンス */}
        <Text style={styles.sectionTitle}>{t("credits.ossLicenses")}</Text>
        {OSS_LICENSES.map((lib) => (
          <LinkRow
            key={lib.name}
            label={lib.name}
            sub={lib.license}
            url={lib.url}
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("credits.trademarkNotice")}</Text>
        </View>
      </ScrollView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  notice: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  noticeText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  rowSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 18,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 40,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
