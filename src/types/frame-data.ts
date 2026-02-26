export type MoveCategory =
  | "normal"
  | "special"
  | "super"
  | "unique"
  | "throw"
  | "common";

export interface Move {
  name: string;
  nameJa: string;
  input: string;
  /** 発生フレーム（例: "4", "8"） */
  startup: string;
  /** 持続フレーム */
  active: string;
  /** 硬直フレーム */
  recovery: string;
  /** ガード時フレーム（例: "-8", "+2"） */
  onBlock: string;
  /** ヒット時フレーム */
  onHit: string;
  /** ダメージ */
  damage: string;
  /** キャンセル可能技 */
  cancel?: string;
  category: MoveCategory;
}

export interface CharacterFrameData {
  slug: string;
  name: string;
  nameJa: string;
  /** ゲームバージョン */
  version: string;
  moves: Move[];
}

export interface VersionInfo {
  version: string;
  updatedAt: string;
  characters: string[];
}
