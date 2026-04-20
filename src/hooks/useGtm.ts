import { useEffect } from "react";
import { Platform } from "react-native";

const GTM_ID = process.env.EXPO_PUBLIC_GTM_ID ?? "";

type IdleWindow = typeof window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
  dataLayer?: unknown[];
};

/** Web 上で Google Tag Manager を idle 時に遅延ロードする */
export function useGtm() {
  useEffect(() => {
    if (Platform.OS !== "web" || !GTM_ID) return;

    let script: HTMLScriptElement | null = null;
    let noscript: HTMLElement | null = null;
    const w = window as IdleWindow;

    const inject = () => {
      w.dataLayer = w.dataLayer ?? [];
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

      script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(script);

      noscript = document.createElement("noscript");
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
      iframe.height = "0";
      iframe.width = "0";
      iframe.style.display = "none";
      iframe.style.visibility = "hidden";
      noscript.appendChild(iframe);
      document.body.insertBefore(noscript, document.body.firstChild);
    };

    // Defer until the browser is idle so GTM never competes with LCP.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(inject, { timeout: 5000 });
    } else {
      timeoutId = setTimeout(inject, 3000);
    }

    return () => {
      if (idleId !== undefined && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      script?.remove();
      noscript?.remove();
    };
  }, []);
}
