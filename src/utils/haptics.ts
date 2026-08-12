import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/** 軽いタップフィードバック(行展開・カード選択など) */
export function lightImpact(): void {
  if (Platform.OS === "web") return;
  // 失敗してもユーザー影響がないため結果は無視する
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** 選択変更フィードバック(チップ・タブなど) */
export function selectionTap(): void {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}
