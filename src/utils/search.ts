import type { Move } from "@/types/frame-data";

/**
 * 技名またはコマンド入力で検索する
 */
export function searchMoves(moves: Move[], query: string): Move[] {
  if (query.trim() === "") return moves;

  const lowerQuery = query.toLowerCase();
  return moves.filter(
    (move) =>
      move.name.toLowerCase().includes(lowerQuery) ||
      move.nameJa.includes(query) ||
      move.input.toLowerCase().includes(lowerQuery),
  );
}
