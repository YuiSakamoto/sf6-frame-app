import { useEffect } from "react";
import { Platform } from "react-native";

const GTM_ID = process.env.EXPO_PUBLIC_GTM_ID ?? "";

/** Web 上で Google Tag Manager を動的にロードする */
export function useGtm() {
  useEffect(() => {
    if (Platform.OS !== "web" || !GTM_ID) return;

    // dataLayer の初期化
    const w = window as typeof window & { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });

    // GTM スクリプトを head に注入
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(script);

    // noscript iframe を body 先頭に挿入
    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      script.remove();
      noscript.remove();
    };
  }, []);
}
