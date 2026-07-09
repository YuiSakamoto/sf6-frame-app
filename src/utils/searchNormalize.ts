/**
 * 検索クエリ/対象文字列の正規化。
 * NFKC(全角英数→半角など)+ 小文字化 + カタカナ→ひらがな + trim。
 */
export function normalizeQuery(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

const POSITION_TERMS: Record<string, { ja: string; en: string }> = {
  "5": { ja: "立ち", en: "standing" },
  "2": { ja: "しゃがみ", en: "crouching" },
  "8": { ja: "ジャンプ", en: "jumping" },
  j: { ja: "ジャンプ", en: "jumping" },
};

const STRENGTH_TERMS: Record<string, { ja: string; en: string }> = {
  l: { ja: "弱", en: "light" },
  m: { ja: "中", en: "medium" },
  h: { ja: "強", en: "heavy" },
};

const BUTTON_TERMS: Record<string, { ja: string; en: string }> = {
  p: { ja: "p", en: "punch" },
  k: { ja: "k", en: "kick" },
};

/**
 * テンキー/略記表記(5MP, 2hk, j.MP, 8MP, jMP)を技名検索語に変換する。
 * 対応しない表記(236P 等のコマンド)は null を返す。
 */
export function parseNumpadNotation(query: string): string[] | null {
  const m = query
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .match(/^([528j])\.?\s*([lmh])([pk])$/);
  if (!m) return null;
  const [, pos, strength, button] = m;
  const p = POSITION_TERMS[pos];
  const s = STRENGTH_TERMS[strength];
  const b = BUTTON_TERMS[button];
  // 検索は「正規化済みクエリ vs 正規化済み技名」で行うため、返り値も正規化して返す
  // (例: "ジャンプ中p" → "じゃんぷ中p"。技名側も normalizeQuery でひらがな化される)
  return [
    normalizeQuery(`${p.ja}${s.ja}${b.ja}`),
    normalizeQuery(`${p.en} ${s.en} ${b.en}`),
  ];
}
