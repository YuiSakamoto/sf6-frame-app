import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { ADS_ENABLED } from "@/config/ads";

/**
 * Web 用 AdSense バナー広告コンポーネント
 *
 * Google AdSense のスクリプトは index.html の <head> に追加する必要があります:
 * <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>
 *
 * 環境変数 EXPO_PUBLIC_ADSENSE_SLOT に広告スロットIDを設定
 * 環境変数 EXPO_PUBLIC_ADSENSE_CLIENT にクライアントIDを設定
 */
export function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);
  const adSlot = process.env.EXPO_PUBLIC_ADSENSE_SLOT ?? "";
  const adClient = process.env.EXPO_PUBLIC_ADSENSE_CLIENT ?? "";

  if (!ADS_ENABLED) return null;

  useEffect(() => {
    if (!adSlot || !adClient) return;

    try {
      const adsbygoogle = window.adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch {
      // AdSense が読み込まれていない場合
    }
  }, [adSlot, adClient]);

  if (!adSlot || !adClient) {
    return null;
  }

  return (
    <View style={styles.container}>
      <div ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 4,
    width: "100%",
  },
});
