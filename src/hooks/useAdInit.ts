import { useEffect } from "react";
import { Platform } from "react-native";
import { ADS_ENABLED } from "@/config/ads";

export function useAdInit() {
  useEffect(() => {
    if (!ADS_ENABLED || Platform.OS === "web") return;

    const init = async () => {
      try {
        // ATT (App Tracking Transparency) ダイアログを表示（iOS のみ）
        if (Platform.OS === "ios") {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const att = require("expo-tracking-transparency");
          await att.requestTrackingPermissionsAsync();
        }

        // AdMob SDK 初期化
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ads = require("react-native-google-mobile-ads");
        await ads.default().initialize();
      } catch {
        // Expo Go 等でネイティブモジュールが利用できない場合は無視
      }
    };

    init();
  }, []);
}
