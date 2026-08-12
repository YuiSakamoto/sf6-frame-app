import type { Move } from "@/types/frame-data";
import { normalizeQuery, parseNumpadNotation } from "./searchNormalize";
import { expandAliases } from "./moveAliases";

/**
 * 技名・通称・テンキー表記で検索する。
 * - クエリと技名の両方を正規化(NFKC/小文字/かな統一)して部分一致
 * - エイリアス辞書(dp→昇龍 等)を展開し、いずれかにマッチすればヒット
 * - テンキー表記(5MP 等)は 立ち/しゃがみ/ジャンプ + 強度 + ボタン に変換
 */
export function searchMoves(moves: Move[], query: string): Move[] {
  const normalized = normalizeQuery(query);
  if (normalized === "") return moves;

  const numpadTerms = parseNumpadNotation(query);
  const terms = numpadTerms ?? expandAliases(normalized);

  return moves.filter((move) => {
    const nameEn = normalizeQuery(move.name);
    const nameJa = normalizeQuery(move.nameJa);
    const input = normalizeQuery(move.input);
    return terms.some(
      (term) =>
        nameEn.includes(term) ||
        nameJa.includes(term) ||
        (input !== "" && input.includes(term)),
    );
  });
}
