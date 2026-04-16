import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { WebContainer } from "@/components/ui/WebContainer";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: string }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function BulletItem({ label, children }: { label: string; children: string }) {
  return (
    <View style={styles.bulletItem}>
      <Text style={styles.bulletDot}>{"\u2022"}</Text>
      <Text style={styles.bulletText}>
        <Text style={styles.bulletLabel}>{label}</Text>
        {"  "}
        {children}
      </Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <WebContainer>
      <Stack.Screen options={{ title: t("privacy.title") }} />
      <ScrollView style={styles.root}>
        <Text style={styles.updatedAt}>{t("privacy.lastUpdated")}</Text>

        <Section title={t("privacy.introTitle")}>
          <Paragraph>{t("privacy.introBody")}</Paragraph>
        </Section>

        <Section title={t("privacy.collectTitle")}>
          <Paragraph>{t("privacy.collectIntro")}</Paragraph>
          <BulletItem label={t("privacy.collectAnalyticsLabel")}>
            {t("privacy.collectAnalyticsBody")}
          </BulletItem>
          <BulletItem label={t("privacy.collectAdsLabel")}>
            {t("privacy.collectAdsBody")}
          </BulletItem>
          <BulletItem label={t("privacy.collectCrashLabel")}>
            {t("privacy.collectCrashBody")}
          </BulletItem>
        </Section>

        <Section title={t("privacy.localStorageTitle")}>
          <Paragraph>{t("privacy.localStorageBody")}</Paragraph>
        </Section>

        <Section title={t("privacy.thirdPartyTitle")}>
          <Paragraph>{t("privacy.thirdPartyBody")}</Paragraph>
          <BulletItem label="Google AdMob">
            {t("privacy.thirdPartyAdmob")}
          </BulletItem>
          <BulletItem label="Firebase Analytics">
            {t("privacy.thirdPartyFirebase")}
          </BulletItem>
        </Section>

        <Section title={t("privacy.childrenTitle")}>
          <Paragraph>{t("privacy.childrenBody")}</Paragraph>
        </Section>

        <Section title={t("privacy.changesTitle")}>
          <Paragraph>{t("privacy.changesBody")}</Paragraph>
        </Section>

        <Section title={t("privacy.contactTitle")}>
          <Paragraph>{t("privacy.contactBody")}</Paragraph>
        </Section>

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
  updatedAt: {
    color: colors.textMuted,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    paddingLeft: 4,
    marginBottom: 8,
  },
  bulletDot: {
    color: colors.accent,
    fontSize: 13,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  bulletLabel: {
    color: colors.text,
    fontWeight: "600",
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
