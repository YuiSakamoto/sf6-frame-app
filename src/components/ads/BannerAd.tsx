import { StyleSheet, View } from "react-native";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { ADS_ENABLED } from "@/config/ads";

interface AdBannerProps {
  /** 本番用の広告ユニットID（省略時はテストID） */
  adUnitId?: string;
}

export function AdBanner({ adUnitId }: AdBannerProps) {
  const styles = useThemedStyles(createStyles);

  if (!ADS_ENABLED) return null;

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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: theme.colors.bg,
      paddingVertical: 4,
    },
  });
