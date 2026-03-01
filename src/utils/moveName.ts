import type { Move } from "@/types/frame-data";

const isJa = (lang: string) => lang === "ja";

/** 現在の言語に合った技名を返す */
export function getMoveName(move: Move, language: string): string {
  return isJa(language) ? move.nameJa : move.name;
}

/** 現在の言語に合ったコンボ補正値を返す */
export function getComboScaling(
  move: Move,
  language: string,
): string | undefined {
  return isJa(language)
    ? move.comboScaling
    : (move.comboScalingEn ?? move.comboScaling);
}

/** 現在の言語に合った属性を返す */
export function getProperties(
  move: Move,
  language: string,
): string | undefined {
  return isJa(language)
    ? move.properties
    : (move.propertiesEn ?? move.properties);
}

/** 現在の言語に合った備考を返す */
export function getNotes(move: Move, language: string): string | undefined {
  return isJa(language) ? move.notes : (move.notesEn ?? move.notes);
}
