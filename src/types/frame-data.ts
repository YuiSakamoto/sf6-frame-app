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
  /** コンボ補正値（日本語） */
  comboScaling?: string;
  /** コンボ補正値（英語） */
  comboScalingEn?: string;
  /** Dゲージ増加（ヒット時） */
  driveGaugeGain?: string;
  /** Dゲージ減少（ガード時） */
  driveGaugeLossBlock?: string;
  /** Dゲージ減少（パニッシュカウンター時） */
  driveGaugeLossPc?: string;
  /** SAゲージ増加 */
  saGaugeGain?: string;
  /** 属性（日本語: 上/中/下/投/弾/空弾） */
  properties?: string;
  /** 属性（英語: H/M/L/T/P/MP） */
  propertiesEn?: string;
  /** 備考（日本語） */
  notes?: string;
  /** 備考（英語） */
  notesEn?: string;
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
