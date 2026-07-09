import { normalizeQuery } from "./searchNormalize";

/**
 * 通称・表記ゆれ → 技名に含まれる語 のマッピング。
 * **キーは必ず normalizeQuery 済みの表記(ひらがな・半角小文字)で書くこと**
 * (ルックアップが正規化済みクエリで行われるため。カタカナのキーは絶対にヒットしない)。
 * 値は expandAliases 内で normalizeQuery に通されるので生の表記でよい。
 */
const ALIASES: Record<string, string[]> = {
  // 表記ゆれ
  昇竜: ["昇龍"],
  昇竜拳: ["昇龍拳"],
  // 通称(日本語)
  たつまき: ["竜巻"],
  すくりゅー: ["スクリュー"],
  中足: ["しゃがみ中K"],
  小足: ["しゃがみ弱K"],
  大足: ["しゃがみ強K"],
  いんぱくと: ["ドライブインパクト", "drive impact"],
  // 通称(英語・ローマ字)
  dp: ["昇龍", "shoryuken", "rising"],
  shoryu: ["昇龍", "shoryuken"],
  hadoken: ["波動", "hadoken"],
  hadouken: ["波動", "hadoken"],
  tatsu: ["竜巻", "tatsumaki"],
  di: ["ドライブインパクト", "drive impact"],
  spd: ["スクリュー", "screw"],
};

/**
 * 正規化済みクエリをエイリアス展開する。
 * クエリ自身も検索語に含める(余計な要素があっても部分一致検索では無害)。
 */
export function expandAliases(normalizedQuery: string): string[] {
  const aliased = ALIASES[normalizedQuery];
  if (!aliased) return [normalizedQuery];
  return [normalizedQuery, ...aliased.map(normalizeQuery)];
}
