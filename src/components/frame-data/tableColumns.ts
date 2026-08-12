// src/components/frame-data/tableColumns.ts
import type { Move } from "@/types/frame-data";
import { parseFrameValue } from "@/utils/frameAdvantage";
import { parseDamage } from "@/utils/punishCalc";

export type ColumnKey =
  | "startup"
  | "active"
  | "recovery"
  | "onBlock"
  | "onHit"
  | "cancel"
  | "damage"
  | "driveGaugeLossBlock"
  | "saGaugeGain";

export interface TableColumn {
  key: ColumnKey;
  /** i18n キー(frameData.*) */
  labelKey: string;
  /** 固定列幅(px)。左右ペインの行揃えに必須 */
  width: number;
  getValue: (move: Move) => string;
  /** true なら FrameValue で色分け表示 */
  isFrame: boolean;
}

const val = (v: string | undefined): string => (v && v !== "" ? v : "-");

export const TABLE_COLUMNS: TableColumn[] = [
  {
    key: "startup",
    labelKey: "frameData.startup",
    width: 48,
    getValue: (m) => val(m.startup),
    isFrame: false,
  },
  {
    key: "active",
    labelKey: "frameData.active",
    width: 48,
    getValue: (m) => val(m.active),
    isFrame: false,
  },
  {
    key: "recovery",
    labelKey: "frameData.recovery",
    width: 48,
    getValue: (m) => val(m.recovery),
    isFrame: false,
  },
  {
    key: "onBlock",
    labelKey: "frameData.onBlock",
    width: 56,
    getValue: (m) => val(m.onBlock),
    isFrame: true,
  },
  {
    key: "onHit",
    labelKey: "frameData.onHit",
    width: 56,
    getValue: (m) => val(m.onHit),
    isFrame: true,
  },
  {
    key: "cancel",
    labelKey: "frameData.cancel",
    width: 72,
    getValue: (m) => val(m.cancel),
    isFrame: false,
  },
  {
    key: "damage",
    labelKey: "frameData.damage",
    width: 64,
    getValue: (m) => val(m.damage),
    isFrame: false,
  },
  {
    key: "driveGaugeLossBlock",
    labelKey: "frameData.driveGaugeLossBlock",
    width: 72,
    getValue: (m) => val(m.driveGaugeLossBlock),
    isFrame: false,
  },
  {
    key: "saGaugeGain",
    labelKey: "frameData.saGaugeGain",
    width: 64,
    getValue: (m) => val(m.saGaugeGain),
    isFrame: false,
  },
];

/** 列でソートする。数値化できない値は末尾に寄せる */
export function sortMovesByColumn(
  moves: Move[],
  key: ColumnKey | null,
  direction: "asc" | "desc",
): Move[] {
  if (key === null) return moves;
  const column = TABLE_COLUMNS.find((c) => c.key === key);
  if (!column) return moves;

  const parse = key === "damage" ? parseDamage : parseFrameValue;
  return [...moves].sort((a, b) => {
    const aVal = parse(column.getValue(a));
    const bVal = parse(column.getValue(b));
    const aNum = typeof aVal === "number" && !Number.isNaN(aVal) ? aVal : null;
    const bNum = typeof bVal === "number" && !Number.isNaN(bVal) ? bVal : null;
    if (aNum === null && bNum === null) return 0;
    if (aNum === null) return 1;
    if (bNum === null) return -1;
    return direction === "asc" ? aNum - bNum : bNum - aNum;
  });
}
