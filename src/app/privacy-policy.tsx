import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { WebContainer } from "@/components/ui/WebContainer";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: string }) {
  const styles = useThemedStyles(createStyles);
  return <Text style={styles.paragraph}>{children}</Text>;
}

function BulletItem({ label, children }: { label: string; children: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.bulletItem}>
      <Text style={styles.bulletDot}>{"•"}</Text>
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
  const styles = useThemedStyles(createStyles);

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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    updatedAt: {
      color: theme.colors.textMuted,
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
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 8,
    },
    paragraph: {
      color: theme.colors.textSecondary,
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
      color: theme.colors.accent,
      fontSize: 13,
      marginRight: 8,
      marginTop: 1,
    },
    bulletText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      flex: 1,
    },
    bulletLabel: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    footer: {
      padding: 16,
      paddingBottom: 40,
    },
    footerText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      lineHeight: 16,
      textAlign: "center",
    },
  });
