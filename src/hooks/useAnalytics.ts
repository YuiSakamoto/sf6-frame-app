import { useCallback } from "react";
import { Platform } from "react-native";

type AnalyticsModule = {
  default: () => {
    logEvent: (name: string, params?: Record<string, string>) => Promise<void>;
    logScreenView: (params: {
      screen_name: string;
      screen_class: string;
    }) => Promise<void>;
  };
};

function getAnalytics() {
  if (Platform.OS === "web") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@react-native-firebase/analytics") as AnalyticsModule;
    return mod.default();
  } catch {
    return null;
  }
}

/** Firebase Analytics でイベントを送信するユーティリティ */
export function useAnalytics() {
  const logEvent = useCallback(
    async (name: string, params?: Record<string, string>) => {
      const analytics = getAnalytics();
      if (!analytics) return;
      try {
        await analytics.logEvent(name, params);
      } catch {
        // Firebase が未初期化の場合は無視
      }
    },
    [],
  );

  const logScreenView = useCallback(
    async (screenName: string) => {
      const analytics = getAnalytics();
      if (!analytics) return;
      try {
        await analytics.logScreenView({
          screen_name: screenName,
          screen_class: screenName,
        });
      } catch {
        // Firebase が未初期化の場合は無視
      }
    },
    [],
  );

  return { logEvent, logScreenView };
}
