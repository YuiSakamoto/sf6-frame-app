import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { storageService } from "@/services/storageService";

const LANGUAGE_STORAGE_KEY = "sf6-language";
import ja from "./ja.json";
import en from "./en.json";
import fr from "./fr.json";
import it from "./it.json";
import de from "./de.json";
import es from "./es.json";
import ar from "./ar.json";
import ptBR from "./pt-BR.json";
import pl from "./pl.json";
import ru from "./ru.json";
import zhCN from "./zh-CN.json";
import zhTW from "./zh-TW.json";
import ko from "./ko.json";
import es419 from "./es-419.json";

const supportedLanguages = [
  "ja",
  "en",
  "fr",
  "it",
  "de",
  "es",
  "ar",
  "pt-BR",
  "pl",
  "ru",
  "zh-CN",
  "zh-TW",
  "ko",
  "es-419",
] as const;

/**
 * デバイスのロケール情報から最適な言語を決定する
 * languageTag (例: "pt-BR", "zh-Hans-CN") -> languageCode (例: "pt", "zh") の順で照合
 */
const resolveLanguage = (): string => {
  const locale = getLocales()[0];
  if (!locale) return "en";

  const { languageTag, languageCode } = locale;

  // languageTag で完全一致を試みる (例: "pt-BR", "zh-CN", "es-419")
  if (
    supportedLanguages.includes(
      languageTag as (typeof supportedLanguages)[number],
    )
  ) {
    return languageTag;
  }

  if (!languageCode) return "en";

  // 中国語の簡体字/繁体字の判定
  if (languageCode === "zh") {
    // scriptCode や region で判定
    const tag = languageTag.toLowerCase();
    if (
      tag.includes("hant") ||
      tag.includes("tw") ||
      tag.includes("hk") ||
      tag.includes("mo")
    ) {
      return "zh-TW";
    }
    return "zh-CN";
  }

  // スペイン語の地域判定
  if (languageCode === "es") {
    // スペイン以外のスペイン語圏はラテンアメリカ版を使用
    const tag = languageTag.toLowerCase();
    if (tag === "es" || tag === "es-es") {
      return "es";
    }
    return "es-419";
  }

  // ポルトガル語の地域判定
  if (languageCode === "pt") {
    return "pt-BR";
  }

  // languageCode で一致を試みる
  if (
    supportedLanguages.includes(
      languageCode as (typeof supportedLanguages)[number],
    )
  ) {
    return languageCode;
  }

  return "en";
};

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
    fr: { translation: fr },
    it: { translation: it },
    de: { translation: de },
    es: { translation: es },
    ar: { translation: ar },
    "pt-BR": { translation: ptBR },
    pl: { translation: pl },
    ru: { translation: ru },
    "zh-CN": { translation: zhCN },
    "zh-TW": { translation: zhTW },
    ko: { translation: ko },
    "es-419": { translation: es419 },
  },
  lng: (() => {
    const saved = storageService.getString(LANGUAGE_STORAGE_KEY);
    return saved.ok ? saved.value : resolveLanguage();
  })(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// 言語変更時にストレージに保存
i18n.on("languageChanged", (lng) => {
  storageService.set(LANGUAGE_STORAGE_KEY, lng);
});

export default i18n;
