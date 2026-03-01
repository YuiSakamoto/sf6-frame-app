import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { colors } from "@/theme/colors";
import { useDataSync } from "@/hooks/useDataSync";
import { useAdInit } from "@/hooks/useAdInit";
import "@/i18n";

export default function RootLayout() {
  useDataSync();
  useAdInit();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  return (
    <>
      <StatusBar style="light" />
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
