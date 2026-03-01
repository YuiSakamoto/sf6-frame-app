import type { Move, CharacterFrameData } from "@/types/frame-data";

/** テスト用の Move オブジェクトを作成 */
export function createMove(overrides: Partial<Move> = {}): Move {
  return {
    name: "Standing LP",
    nameJa: "立ち弱P",
    input: "LP",
    startup: "4",
    active: "3",
    recovery: "8",
    onBlock: "+2",
    onHit: "+6",
    damage: "300",
    category: "normal",
    ...overrides,
  };
}

/** テスト用の CharacterFrameData を作成 */
export function createCharacterData(
  overrides: Omit<Partial<CharacterFrameData>, "moves"> & {
    moves?: Partial<Move>[];
  } = {},
): CharacterFrameData {
  const { moves = [], ...rest } = overrides;
  return {
    slug: "ryu",
    name: "Ryu",
    nameJa: "リュウ",
    version: "1.0",
    moves: moves.map((m) => createMove(m)),
    ...rest,
  };
}
