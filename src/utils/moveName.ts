import type { Move } from "@/types/frame-data";

/** 現在の言語に合った技名を返す */
export function getMoveName(move: Move, language: string): string {
  return language === "ja" ? move.nameJa : move.name;
}
