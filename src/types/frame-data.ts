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
  /** コンボ補正値（例: "始動補正20%", "Initial Scaling 20%"） */
  comboScaling?: string;
  /** Dゲージ増加（ヒット時） */
  driveGaugeGain?: string;
  /** Dゲージ減少（ガード時） */
  driveGaugeLossBlock?: string;
  /** Dゲージ減少（パニッシュカウンター時） */
  driveGaugeLossPc?: string;
  /** SAゲージ増加 */
  saGaugeGain?: string;
  /** 属性（上/中/下/投/弾/空弾） */
  properties?: string;
  /** 備考 */
  notes?: string;
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
