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
  /** コンボ補正値 */
  comboScaling: string;
  /** Dゲージ増加（ヒット時） */
  driveGaugeGain: string;
  /** Dゲージ減少（ガード時） */
  driveGaugeLossBlock: string;
  /** Dゲージ減少（パニッシュカウンター時） */
  driveGaugeLossPc: string;
  /** SAゲージ増加 */
  saGaugeGain: string;
  /** 属性 */
  properties: string;
  /** 備考 */
  notes: string;
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
