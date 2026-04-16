import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { colors } from "@/theme/colors";
import { useDataSync } from "@/hooks/useDataSync";
import { useAdInit } from "@/hooks/useAdInit";
import { useGtm } from "@/hooks/useGtm";
import { SITE_URL } from "@/config/site";
import "@/i18n";

const STRUCTURED_DATA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SF6 Frame Data",
  alternateName: "Street Fighter 6 Frame Data App",
  description:
    "Complete Street Fighter 6 frame data for all 28 characters. Startup, recovery, block advantage, hit advantage, and punish finder.",
  url: SITE_URL,
  applicationCategory: "GameApplication",
  operatingSystem: "iOS, Android, Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

export default function RootLayout() {
  useDataSync();
  useAdInit();
  useGtm();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      {Platform.OS === "web" && (
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#0A0A0F" />
          <meta
            name="keywords"
            content="SF6, Street Fighter 6, frame data, punish finder, startup frames, block advantage, hit advantage, on block, on hit, fighting game, FGC, スト6, フレームデータ, 確定反撃"
          />
          <meta property="og:site_name" content="SF6 Frame Data" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:locale:alternate" content="ja_JP" />
          <link rel="sitemap" href="/sitemap.xml" />
          <script type="application/ld+json">{STRUCTURED_DATA}</script>
        </Head>
      )}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="character/[slug]"
          options={{ headerBackTitle: "" }}
        />
      </Stack>
    </>
  );
}
