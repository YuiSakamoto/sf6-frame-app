export type MoveCategory =
  | "normal"
  | "special"
  | "super"
  | "unique"
  | "throw"
  | "command-normal";

export interface ScrapedMove {
  name: string;
  nameJa: string;
  input: string;
  startup: string;
  active: string;
  recovery: string;
  onBlock: string;
  onHit: string;
  damage: string;
  category: MoveCategory;
}

export interface CharacterFrameData {
  slug: string;
  name: string;
  nameJa: string;
  version: string;
  moves: ScrapedMove[];
}

export interface CharacterInfo {
  slug: string;
  name: string;
  nameJa: string;
  portraitUrl?: string;
}

/** Capcom公式サイトで使用されるロケールコード */
export const SITE_LOCALES = [
  "ja-jp",
  "en-us",
  "fr-fr",
  "it-it",
  "de-de",
  "es-es",
  "ar",
  "pt-br",
  "pl",
  "ru",
  "zh-cn",
  "zh-tw",
  "ko-kr",
  "es-419",
] as const;

export type SiteLocale = (typeof SITE_LOCALES)[number];
