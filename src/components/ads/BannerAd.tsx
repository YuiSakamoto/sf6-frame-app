import { Platform, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { ADS_ENABLED } from "@/config/ads";
import { AdBannerWeb } from "./BannerAd.web";

interface AdBannerProps {
  /** 本番用の広告ユニットID（省略時はテストID） */
  adUnitId?: string;
}

export function AdBanner({ adUnitId }: AdBannerProps) {
  if (!ADS_ENABLED) return null;

  // Web の場合は AdSense コンポーネントを使用
  if (Platform.OS === "web") {
    return <AdBannerWeb />;
  }

  // ネイティブの場合は AdMob
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ads = require("react-native-google-mobile-ads");
    const NativeBannerAd = ads.BannerAd;
    const NativeBannerAdSize = ads.BannerAdSize;
    const NativeTestIds = ads.TestIds;

    const unitId = adUnitId ?? NativeTestIds.ADAPTIVE_BANNER;

    return (
      <View style={styles.container}>
        <NativeBannerAd
          unitId={unitId}
          size={NativeBannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    );
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 4,
  },
});
