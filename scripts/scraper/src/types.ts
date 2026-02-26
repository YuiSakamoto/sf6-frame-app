export type MoveCategory =
  | "normal"
  | "special"
  | "super"
  | "unique"
  | "throw"
  | "common";

export interface ScrapedMove {
  /** 英語名 */
  name: string;
  /** 日本語名 */
  nameJa: string;
  input: string;
  startup: string;
  active: string;
  recovery: string;
  onBlock: string;
  onHit: string;
  damage: string;
  cancel: string;
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
}
