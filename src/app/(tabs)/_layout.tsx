import { Tabs } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/ui/AppHeader";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => (
          <AppHeader
            sectionTitle={
              typeof options.title === "string" ? options.title : undefined
            }
          />
        ),
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="punish"
        options={{
          title: t("tabs.punish"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("tabs.search"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("common.settings"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
