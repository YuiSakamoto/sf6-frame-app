# UI モダナイゼーション実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SF6 Frame App の UI を「Pro Data Tool」デザイン(ニュートラルダーク/ライト2テーマ)に刷新し、確反1画面化・横スクロールフレーム表・検索強化・a11y 底上げを行う。

**Architecture:** 自前デザイントークン(`src/theme/tokens.ts`)+ React Context の `ThemeProvider`/`useTheme` を基盤に、全コンポーネントを静的 `StyleSheet` からテーマ対応スタイルへ移行する。確反はサービス層に「相手全技の確反サマリ」関数を追加して1画面化。フレーム表はモバイル=固定技名列+横スクロール、デスクトップWeb=全列表示に分岐。検索は正規化・エイリアス・テンキー表記のパーサを純関数で実装する。

**Tech Stack:** Expo SDK 55 / React Native 0.83 / expo-router / Zustand / i18next / Reanimated 4 / vitest

**Spec:** `docs/superpowers/specs/2026-07-07-ui-modernization-design.md`

## Global Constraints

- パッケージマネージャーは pnpm(npm / npx / yarn 禁止)。Expo モジュール追加は `pnpm expo install <pkg>`
- Expo SDK 55 / React Native 0.83.2 / TypeScript ~5.9.2 のバージョンは変更しない
- TypeScript strict mode。`let` を避け、エラーは throw せず Result 型(`src/types/result.ts`)で返す(ただし React コンポーネント内の UI 状態は従来どおり)
- コードコメントは日本語
- パスエイリアス `@/*` → `src/*`
- i18n キー追加時: `ja.json` と `en.json` に翻訳を追加し、残り12ロケール(`fr/it/de/es/es-419/pt-BR/ko/zh-CN/zh-TW/ar/pl/ru`)には英語と同じ値を追加する(キー欠落によるフォールバック表示を避けるため)
- 各タスク完了時に `pnpm typecheck && pnpm lint && pnpm test` が通ること
- コミットは Conventional Commits 形式
- **旧 `src/theme/colors.ts` は Task 6 で削除するまで残す。**新規コード(Task 7 以降)は必ず `useTheme()` を使い `colors.ts` を import しない

## カラートークン移行マッピング(全タスク共通)

| 旧 `colors.*` | 新 `theme.colors.*` |
| --- | --- |
| `background` | `bg` |
| `surface` | `surface` |
| `surfaceLight` | `surfaceRaised` |
| `accent` | `accent` |
| `accentDim` | `accent`(統合・廃止) |
| `punishSuccess` | `framePositive`(統合・廃止) |
| `framePositive` | `framePositive` |
| `frameNegative` | `frameNegative` |
| `frameNeutral` | `frameNeutral` |
| `text` | `textPrimary` |
| `textSecondary` | `textSecondary` |
| `textMuted` | `textMuted` |
| `border` | `border` |

---

### Task 1: デザイントークンとコントラスト検証

**Files:**
- Create: `src/theme/tokens.ts`
- Create: `src/utils/contrast.ts`
- Test: `src/utils/__tests__/contrast.test.ts`

**Interfaces:**
- Produces: `darkColors: ThemeColors` / `lightColors: ThemeColors` / `spacing` / `radius` / `fontSize` / `type ThemeColors`(tokens.ts)、`contrastRatio(fg: string, bg: string): number`(contrast.ts)

- [ ] **Step 1: コントラスト計算のテストを書く**

```ts
// src/utils/__tests__/contrast.test.ts
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../contrast";
import { darkColors, lightColors } from "@/theme/tokens";

describe("contrastRatio", () => {
  it("白と黒のコントラスト比は21", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 0);
  });
  it("同色のコントラスト比は1", () => {
    expect(contrastRatio("#808080", "#808080")).toBeCloseTo(1, 5);
  });
});

// テーマトークンが WCAG 基準を満たすことを機械的に保証する
describe.each([
  ["dark", darkColors],
  ["light", lightColors],
])("%s テーマのコントラスト", (_name, c) => {
  it.each([
    ["textPrimary/bg", c.textPrimary, c.bg, 4.5],
    ["textPrimary/surface", c.textPrimary, c.surface, 4.5],
    ["textPrimary/surfaceRaised", c.textPrimary, c.surfaceRaised, 4.5],
    ["textSecondary/bg", c.textSecondary, c.bg, 4.5],
    ["textSecondary/surface", c.textSecondary, c.surface, 4.5],
    // フレーム数値は太字表示のため WCAG AA (large text) の 3:1 を基準にする
    ["framePositive/surface", c.framePositive, c.surface, 3],
    ["frameNegative/surface", c.frameNegative, c.surface, 3],
    ["accent/surface", c.accent, c.surface, 3],
    // muted はヒント用途。最低限の可読性のみ担保
    ["textMuted/bg", c.textMuted, c.bg, 3],
  ])("%s は %d:1 以上", (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm vitest run src/utils/__tests__/contrast.test.ts`
Expected: FAIL(`contrast.ts` / `tokens.ts` が存在しない)

- [ ] **Step 3: contrast.ts を実装**

```ts
// src/utils/contrast.ts

/** "#RRGGBB" を [r, g, b] (0-255) に変換する */
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}

/** WCAG 2.x の相対輝度 */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG コントラスト比 (1〜21) */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}
```

- [ ] **Step 4: tokens.ts を実装**

```ts
// src/theme/tokens.ts
// Pro Data Tool デザイン: ニュートラルダーク/ライト + 単一ブルーアクセント。
// 値を変更したら contrast.test.ts が WCAG 基準を検証する。

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  /** accent の淡い背景(選択状態など)。rgba 可 */
  accentSubtle: string;
  framePositive: string;
  frameNegative: string;
  frameNeutral: string;
  /** framePositive の淡い背景(確反バッジなど)。rgba 可 */
  positiveSubtle: string;
}

export const darkColors: ThemeColors = {
  bg: "#101013",
  surface: "#121216",
  surfaceRaised: "#1A1A20",
  border: "#26262E",
  divider: "#202027",
  textPrimary: "#E8E8EC",
  textSecondary: "#9A9AA4",
  textMuted: "#71717B",
  accent: "#5B93FF",
  accentSubtle: "rgba(91, 147, 255, 0.14)",
  framePositive: "#3DD68C",
  frameNegative: "#F17878",
  frameNeutral: "#9A9AA4",
  positiveSubtle: "rgba(61, 214, 140, 0.12)",
};

export const lightColors: ThemeColors = {
  bg: "#FAFAFB",
  surface: "#FFFFFF",
  surfaceRaised: "#F2F2F5",
  border: "#E1E1E8",
  divider: "#ECECF0",
  textPrimary: "#1A1A20",
  textSecondary: "#55555F",
  textMuted: "#71717B",
  accent: "#2563EB",
  accentSubtle: "rgba(37, 99, 235, 0.10)",
  framePositive: "#0E7A4E",
  frameNegative: "#C93A3A",
  frameNeutral: "#55555F",
  positiveSubtle: "rgba(14, 122, 78, 0.10)",
};

/** 4px 基準のスペーシングスケール */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
} as const;
```

- [ ] **Step 5: テストが通ることを確認**

Run: `pnpm vitest run src/utils/__tests__/contrast.test.ts`
Expected: PASS(コントラスト不足があれば、該当トークンの明度を調整して再実行。**テスト側の基準値は緩めない**)

- [ ] **Step 6: コミット**

```bash
git add src/theme/tokens.ts src/utils/contrast.ts src/utils/__tests__/contrast.test.ts
git commit -m "feat(theme): デザイントークンと WCAG コントラスト検証を追加"
```

---

### Task 2: ThemeProvider / useTheme とルート配線

**Files:**
- Create: `src/theme/ThemeContext.tsx`
- Modify: `src/stores/useSettingsStore.ts`
- Modify: `src/app/_layout.tsx`

**Interfaces:**
- Consumes: `darkColors` / `lightColors` / `spacing` / `radius` / `fontSize`(Task 1)
- Produces:
  - `type ThemeMode = "system" | "light" | "dark"`(useSettingsStore)
  - `interface Theme { mode: "light" | "dark"; colors: ThemeColors; spacing; radius; fontSize }`
  - `ThemeProvider({ children })` / `useTheme(): Theme` / `useThemedStyles<T>(create: (theme: Theme) => T): T`
  - `useSettingsStore` に `themeMode: ThemeMode` / `setThemeMode(mode: ThemeMode): void`

- [ ] **Step 1: useSettingsStore に themeMode を追加**

```ts
// src/stores/useSettingsStore.ts(全体を以下に置き換え)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageService } from "@/services/storageService";
import i18n from "@/i18n";

export type ThemeMode = "system" | "light" | "dark";

interface SettingsState {
  myCharacterSlug: string | null;
  language: string;
  themeMode: ThemeMode;
  setMyCharacter: (slug: string) => void;
  setLanguage: (lang: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      myCharacterSlug: null,
      language: i18n.language,
      themeMode: "system",
      setMyCharacter: (slug) => set({ myCharacterSlug: slug }),
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => storageService.zustandStorage),
    },
  ),
);
```

- [ ] **Step 2: ThemeContext.tsx を作成**

```tsx
// src/theme/ThemeContext.tsx
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  darkColors,
  lightColors,
  spacing,
  radius,
  fontSize,
  type ThemeColors,
} from "./tokens";

export interface Theme {
  mode: "light" | "dark";
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
}

function buildTheme(mode: "light" | "dark"): Theme {
  return {
    mode,
    colors: mode === "light" ? lightColors : darkColors,
    spacing,
    radius,
    fontSize,
  };
}

const ThemeContext = createContext<Theme>(buildTheme("dark"));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const mode =
    themeMode === "system" ? (systemScheme === "light" ? "light" : "dark") : themeMode;
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * テーマ依存の StyleSheet を作るためのフック。
 * `create` はモジュールレベルの定数関数として定義すること(毎レンダー新規生成を避ける)。
 */
export function useThemedStyles<T>(create: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => create(theme), [create, theme]);
}
```

- [ ] **Step 3: ルートレイアウトを配線**

`src/app/_layout.tsx` を変更:

1. import に追加: `import { ThemeProvider, useTheme } from "@/theme/ThemeContext";`
2. `import { colors } from "@/theme/colors";` を削除
3. 既存の `RootLayout` の中身を `RootLayoutInner` に切り出し、`RootLayout` は `<ThemeProvider><RootLayoutInner /></ThemeProvider>` を返すだけにする(ThemeProvider の内側でないと `useTheme` が動かないため)
4. `RootLayoutInner` 内で `const theme = useTheme();` を取り、以下を置換:
   - `SystemUI.setBackgroundColorAsync(colors.background)` → `SystemUI.setBackgroundColorAsync(theme.colors.bg)`(useEffect の依存配列に `theme.colors.bg` を追加)
   - `<StatusBar style="light" />` → `<StatusBar style={theme.mode === "dark" ? "light" : "dark"} />`
   - `<meta name="theme-color" content="#0A0A0F" />` → `<meta name="theme-color" content={theme.colors.bg} />`
   - `contentStyle: { backgroundColor: colors.background }` → `contentStyle: { backgroundColor: theme.colors.bg }`

```tsx
// 変更後の構造(既存の Head 内容・Stack.Screen はそのまま)
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

function RootLayoutInner() {
  useDataSync();
  useAdInit();
  useGtm();
  const theme = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.bg);
  }, [theme.colors.bg]);

  return (
    <>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      {/* ...既存の Head と Stack(上記の置換のみ適用)... */}
    </>
  );
}
```

- [ ] **Step 4: 動作確認**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: すべて PASS

Run: `pnpm web` を起動し、ブラウザで表示されること(この時点では見た目は旧配色のまま。クラッシュしないことだけ確認)。確認後 Ctrl+C で停止。

- [ ] **Step 5: コミット**

```bash
git add src/theme/ThemeContext.tsx src/stores/useSettingsStore.ts src/app/_layout.tsx
git commit -m "feat(theme): ThemeProvider と themeMode 設定を追加"
```

---

### Task 3: 設定画面のテーマ切替 UI

**Files:**
- Modify: `src/app/(tabs)/settings.tsx`
- Modify: `src/i18n/ja.json`, `src/i18n/en.json`, ほか12ロケール

**Interfaces:**
- Consumes: `useSettingsStore` の `themeMode` / `setThemeMode`、`ThemeMode`(Task 2)

- [ ] **Step 1: i18n キーを追加**

`src/i18n/ja.json` の `"settings"` オブジェクトに追加(なければ作成):

```json
"settings": {
  "language": "言語",
  "theme": "テーマ",
  "themeSystem": "システムに合わせる",
  "themeLight": "ライト",
  "themeDark": "ダーク"
}
```

`en.json`(および他12ロケールに同じ英語値):

```json
"settings": {
  "language": "Language",
  "theme": "Theme",
  "themeSystem": "Follow system",
  "themeLight": "Light",
  "themeDark": "Dark"
}
```

注意: 既存の `settings.language` キーは各ロケールに存在するので、`theme*` キーのみ追記する。

- [ ] **Step 2: settings.tsx にテーマセクションを追加**

`SettingsScreen` 内、言語設定セクションの直前に挿入:

```tsx
const THEME_MODES: Array<{ mode: ThemeMode; labelKey: string }> = [
  { mode: "system", labelKey: "settings.themeSystem" },
  { mode: "light", labelKey: "settings.themeLight" },
  { mode: "dark", labelKey: "settings.themeDark" },
];
```

```tsx
{/* テーマ設定 */}
<SectionHeader label={t("settings.theme")} />
{THEME_MODES.map(({ mode, labelKey }) => {
  const isSelected = themeMode === mode;
  return (
    <Pressable
      key={mode}
      onPress={() => setThemeMode(mode)}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={t(labelKey)}
      style={[styles.langRow, isSelected && styles.langRowSelected]}
    >
      <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>
        {t(labelKey)}
      </Text>
      {isSelected && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
})}
```

コンポーネント先頭に追加:

```tsx
import { useSettingsStore, type ThemeMode } from "@/stores/useSettingsStore";
// ...
const themeMode = useSettingsStore((s) => s.themeMode);
const setThemeMode = useSettingsStore((s) => s.setThemeMode);
```

(スタイルは既存の `langRow` 系を流用する。settings.tsx 全体のトークン移行は Task 5 で行う)

- [ ] **Step 3: 動作確認**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

Run: `pnpm web` → 設定タブでテーマ3択が表示され、切替でクラッシュしないこと(背景色はまだ旧トークンなので変化が乏しくてよい)

- [ ] **Step 4: コミット**

```bash
git add src/app/\(tabs\)/settings.tsx src/i18n/
git commit -m "feat(settings): テーマ切替 UI を追加"
```

---

### Task 4: getFrameTone とテーマ対応 FrameValue

**Files:**
- Modify: `src/utils/frameAdvantage.ts`
- Modify: `src/components/frame-data/FrameValue.tsx`
- Test: `src/utils/__tests__/frameAdvantage.test.ts`(既存に追記)

**Interfaces:**
- Produces: `type FrameTone = "positive" | "negative" | "neutral"`、`getFrameTone(value: string): FrameTone`(frameAdvantage.ts)
- 既存の `getFrameColor` は**削除**する(利用箇所は FrameValue のみ。grep で確認してから消す)

- [ ] **Step 1: getFrameTone のテストを書く**

`src/utils/__tests__/frameAdvantage.test.ts` に追記:

```ts
import { getFrameTone } from "../frameAdvantage";

describe("getFrameTone", () => {
  it("正の値は positive", () => {
    expect(getFrameTone("+5")).toBe("positive");
    expect(getFrameTone("3")).toBe("positive");
  });
  it("負の値は negative", () => {
    expect(getFrameTone("-8")).toBe("negative");
  });
  it("0・パース不能は neutral", () => {
    expect(getFrameTone("0")).toBe("neutral");
    expect(getFrameTone("-")).toBe("neutral");
    expect(getFrameTone("D")).toBe("neutral");
  });
  it("レンジは最小値で判定", () => {
    expect(getFrameTone("2~4")).toBe("positive");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm vitest run src/utils/__tests__/frameAdvantage.test.ts`
Expected: FAIL(`getFrameTone` 未定義)

- [ ] **Step 3: frameAdvantage.ts を実装**

`getFrameColor` と `import { colors }` を削除し、以下を追加(`parseFrameValue` / `isPunishable` はそのまま):

```ts
export type FrameTone = "positive" | "negative" | "neutral";

/**
 * フレーム値の意味種別を返す(色はテーマ側で解決する)
 */
export function getFrameTone(value: string): FrameTone {
  const num = parseFrameValue(value);
  if (num === null || num === 0) return "neutral";
  return num > 0 ? "positive" : "negative";
}
```

- [ ] **Step 4: FrameValue をテーマ対応にする**

```tsx
// src/components/frame-data/FrameValue.tsx(全体を置き換え)
import { Text } from "react-native";
import { getFrameTone, type FrameTone } from "@/utils/frameAdvantage";
import { useTheme, type Theme } from "@/theme/ThemeContext";

interface FrameValueProps {
  value: string;
  fontSize?: number;
  minWidth?: number;
}

function toneColor(tone: FrameTone, theme: Theme): string {
  if (tone === "positive") return theme.colors.framePositive;
  if (tone === "negative") return theme.colors.frameNegative;
  return theme.colors.frameNeutral;
}

export function FrameValue({ value, fontSize = 13, minWidth = 36 }: FrameValueProps) {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: toneColor(getFrameTone(value), theme),
        fontSize,
        fontWeight: "700",
        fontVariant: ["tabular-nums"],
        textAlign: "center",
        minWidth,
      }}
    >
      {value}
    </Text>
  );
}
```

- [ ] **Step 5: 検証してコミット**

Run: `grep -rn "getFrameColor" src/` → ヒットなしを確認
Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS

```bash
git add src/utils/frameAdvantage.ts src/components/frame-data/FrameValue.tsx src/utils/__tests__/frameAdvantage.test.ts
git commit -m "refactor(frame): getFrameColor を getFrameTone に置き換えテーマ対応"
```

---

### Task 5: 既存コンポーネント・画面のトークン移行

**Files:**
- Modify(コンポーネント): `src/components/ui/{SearchBar,FilterChip,Badge,SectionHeader,AppHeader,MyCharacterBar,WebContainer}.tsx`、`src/components/character/{CharacterCard,CharacterGrid,CharacterSelectModal}.tsx`、`src/components/punish/{PunishResult,PunishMoveRow}.tsx`、`src/components/frame-data/{MoveRow,ColumnHeader}.tsx`、`src/components/ads/BannerAd.tsx`、`src/components/ads/BannerAd.web.tsx`
- Modify(画面・レイアウト): `src/app/(tabs)/{_layout,index,punish,search,settings}.tsx`、`src/app/{credits,privacy-policy}.tsx`、`src/app/character/[slug].tsx`
- ※ `src/components/ui/Stepper.tsx` は移行**しない**(Task 9 で削除するため)

**Interfaces:**
- Consumes: `useTheme` / `useThemedStyles` / `type Theme`(Task 2)
- Produces: 全対象ファイルが `@/theme/colors` を import しない状態(Stepper.tsx を除く)

**移行パターン(全ファイル共通・機械的に適用):**

1. `import { colors } from "@/theme/colors";` → `import { useThemedStyles, type Theme } from "@/theme/ThemeContext";`
2. モジュール末尾の `const styles = StyleSheet.create({...})` → `const createStyles = (theme: Theme) => StyleSheet.create({...})` に変更し、色の値を冒頭の「カラートークン移行マッピング」表に従って `theme.colors.*` へ置換
3. コンポーネント内の先頭で `const styles = useThemedStyles(createStyles);`
4. StyleSheet 外(JSX 内のインライン色や props)で `colors.*` を使っている箇所は `const theme = useTheme();` を取って `theme.colors.*` に置換

**FilterChip の完全な移行例**(他ファイルはこれと同じ変換を適用する):

```tsx
// src/components/ui/FilterChip.tsx(全体を置き換え)
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const styles = useThemedStyles(createStyles);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.93, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.chip, selected && styles.chipSelected, animatedStyle]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      minHeight: 32,
      justifyContent: "center",
    },
    chipSelected: {
      backgroundColor: theme.colors.accentSubtle,
      borderColor: theme.colors.accent,
    },
    label: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "500",
    },
    labelSelected: {
      color: theme.colors.accent,
      fontWeight: "700",
    },
  });
```

※ Pro Data Tool の意匠: 選択チップは「アクセント塗りつぶし」ではなく「accentSubtle 背景 + accent 文字/枠」にする(上記コード)。他コンポーネントでも同様に、旧 `accent` ベタ塗り背景は `accentSubtle` 背景 + `accent` 文字に置き換える(設定画面の avatar のような小さい要素はベタ塗り `accent` のままでよい)。

- [ ] **Step 1: components/ui を移行**(SearchBar, FilterChip, Badge, SectionHeader, AppHeader, MyCharacterBar, WebContainer)
- [ ] **Step 2: components/character, punish, frame-data, ads を移行**(CharacterCard, CharacterGrid, CharacterSelectModal, PunishResult, PunishMoveRow, MoveRow, ColumnHeader, BannerAd, BannerAd.web)
- [ ] **Step 3: 画面とレイアウトを移行**((tabs)/_layout, index, punish, search, settings, credits, privacy-policy, character/[slug])
  - `(tabs)/_layout.tsx` は StyleSheet がないので `const theme = useTheme();` で `tabBarStyle` 等を置換
- [ ] **Step 4: 残存 import を確認**

Run: `grep -rln '@/theme/colors' src/`
Expected: `src/components/ui/Stepper.tsx` のみ(Task 9 で削除予定)

- [ ] **Step 5: 検証**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS

Run: `pnpm web` → 全タブ+キャラ詳細を開き、新配色(ニュートラルダーク)で表示されること。設定でライトに切り替えて全画面が破綻なく表示されること。

- [ ] **Step 6: コミット**

```bash
git add src/
git commit -m "refactor(theme): 全コンポーネント・画面をデザイントークンに移行"
```

---

### Task 6: 旧 colors.ts と NativeWind の削除

**Files:**
- Delete: `src/theme/colors.ts`、`src/global.css`、`nativewind-env.d.ts`
- Modify: `package.json`

前提: この時点で `@/theme/colors` の import が `Stepper.tsx` のみであること(Task 5 Step 4)。Stepper は Task 9 で削除するが、colors.ts を先に消すためここで Stepper のみ暫定移行するのではなく、**Stepper.tsx をここで削除してよいか確認する**: `grep -rn "Stepper" src/ --include="*.tsx"` の結果、利用箇所が `punish.tsx` のみで、punish.tsx は Task 9 で全面書き換え予定。ただし Task 6〜8 の間もアプリは動く必要があるため、**Stepper.tsx はここでトークン移行だけ行い**(Task 5 のパターンを適用)、削除は Task 9 で行う。

- [ ] **Step 1: Stepper.tsx をトークン移行**(Task 5 と同じパターン)
- [ ] **Step 2: colors.ts / global.css / nativewind-env.d.ts を削除**

```bash
rm src/theme/colors.ts src/global.css nativewind-env.d.ts
grep -rn '@/theme/colors\|global.css\|nativewind' src/ app.json metro.config.js tsconfig.json
```

Expected: ヒットなし(tsconfig の include にファイル名指定があれば除去)

- [ ] **Step 3: 依存を削除**

```bash
pnpm remove nativewind tailwindcss
```

- [ ] **Step 4: 検証**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build:web`
Expected: すべて PASS(build:web が通ることで metro 設定の破損がないことを確認)

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "chore(deps): 未使用の NativeWind/Tailwind と旧カラー定義を削除"
```

---

### Task 7: フレーム表の刷新(FrameTable + 詳細シート)

**Files:**
- Create: `src/components/frame-data/FrameTable.tsx`
- Create: `src/components/frame-data/MoveDetailSheet.tsx`
- Create: `src/components/frame-data/tableColumns.ts`
- Modify: `src/app/character/[slug].tsx`
- Modify: `src/i18n/ja.json`, `en.json` ほか(列ラベル・閉じるボタン)
- Test: `src/components/frame-data/__tests__/tableColumns.test.ts`
- ※ 既存の `MoveList.tsx` / `ColumnHeader.tsx` は検索・確反画面で使い続けるため残す(キャラ詳細のみ FrameTable に切替)

**Interfaces:**
- Consumes: `useTheme` / `useThemedStyles`、`FrameValue`、`Move` / `MoveCategory`、`parseFrameValue`、`getMoveName` / `getProperties` / `getNotes` / `getComboScaling`(`@/utils/moveName`)、`useResponsive`
- Produces:
  - `interface TableColumn { key: ColumnKey; labelKey: string; width: number; getValue(move: Move): string; isFrame: boolean }`(tableColumns.ts)
  - `TABLE_COLUMNS: TableColumn[]`、`type ColumnKey = "startup" | "active" | "recovery" | "onBlock" | "onHit" | "cancel" | "damage" | "driveGaugeLossBlock" | "saGaugeGain"`
  - `sortMovesByColumn(moves: Move[], key: ColumnKey | null, direction: "asc" | "desc"): Move[]`
  - `FrameTable({ moves, onRowPress }: { moves: Move[]; onRowPress: (move: Move) => void })`
  - `MoveDetailSheet({ move, visible, onClose }: { move: Move | null; visible: boolean; onClose: () => void })`

- [ ] **Step 1: tableColumns のテストを書く**

```ts
// src/components/frame-data/__tests__/tableColumns.test.ts
import { describe, expect, it } from "vitest";
import { TABLE_COLUMNS, sortMovesByColumn } from "../tableColumns";
import type { Move } from "@/types/frame-data";

const move = (over: Partial<Move>): Move => ({
  name: "test",
  nameJa: "テスト",
  input: "",
  startup: "5",
  active: "3",
  recovery: "10",
  onBlock: "-2",
  onHit: "+3",
  damage: "600",
  category: "normal",
  ...over,
});

describe("TABLE_COLUMNS", () => {
  it("9列が定義されている", () => {
    expect(TABLE_COLUMNS).toHaveLength(9);
  });
  it("getValue が Move から値を取り出す", () => {
    const startup = TABLE_COLUMNS.find((c) => c.key === "startup");
    expect(startup?.getValue(move({ startup: "8" }))).toBe("8");
  });
  it("cancel など未定義値は '-' を返す", () => {
    const cancel = TABLE_COLUMNS.find((c) => c.key === "cancel");
    expect(cancel?.getValue(move({ cancel: undefined }))).toBe("-");
  });
});

describe("sortMovesByColumn", () => {
  const moves = [
    move({ nameJa: "A", startup: "8" }),
    move({ nameJa: "B", startup: "4" }),
    move({ nameJa: "C", startup: "-" }), // パース不能は末尾
  ];
  it("昇順ソート・パース不能は末尾", () => {
    const sorted = sortMovesByColumn(moves, "startup", "asc");
    expect(sorted.map((m) => m.nameJa)).toEqual(["B", "A", "C"]);
  });
  it("降順ソート", () => {
    const sorted = sortMovesByColumn(moves, "startup", "desc");
    expect(sorted.map((m) => m.nameJa)).toEqual(["A", "B", "C"]);
  });
  it("key が null なら元の並びを返す", () => {
    expect(sortMovesByColumn(moves, null, "asc")).toEqual(moves);
  });
});
```

- [ ] **Step 2: テスト失敗を確認**

Run: `pnpm vitest run src/components/frame-data/__tests__/tableColumns.test.ts`
Expected: FAIL

- [ ] **Step 3: tableColumns.ts を実装**

```ts
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
  { key: "startup", labelKey: "frameData.startup", width: 48, getValue: (m) => val(m.startup), isFrame: false },
  { key: "active", labelKey: "frameData.active", width: 48, getValue: (m) => val(m.active), isFrame: false },
  { key: "recovery", labelKey: "frameData.recovery", width: 48, getValue: (m) => val(m.recovery), isFrame: false },
  { key: "onBlock", labelKey: "frameData.onBlock", width: 56, getValue: (m) => val(m.onBlock), isFrame: true },
  { key: "onHit", labelKey: "frameData.onHit", width: 56, getValue: (m) => val(m.onHit), isFrame: true },
  { key: "cancel", labelKey: "frameData.cancel", width: 72, getValue: (m) => val(m.cancel), isFrame: false },
  { key: "damage", labelKey: "frameData.damage", width: 64, getValue: (m) => val(m.damage), isFrame: false },
  { key: "driveGaugeLossBlock", labelKey: "frameData.driveGaugeLossBlock", width: 72, getValue: (m) => val(m.driveGaugeLossBlock), isFrame: false },
  { key: "saGaugeGain", labelKey: "frameData.saGaugeGain", width: 64, getValue: (m) => val(m.saGaugeGain), isFrame: false },
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
```

注意: `parseDamage("0")` は 0 を返し「値なし」と区別できないためそのまま扱う。`parseDamage` は number を返すので null 分岐は `parseFrameValue` 用。damage 列で "-" は `parseDamage` が 0 を返すため末尾ではなく 0 扱いになるが、実用上問題ない(ソートの主用途は発生/ガード)。

- [ ] **Step 4: テスト成功を確認**

Run: `pnpm vitest run src/components/frame-data/__tests__/tableColumns.test.ts`
Expected: PASS

- [ ] **Step 5: FrameTable.tsx を実装**

設計(スペック §3):
- **モバイル(`useResponsive().isWide === false`)**: 外側 `ScrollView`(縦)の中に `flexDirection: "row"` で「技名列(固定幅 132)」と「横 `ScrollView` の数値グリッド」を並べる。**全行の高さを `ROW_HEIGHT = 48` に固定**して左右の行ズレを防ぐ。web では左列に `position: "sticky"` 相当が効かないため、この2ペイン方式で両プラットフォーム共通にする。
- **デスクトップ(`isWide === true`)**: 横スクロールなしで全列を1つの行に表示。ヘッダーの列ラベルを `Pressable` にし、タップでソート(同列再タップで asc→desc→解除のトグル)。
- ソート状態は FrameTable 内の `useState<{ key: ColumnKey | null; direction: "asc" | "desc" }>` で保持し、`sortMovesByColumn` を `useMemo` で適用。モバイルでは列ヘッダーが横スクロール内にあるため、ソートも同様にヘッダータップで行う。
- 技名セル: 1行目に技名(`numberOfLines={1}`)、2行目に属性(`getProperties`)を小さく表示。行タップで `onRowPress(move)`。
- データ量は最大でも100行未満のため FlatList は使わず map で描画してよい(仮想化不要。スペック §6)。

```tsx
// src/components/frame-data/FrameTable.tsx
import { useMemo, useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import {
  TABLE_COLUMNS,
  sortMovesByColumn,
  type ColumnKey,
} from "./tableColumns";
import { useResponsive } from "@/hooks/useResponsive";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { getMoveName, getProperties } from "@/utils/moveName";

const ROW_HEIGHT = 48;
const NAME_COLUMN_WIDTH = 132;

interface SortState {
  key: ColumnKey | null;
  direction: "asc" | "desc";
}

interface FrameTableProps {
  moves: Move[];
  onRowPress: (move: Move) => void;
}

export function FrameTable({ moves, onRowPress }: FrameTableProps) {
  const { t, i18n } = useTranslation();
  const { isWide } = useResponsive();
  const styles = useThemedStyles(createStyles);
  const [sort, setSort] = useState<SortState>({ key: null, direction: "asc" });

  const sorted = useMemo(
    () => sortMovesByColumn(moves, sort.key, sort.direction),
    [moves, sort],
  );

  // 同じ列をタップするたび asc → desc → 解除 をトグルする
  const handleSortPress = useCallback((key: ColumnKey) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" };
    });
  }, []);

  const sortIndicator = (key: ColumnKey): string => {
    if (sort.key !== key) return "";
    return sort.direction === "asc" ? " ▲" : " ▼";
  };

  const renderColumnHeader = (withSort: boolean) => (
    <View style={styles.headerRow}>
      {TABLE_COLUMNS.map((col) => (
        <Pressable
          key={col.key}
          disabled={!withSort}
          onPress={() => handleSortPress(col.key)}
          accessibilityRole="button"
          accessibilityLabel={t(col.labelKey)}
          style={[styles.headerCell, { width: col.width }]}
        >
          <Text
            style={[styles.headerLabel, sort.key === col.key && styles.headerLabelActive]}
            numberOfLines={1}
          >
            {t(col.labelKey)}
            {sortIndicator(col.key)}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderNameCell = (move: Move, index: number) => (
    <Pressable
      key={`name-${index}`}
      onPress={() => onRowPress(move)}
      accessibilityRole="button"
      accessibilityLabel={getMoveName(move, i18n.language)}
      style={[styles.nameCell, index % 2 === 1 && styles.rowAlt]}
    >
      <Text style={styles.moveName} numberOfLines={1}>
        {getMoveName(move, i18n.language)}
      </Text>
      {getProperties(move, i18n.language) ? (
        <Text style={styles.properties} numberOfLines={1}>
          {getProperties(move, i18n.language)}
        </Text>
      ) : null}
    </Pressable>
  );

  const renderValueRow = (move: Move, index: number) => (
    <Pressable
      key={`values-${index}`}
      onPress={() => onRowPress(move)}
      style={[styles.valueRow, index % 2 === 1 && styles.rowAlt]}
    >
      {TABLE_COLUMNS.map((col) =>
        col.isFrame ? (
          <View key={col.key} style={[styles.valueCell, { width: col.width }]}>
            <FrameValue value={col.getValue(move)} minWidth={col.width - 8} />
          </View>
        ) : (
          <View key={col.key} style={[styles.valueCell, { width: col.width }]}>
            <Text style={styles.valueText} numberOfLines={1}>
              {col.getValue(move)}
            </Text>
          </View>
        ),
      )}
    </Pressable>
  );

  if (isWide) {
    // デスクトップ: 全列を1画面に表示、ヘッダーでソート
    return (
      <ScrollView>
        <View style={styles.wideHeaderRow}>
          <View style={[styles.headerCell, { width: NAME_COLUMN_WIDTH }]}>
            <Text style={styles.headerLabel}>{t("frameData.command")}</Text>
          </View>
          {renderColumnHeader(true)}
        </View>
        {sorted.map((move, i) => (
          <View key={i} style={styles.wideRow}>
            {renderNameCell(move, i)}
            {renderValueRow(move, i)}
          </View>
        ))}
      </ScrollView>
    );
  }

  // モバイル: 技名列固定 + 数値列横スクロール(行高固定で左右同期)
  return (
    <ScrollView>
      <View style={styles.mobileContainer}>
        <View style={styles.nameColumn}>
          <View style={[styles.headerCell, { width: NAME_COLUMN_WIDTH }]}>
            <Text style={styles.headerLabel}>{t("frameData.command")}</Text>
          </View>
          {sorted.map(renderNameCell)}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {renderColumnHeader(true)}
            {sorted.map(renderValueRow)}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    mobileContainer: {
      flexDirection: "row",
    },
    nameColumn: {
      width: NAME_COLUMN_WIDTH,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      backgroundColor: theme.colors.bg,
    },
    headerRow: {
      flexDirection: "row",
      height: 32,
    },
    wideHeaderRow: {
      flexDirection: "row",
      height: 32,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    wideRow: {
      flexDirection: "row",
    },
    headerCell: {
      height: 32,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xs,
    },
    headerLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      fontWeight: "600",
      textAlign: "center",
    },
    headerLabelActive: {
      color: theme.colors.accent,
    },
    nameCell: {
      height: ROW_HEIGHT,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    valueRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowAlt: {
      backgroundColor: theme.colors.surface,
    },
    moveName: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    properties: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      marginTop: 2,
    },
    valueCell: {
      alignItems: "center",
      justifyContent: "center",
    },
    valueText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontVariant: ["tabular-nums"],
      textAlign: "center",
    },
  });
```

注意: デスクトップ分岐では技名列と数値行が同じ `wideRow` 内にあるため行高は自然に揃う。モバイル分岐は左右が別ツリーなので **`ROW_HEIGHT` と `headerCell` の `height: 32` を両ペインで必ず一致させる**こと。

- [ ] **Step 6: MoveDetailSheet.tsx を実装**

備考・コンボ補正など長文はテーブルに乗せず、行タップでシート表示(スペック §3)。ネイティブ/Web 共通で RN の `Modal` を使い、モバイルは下からのシート風、`isWide` 時は中央のカードにする:

```tsx
// src/components/frame-data/MoveDetailSheet.tsx
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import { useResponsive } from "@/hooks/useResponsive";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import {
  getMoveName,
  getComboScaling,
  getNotes,
  getProperties,
} from "@/utils/moveName";

interface MoveDetailSheetProps {
  move: Move | null;
  visible: boolean;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  const styles = useThemedStyles(createStyles);
  if (!value || value === "" || value === "-") return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function MoveDetailSheet({ move, visible, onClose }: MoveDetailSheetProps) {
  const { t, i18n } = useTranslation();
  const { isWide } = useResponsive();
  const styles = useThemedStyles(createStyles);
  if (!move) return null;

  const lang = i18n.language;
  const stats: Array<{ label: string; value: string; isFrame: boolean }> = [
    { label: t("frameData.startup"), value: move.startup, isFrame: false },
    { label: t("frameData.onBlock"), value: move.onBlock, isFrame: true },
    { label: t("frameData.onHit"), value: move.onHit, isFrame: true },
    { label: t("frameData.damage"), value: move.damage, isFrame: false },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t("common.close")}
      >
        <Pressable
          style={[styles.sheet, isWide && styles.sheetWide]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>{getMoveName(move, lang)}</Text>
            {getProperties(move, lang) ? (
              <Text style={styles.subtitle}>{getProperties(move, lang)}</Text>
            ) : null}
          </View>
          <View style={styles.statRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                {s.isFrame ? (
                  <FrameValue value={s.value} fontSize={16} minWidth={0} />
                ) : (
                  <Text style={styles.statValue}>{s.value || "-"}</Text>
                )}
              </View>
            ))}
          </View>
          <ScrollView style={styles.detailList}>
            <DetailRow label={t("frameData.active")} value={move.active} />
            <DetailRow label={t("frameData.recovery")} value={move.recovery} />
            <DetailRow label={t("frameData.cancel")} value={move.cancel} />
            <DetailRow label={t("frameData.comboScaling")} value={getComboScaling(move, lang)} />
            <DetailRow label={t("frameData.driveGaugeGain")} value={move.driveGaugeGain} />
            <DetailRow label={t("frameData.driveGaugeLossBlock")} value={move.driveGaugeLossBlock} />
            <DetailRow label={t("frameData.driveGaugeLossPc")} value={move.driveGaugeLossPc} />
            <DetailRow label={t("frameData.saGaugeGain")} value={move.saGaugeGain} />
            {getNotes(move, lang) ? (
              <Text style={styles.notes}>{getNotes(move, lang)}</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.surfaceRaised,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      maxHeight: "75%",
    },
    sheetWide: {
      alignSelf: "center",
      width: 480,
      borderRadius: theme.radius.lg,
      marginBottom: "auto",
      marginTop: "auto",
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: "center",
      marginVertical: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      flexShrink: 1,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.sm,
    },
    statRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      gap: 2,
    },
    statLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
    },
    statValue: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    detailList: {
      flexGrow: 0,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    detailLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.sm,
    },
    detailValue: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontVariant: ["tabular-nums"],
      flexShrink: 1,
      textAlign: "right",
    },
    notes: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      lineHeight: 20,
      marginTop: theme.spacing.md,
    },
  });
```

i18n: `common.close`(ja: "閉じる" / en: "Close")が未定義なら追加。

- [ ] **Step 7: character/[slug].tsx を FrameTable に切り替え**

`MoveList` の代わりに:

```tsx
const [detailMove, setDetailMove] = useState<Move | null>(null);
const filteredMoves = useMemo(
  () =>
    categoryFilter === "all"
      ? data.moves
      : data.moves.filter((m) => m.category === categoryFilter),
  [data.moves, categoryFilter],
);
```

```tsx
<FrameTable moves={filteredMoves} onRowPress={setDetailMove} />
<MoveDetailSheet
  move={detailMove}
  visible={detailMove !== null}
  onClose={() => setDetailMove(null)}
/>
```

- 既存の `sortRow`(FilterChip によるソート行)は削除する(ソートは FrameTable のヘッダーに移った)
- カテゴリフィルタ行はそのまま残す
- 未使用になった import(`MoveList`, `FrameSortMode`)を削除

- [ ] **Step 8: 検証**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS

Run: `pnpm web` で確認:
- モバイル幅(DevTools で 390px): 技名列固定のまま数値列が横スクロールし、行がズレない
- デスクトップ幅: 全列表示、ヘッダークリックで asc/desc/解除がトグル
- 行タップで詳細シートが開き、備考が読める。ライトテーマでも確認

- [ ] **Step 9: コミット**

```bash
git add src/components/frame-data/ src/app/character/ src/i18n/
git commit -m "feat(frame-table): 技名列固定+横スクロールのフレーム表と詳細シートを追加"
```

---

### Task 8: 確反サマリのサービス実装

**Files:**
- Modify: `src/services/punishService.ts`
- Modify: `src/hooks/usePunishFinder.ts`
- Test: `src/services/__tests__/punishService.test.ts`(既存に追記)

**Interfaces:**
- Consumes: `findPunishes` / `PunishOption`(punishCalc)、`isPunishable`(frameAdvantage)
- Produces:
  - `interface MovePunishSummary { move: Move; punishable: boolean; punishes: PunishOption[] }`
  - `getPunishSummaries(opponentData: CharacterFrameData, myData: CharacterFrameData): MovePunishSummary[]` — 相手の**全技**(onBlock がパース可能な技)について確反リストを事前計算して返す
  - `usePunishFinder(opponentSlug: string | null, sortMode: SortMode): { summaries: MovePunishSummary[]; isLoading: boolean; isOpponentLoading: boolean }`(シグネチャ変更)

- [ ] **Step 1: テストを書く**

`src/services/__tests__/punishService.test.ts` に追記(既存のテストヘルパー `src/__tests__/helpers.ts` に Move/CharacterFrameData のファクトリがあれば流用し、なければ Task 7 のような `move()` ヘルパーをローカル定義):

```ts
import { getPunishSummaries } from "../punishService";

describe("getPunishSummaries", () => {
  const opponent = makeCharacterData({
    moves: [
      makeMove({ nameJa: "確反あり技", onBlock: "-8" }),
      makeMove({ nameJa: "確反なし技", onBlock: "-2" }),
      makeMove({ nameJa: "有利技", onBlock: "+2" }),
      makeMove({ nameJa: "投げ", onBlock: "-", category: "throw" }),
    ],
  });
  const me = makeCharacterData({
    moves: [makeMove({ nameJa: "立ち中P", startup: "6", damage: "600" })],
  });

  it("onBlock がパース可能な全技のサマリを返す(投げ等パース不能は除外)", () => {
    const summaries = getPunishSummaries(opponent, me);
    expect(summaries.map((s) => s.move.nameJa)).toEqual([
      "確反あり技",
      "確反なし技",
      "有利技",
    ]);
  });

  it("発生 <= |onBlock| の技があれば punishable", () => {
    const summaries = getPunishSummaries(opponent, me);
    expect(summaries[0].punishable).toBe(true);
    expect(summaries[0].punishes[0].move.nameJa).toBe("立ち中P");
    expect(summaries[0].punishes[0].framesToSpare).toBe(2);
    expect(summaries[1].punishable).toBe(false);
    expect(summaries[2].punishable).toBe(false);
  });
});
```

- [ ] **Step 2: テスト失敗を確認**

Run: `pnpm vitest run src/services/__tests__/punishService.test.ts`
Expected: FAIL(`getPunishSummaries` 未定義)

- [ ] **Step 3: punishService.ts に実装**

```ts
import { parseFrameValue } from "@/utils/frameAdvantage";

export interface MovePunishSummary {
  move: Move;
  punishable: boolean;
  punishes: PunishOption[];
}

/**
 * 相手の全技に対する確反サマリを事前計算する。
 * onBlock がパース不能な技(投げ・データなし)はリストから除外する。
 */
export function getPunishSummaries(
  opponentData: CharacterFrameData,
  myData: CharacterFrameData,
): MovePunishSummary[] {
  return opponentData.moves
    .filter((move) => parseFrameValue(move.onBlock) !== null)
    .map((move) => {
      const punishes = findPunishes(move.onBlock, myData.moves);
      return { move, punishable: punishes.length > 0, punishes };
    });
}
```

- [ ] **Step 4: usePunishFinder を書き換え**

```ts
// src/hooks/usePunishFinder.ts(全体を置き換え)
import { useMemo } from "react";
import { useFrameData } from "./useFrameData";
import { useMyCharacter } from "./useMyCharacter";
import {
  getPunishSummaries,
  sortPunishes,
  type MovePunishSummary,
  type SortMode,
} from "@/services/punishService";

interface PunishFinderResult {
  /** 相手の全技の確反サマリ(確反リストはソート済み) */
  summaries: MovePunishSummary[];
  isLoading: boolean;
  isOpponentLoading: boolean;
}

export function usePunishFinder(
  opponentSlug: string | null,
  sortMode: SortMode = "startup",
): PunishFinderResult {
  const { myCharacterSlug } = useMyCharacter();
  const { data: myData, isLoading } = useFrameData(myCharacterSlug);
  const { data: opponentData, isLoading: isOpponentLoading } =
    useFrameData(opponentSlug);

  const summaries = useMemo(() => {
    if (!opponentData || !myData) return [];
    return getPunishSummaries(opponentData, myData).map((s) => ({
      ...s,
      punishes: sortPunishes(s.punishes, sortMode),
    }));
  }, [opponentData, myData, sortMode]);

  return { summaries, isLoading, isOpponentLoading };
}
```

注意: この変更で `punish.tsx`(旧 API 利用)が一時的に型エラーになる。**Task 9 と同一 PR 内で連続作業する前提**だが、コミットを分けるためここでは `punish.tsx` を最小修正せず、Step 5 の typecheck は Task 9 完了後にまとめて確認する。それが嫌な場合(サブエージェント実行時)は Task 8 と Task 9 を1コミットにまとめてよい。

- [ ] **Step 5: ユニットテストのみ確認**

Run: `pnpm vitest run src/services/__tests__/punishService.test.ts`
Expected: PASS

- [ ] **Step 6: コミット(Task 9 とまとめる場合はスキップ)**

```bash
git add src/services/ src/hooks/usePunishFinder.ts
git commit -m "feat(punish): 相手全技の確反サマリ計算を追加"
```

---

### Task 9: 確反画面の1画面化

**Files:**
- Create: `src/components/punish/VsBar.tsx`
- Create: `src/components/punish/PunishSummaryRow.tsx`
- Rewrite: `src/app/(tabs)/punish.tsx`
- Delete: `src/components/ui/Stepper.tsx`、`src/components/punish/PunishResult.tsx`(未使用になる。`PunishMoveRow` は PunishSummaryRow 内で流用を検討し、未使用なら削除)
- Modify: `src/i18n/ja.json`, `en.json` ほか

**Interfaces:**
- Consumes: `usePunishFinder`(Task 8 の新シグネチャ)、`MovePunishSummary`、`searchMoves`(Task 10 で強化されるが現行版でも動く)、`FrameValue`、`CharacterSelectModal`、`useMyCharacter`、`useThemedStyles`
- Produces:
  - `VsBar({ myCharacter, opponent, onPressMy, onPressOpponent, onSwap })` — my/opponent は `Character | null`
  - `PunishSummaryRow({ summary, expanded, onToggle })` — summary は `MovePunishSummary`

- [ ] **Step 1: i18n キーを追加**

ja.json の `punish` セクションに追記(en ほかも同様に):

```json
"punish": {
  "punishableCount": "確反 {{count}}件",
  "noPunish": "確反なし",
  "swap": "自分と相手を入れ替え",
  "selectOpponent": "相手キャラを選択",
  "searchMoves": "技名で絞り込み"
}
```

en:

```json
"punish": {
  "punishableCount": "{{count}} punishes",
  "noPunish": "No punish",
  "swap": "Swap my character and opponent",
  "selectOpponent": "Select opponent",
  "searchMoves": "Filter moves"
}
```

- [ ] **Step 2: VsBar.tsx を実装**

```tsx
// src/components/punish/VsBar.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { Character } from "@/types/character";
import { useTheme, useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { getCharacterColors } from "@/theme/characterColors";

interface VsBarProps {
  myCharacter: Character | null;
  opponent: Character | null;
  onPressMy: () => void;
  onPressOpponent: () => void;
  onSwap: () => void;
}

function CharacterChip({
  character,
  placeholder,
  onPress,
}: {
  character: Character | null;
  placeholder: string;
  onPress: () => void;
}) {
  const { i18n, t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const name = character
    ? i18n.language === "ja"
      ? character.nameJa
      : character.name
    : placeholder;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name} (${t("common.change")})`}
      style={styles.chip}
    >
      {character ? (
        <View
          style={[
            styles.avatar,
            { backgroundColor: getCharacterColors(character.slug)[0] },
          ]}
        >
          <Text style={styles.avatarText}>{character.name.charAt(0)}</Text>
        </View>
      ) : null}
      <Text
        style={[styles.chipName, !character && styles.chipPlaceholder]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text style={styles.caret}>▾</Text>
    </Pressable>
  );
}

export function VsBar({
  myCharacter,
  opponent,
  onPressMy,
  onPressOpponent,
  onSwap,
}: VsBarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <CharacterChip
        character={myCharacter}
        placeholder={t("character.selectMyCharacter")}
        onPress={onPressMy}
      />
      <Text style={styles.vs}>vs</Text>
      <CharacterChip
        character={opponent}
        placeholder={t("punish.selectOpponent")}
        onPress={onPressOpponent}
      />
      <Pressable
        onPress={onSwap}
        disabled={!myCharacter || !opponent}
        accessibilityRole="button"
        accessibilityLabel={t("punish.swap")}
        style={styles.swapButton}
      >
        <Ionicons
          name="swap-horizontal"
          size={18}
          color={
            myCharacter && opponent
              ? theme.colors.textSecondary
              : theme.colors.textMuted
          }
        />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    chip: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      minHeight: 44,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: theme.radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: theme.fontSize.xs,
      fontWeight: "700",
    },
    chipName: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    chipPlaceholder: {
      color: theme.colors.textMuted,
      fontWeight: "400",
    },
    vs: {
      color: theme.colors.accent,
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    swapButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    caret: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
    },
  });
```

※ `getCharacterColors` のシグネチャは `src/theme/characterColors.ts` を実装時に確認し、返り値がタプルでなければ適宜合わせる。

- [ ] **Step 3: PunishSummaryRow.tsx を実装**

```tsx
// src/components/punish/PunishSummaryRow.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import type { MovePunishSummary } from "@/services/punishService";
import { FrameValue } from "@/components/frame-data/FrameValue";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import { getMoveName } from "@/utils/moveName";

interface PunishSummaryRowProps {
  summary: MovePunishSummary;
  expanded: boolean;
  onToggle: () => void;
}

export function PunishSummaryRow({
  summary,
  expanded,
  onToggle,
}: PunishSummaryRowProps) {
  const { t, i18n } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { move, punishable, punishes } = summary;
  const name = getMoveName(move, i18n.language);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onToggle}
        disabled={!punishable}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${name} ${
          punishable
            ? t("punish.punishableCount", { count: punishes.length })
            : t("punish.noPunish")
        }`}
        style={styles.row}
      >
        <View style={styles.nameColumn}>
          <Text
            style={[styles.moveName, !punishable && styles.moveNameMuted]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <FrameValue value={move.onBlock} />
        {punishable ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t("punish.punishableCount", { count: punishes.length })}
            </Text>
          </View>
        ) : (
          <Text style={styles.noPunish}>{t("punish.noPunish")}</Text>
        )}
      </Pressable>

      {expanded && punishable && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={styles.punishList}
        >
          {punishes.map((p, i) => (
            <View key={i} style={styles.punishRow}>
              <Text style={styles.punishName} numberOfLines={1}>
                {getMoveName(p.move, i18n.language)}
              </Text>
              <Text style={styles.punishMeta}>
                {t("frameData.startup")} {p.startup}
              </Text>
              <Text style={styles.punishMeta}>+{p.framesToSpare}F</Text>
              <Text style={styles.punishDamage}>{p.move.damage}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 48,
    },
    nameColumn: {
      flex: 1,
    },
    moveName: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    moveNameMuted: {
      color: theme.colors.textSecondary,
      fontWeight: "400",
    },
    badge: {
      backgroundColor: theme.colors.positiveSubtle,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      minWidth: 72,
      alignItems: "center",
    },
    badgeText: {
      color: theme.colors.framePositive,
      fontSize: theme.fontSize.xs,
      fontWeight: "700",
    },
    noPunish: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      minWidth: 72,
      textAlign: "center",
    },
    punishList: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.framePositive,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.xs,
    },
    punishRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
    },
    punishName: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
    },
    punishMeta: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.xs,
      fontVariant: ["tabular-nums"],
    },
    punishDamage: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontVariant: ["tabular-nums"],
      minWidth: 40,
      textAlign: "right",
    },
  });
```

- [ ] **Step 4: punish.tsx を全面書き換え**

```tsx
// src/app/(tabs)/punish.tsx(全体を置き換え)
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/useDataStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { useMyCharacter } from "@/hooks/useMyCharacter";
import { usePunishFinder } from "@/hooks/usePunishFinder";
import { CharacterSelectModal } from "@/components/character/CharacterSelectModal";
import { VsBar } from "@/components/punish/VsBar";
import { PunishSummaryRow } from "@/components/punish/PunishSummaryRow";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchBar } from "@/components/ui/SearchBar";
import { WebContainer } from "@/components/ui/WebContainer";
import { PageHead } from "@/components/seo/PageHead";
import { searchMoves } from "@/utils/search";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";
import type { MovePunishSummary } from "@/services/punishService";

export default function PunishScreen() {
  const { t } = useTranslation();
  const characters = useDataStore((s) => s.characters);
  const { myCharacter, setMyCharacter } = useMyCharacter();
  const sortMode = useFilterStore((s) => s.sortMode);
  const setSortMode = useFilterStore((s) => s.setSortMode);
  const styles = useThemedStyles(createStyles);

  const [opponentSlug, setOpponentSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [modalTarget, setModalTarget] = useState<"my" | "opponent" | null>(null);

  const opponent = useMemo(
    () => characters.find((c) => c.slug === opponentSlug) ?? null,
    [characters, opponentSlug],
  );

  const { summaries, isOpponentLoading } = usePunishFinder(opponentSlug, sortMode);

  const filtered = useMemo((): MovePunishSummary[] => {
    if (query.trim() === "") return summaries;
    const matchedMoves = new Set(
      searchMoves(summaries.map((s) => s.move), query),
    );
    return summaries.filter((s) => matchedMoves.has(s.move));
  }, [summaries, query]);

  const handleSwap = useCallback(() => {
    if (!myCharacter || !opponentSlug) return;
    const prevMySlug = myCharacter.slug;
    setMyCharacter(opponentSlug);
    setOpponentSlug(prevMySlug);
    setExpandedIndex(null);
  }, [myCharacter, opponentSlug, setMyCharacter]);

  return (
    <WebContainer>
      <PageHead
        title="SF6 Punish Finder - Frame Data Punish Calculator"
        description="Find guaranteed punishes after blocking in Street Fighter 6. Select the opponent and instantly see punishable moves with your best punish options."
        path="/punish"
      />
      <VsBar
        myCharacter={myCharacter ?? null}
        opponent={opponent}
        onPressMy={() => setModalTarget("my")}
        onPressOpponent={() => setModalTarget("opponent")}
        onSwap={handleSwap}
      />
      <CharacterSelectModal
        visible={modalTarget !== null}
        characters={characters}
        selectedSlug={modalTarget === "my" ? myCharacter?.slug : opponent?.slug}
        onSelect={(c) => {
          if (modalTarget === "my") {
            setMyCharacter(c.slug);
          } else {
            setOpponentSlug(c.slug);
          }
          setModalTarget(null);
          setExpandedIndex(null);
        }}
        onClose={() => setModalTarget(null)}
      />

      {opponent === null || !myCharacter ? (
        <View style={styles.center}>
          <Text style={styles.hint}>
            {!myCharacter
              ? t("character.selectMyCharacter")
              : t("punish.selectOpponent")}
          </Text>
          <Text style={styles.hintSub}>{t("punish.description")}</Text>
        </View>
      ) : isOpponentLoading ? (
        <View style={styles.center}>
          <Text style={styles.hint}>{t("common.loading")}</Text>
        </View>
      ) : (
        <>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t("punish.searchMoves")}
          />
          <View style={styles.sortRow}>
            <FilterChip
              label={t("sort.startup")}
              selected={sortMode === "startup"}
              onPress={() => setSortMode("startup")}
            />
            <FilterChip
              label={t("sort.damage")}
              selected={sortMode === "damage"}
              onPress={() => setSortMode("damage")}
            />
          </View>
          <Text style={styles.disclaimer}>{t("punish.disclaimer")}</Text>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.move.name}
            renderItem={({ item, index }) => (
              <PunishSummaryRow
                summary={item}
                expanded={expandedIndex === index}
                onToggle={() =>
                  setExpandedIndex((prev) => (prev === index ? null : index))
                }
              />
            )}
          />
        </>
      )}
    </WebContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    hint: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      textAlign: "center",
    },
    hintSub: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      textAlign: "center",
    },
    sortRow: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    disclaimer: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 6,
    },
  });
```

補足:
- 自キャラ未設定でも VsBar から直接設定できるため、旧実装の CharacterGrid フォールバックは中央のヒント文言に置き換える(タブ初回訪問時の導線は VsBar タップ)
- `keyExtractor` は `move.name`(同一キャラ内で一意。重複があれば `${item.move.name}-${index}` にする)

- [ ] **Step 5: 不要ファイルを削除**

```bash
grep -rn "Stepper\|PunishResult\|PunishMoveRow" src/ --include="*.tsx" --include="*.ts" | grep -v "components/ui/Stepper\|components/punish/PunishResult\|components/punish/PunishMoveRow"
```

利用箇所が残っていないことを確認してから:

```bash
rm src/components/ui/Stepper.tsx src/components/punish/PunishResult.tsx src/components/punish/PunishMoveRow.tsx
```

(PunishMoveRow が他から参照されている場合は残す)

- [ ] **Step 6: 検証**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS

Run: `pnpm web` で確認:
- 確反タブ: VsBar で相手を選ぶと全技+確反バッジが出る。行タップで反撃技が展開される。⇄で入替が動く。検索絞り込みが効く

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat(punish): 確反検索を1画面完結の vs バー+インライン展開に刷新"
```

---

### Task 10: 検索の正規化・エイリアス・テンキー表記

**Files:**
- Create: `src/utils/searchNormalize.ts`
- Create: `src/utils/moveAliases.ts`
- Modify: `src/utils/search.ts`
- Test: `src/utils/__tests__/searchNormalize.test.ts`、`src/utils/__tests__/search.test.ts`(追記)

**Interfaces:**
- Produces:
  - `normalizeQuery(text: string): string` — NFKC 正規化 + 小文字化 + カタカナ→ひらがな変換(searchNormalize.ts)
  - `expandAliases(normalizedQuery: string): string[]` — クエリ自身+エイリアス辞書の展開結果(moveAliases.ts)
  - `parseNumpadNotation(query: string): string[] | null` — `5MP` `2HK` `j.MP` 等を技名の検索語(ja/en)に変換。テンキー表記でなければ null(searchNormalize.ts)
  - `searchMoves(moves: Move[], query: string): Move[]` — シグネチャ不変、内部を強化

**データの前提(重要):** `data/frames/*.json` の `input` フィールドは全キャラ空文字。したがってコマンド検索は input との照合ではなく「表記→技名検索語への変換」で実現する。
- 通常技: `5MP`→「立ち中p」/「standing medium punch」、`2HK`→「しゃがみ強k」/「crouching heavy kick」、`j.MP`/`8MP`/`jMP`→「ジャンプ中p」/「jumping medium punch」
- 必殺技: `236P` などは技名に対応しないため、エイリアス辞書(波動/hadoken 等)でカバーする
- 表記: 数字は 5=立ち, 2=しゃがみ, 8/j=ジャンプ。ボタンは L/M/H × P/K(`LP MP HP LK MK HK`)

- [ ] **Step 1: テストを書く**

```ts
// src/utils/__tests__/searchNormalize.test.ts
import { describe, expect, it } from "vitest";
import { normalizeQuery, parseNumpadNotation } from "../searchNormalize";
import { expandAliases } from "../moveAliases";

describe("normalizeQuery", () => {
  it("カタカナをひらがなに変換する", () => {
    expect(normalizeQuery("タツマキ")).toBe("たつまき");
  });
  it("全角英数を半角小文字にする", () => {
    expect(normalizeQuery("ＯＤ波動")).toBe("od波動");
  });
  it("前後空白を除去する", () => {
    expect(normalizeQuery("  dp ")).toBe("dp");
  });
});

describe("parseNumpadNotation", () => {
  it("5MP → 立ち中P の検索語", () => {
    const terms = parseNumpadNotation("5MP");
    expect(terms).toContain("立ち中p");
    expect(terms).toContain("standing medium punch");
  });
  it("2HK → しゃがみ強K の検索語", () => {
    const terms = parseNumpadNotation("2hk");
    expect(terms).toContain("しゃがみ強k");
    expect(terms).toContain("crouching heavy kick");
  });
  it("j.MP / 8MP → ジャンプ中P の検索語(返り値は正規化済み=ひらがな)", () => {
    expect(parseNumpadNotation("j.MP")).toContain("じゃんぷ中p");
    expect(parseNumpadNotation("8MP")).toContain("じゃんぷ中p");
  });
  it("テンキー表記でなければ null", () => {
    expect(parseNumpadNotation("波動")).toBeNull();
    expect(parseNumpadNotation("236P")).toBeNull(); // 必殺技コマンドは対象外
  });
});

describe("expandAliases", () => {
  it("昇竜 → 昇龍(表記ゆれ)を含む", () => {
    expect(expandAliases("昇竜")).toContain("昇龍");
  });
  it("dp → 昇龍 / shoryuken を含む", () => {
    const terms = expandAliases("dp");
    expect(terms).toContain("昇龍");
    expect(terms).toContain("shoryuken");
  });
  it("辞書にない語はそのまま返す", () => {
    expect(expandAliases("波動拳")).toEqual(["波動拳"]);
  });
});
```

`src/utils/__tests__/search.test.ts` に統合テストを追記:

```ts
describe("searchMoves(強化版)", () => {
  const moves = [
    makeMove({ name: "Standing Medium Punch", nameJa: "立ち中P（鉤突き）" }),
    makeMove({ name: "L Shoryuken", nameJa: "弱 昇龍拳" }),
    makeMove({ name: "M Hadoken", nameJa: "中 波動拳" }),
  ];
  it("テンキー表記 5MP で立ち中Pがヒットする", () => {
    expect(searchMoves(moves, "5MP").map((m) => m.nameJa)).toEqual([
      "立ち中P（鉤突き）",
    ]);
  });
  it("通称 dp で昇龍拳がヒットする", () => {
    expect(searchMoves(moves, "dp").map((m) => m.nameJa)).toEqual([
      "弱 昇龍拳",
    ]);
  });
  it("表記ゆれ 昇竜 で昇龍拳がヒットする", () => {
    expect(searchMoves(moves, "昇竜").map((m) => m.nameJa)).toEqual([
      "弱 昇龍拳",
    ]);
  });
  it("カタカナ ハドウ ではヒットしないが 波動 でヒットする", () => {
    expect(searchMoves(moves, "波動")).toHaveLength(1);
  });
  it("既存の技名部分一致は引き続き動く", () => {
    expect(searchMoves(moves, "中P")).toHaveLength(1);
  });
});
```

(`makeMove` は既存テストのヘルパーに合わせる。なければ Task 7 同様のローカルファクトリを定義)

- [ ] **Step 2: テスト失敗を確認**

Run: `pnpm vitest run src/utils/__tests__/searchNormalize.test.ts src/utils/__tests__/search.test.ts`
Expected: FAIL

- [ ] **Step 3: searchNormalize.ts を実装**

```ts
// src/utils/searchNormalize.ts

/**
 * 検索クエリ/対象文字列の正規化。
 * NFKC(全角英数→半角など)+ 小文字化 + カタカナ→ひらがな + trim。
 */
export function normalizeQuery(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[ァ-ヶ]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60),
    );
}

const POSITION_TERMS: Record<string, { ja: string; en: string }> = {
  "5": { ja: "立ち", en: "standing" },
  "2": { ja: "しゃがみ", en: "crouching" },
  "8": { ja: "ジャンプ", en: "jumping" },
  j: { ja: "ジャンプ", en: "jumping" },
};

const STRENGTH_TERMS: Record<string, { ja: string; en: string }> = {
  l: { ja: "弱", en: "light" },
  m: { ja: "中", en: "medium" },
  h: { ja: "強", en: "heavy" },
};

const BUTTON_TERMS: Record<string, { ja: string; en: string }> = {
  p: { ja: "p", en: "punch" },
  k: { ja: "k", en: "kick" },
};

/**
 * テンキー/略記表記(5MP, 2hk, j.MP, 8MP, jMP)を技名検索語に変換する。
 * 対応しない表記(236P 等のコマンド)は null を返す。
 */
export function parseNumpadNotation(query: string): string[] | null {
  const m = query
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .match(/^([528j])\.?\s*([lmh])([pk])$/);
  if (!m) return null;
  const [, pos, strength, button] = m;
  const p = POSITION_TERMS[pos];
  const s = STRENGTH_TERMS[strength];
  const b = BUTTON_TERMS[button];
  // 検索は「正規化済みクエリ vs 正規化済み技名」で行うため、返り値も正規化して返す
  // (例: "ジャンプ中p" → "じゃんぷ中p"。技名側も normalizeQuery でひらがな化される)
  return [
    normalizeQuery(`${p.ja}${s.ja}${b.ja}`),
    normalizeQuery(`${p.en} ${s.en} ${b.en}`),
  ];
}
```

- [ ] **Step 4: moveAliases.ts を実装**

```ts
// src/utils/moveAliases.ts
import { normalizeQuery } from "./searchNormalize";

/**
 * 通称・表記ゆれ → 技名に含まれる語 のマッピング。
 * **キーは必ず normalizeQuery 済みの表記(ひらがな・半角小文字)で書くこと**
 * (ルックアップが正規化済みクエリで行われるため。カタカナのキーは絶対にヒットしない)。
 * 値は expandAliases 内で normalizeQuery に通されるので生の表記でよい。
 */
const ALIASES: Record<string, string[]> = {
  // 表記ゆれ
  "昇竜": ["昇龍"],
  "昇竜拳": ["昇龍拳"],
  // 通称(日本語)
  "たつまき": ["竜巻"],
  "すくりゅー": ["スクリュー"],
  "中足": ["しゃがみ中K"],
  "小足": ["しゃがみ弱K"],
  "大足": ["しゃがみ強K"],
  "いんぱくと": ["ドライブインパクト", "drive impact"],
  // 通称(英語・ローマ字)
  "dp": ["昇龍", "shoryuken", "rising"],
  "shoryu": ["昇龍", "shoryuken"],
  "hadoken": ["波動", "hadoken"],
  "hadouken": ["波動", "hadoken"],
  "tatsu": ["竜巻", "tatsumaki"],
  "di": ["ドライブインパクト", "drive impact"],
  "spd": ["スクリュー", "screw"],
};

/**
 * 正規化済みクエリをエイリアス展開する。
 * クエリ自身も検索語に含める(余計な要素があっても部分一致検索では無害)。
 */
export function expandAliases(normalizedQuery: string): string[] {
  const aliased = ALIASES[normalizedQuery];
  if (!aliased) return [normalizedQuery];
  return [normalizedQuery, ...aliased.map(normalizeQuery)];
}
```

- [ ] **Step 5: search.ts を強化**

```ts
// src/utils/search.ts(全体を置き換え)
import type { Move } from "@/types/frame-data";
import { normalizeQuery, parseNumpadNotation } from "./searchNormalize";
import { expandAliases } from "./moveAliases";

/**
 * 技名・通称・テンキー表記で検索する。
 * - クエリと技名の両方を正規化(NFKC/小文字/かな統一)して部分一致
 * - エイリアス辞書(dp→昇龍 等)を展開し、いずれかにマッチすればヒット
 * - テンキー表記(5MP 等)は 立ち/しゃがみ/ジャンプ + 強度 + ボタン に変換
 */
export function searchMoves(moves: Move[], query: string): Move[] {
  const normalized = normalizeQuery(query);
  if (normalized === "") return moves;

  const numpadTerms = parseNumpadNotation(query);
  const terms = numpadTerms ?? expandAliases(normalized);

  return moves.filter((move) => {
    const nameEn = normalizeQuery(move.name);
    const nameJa = normalizeQuery(move.nameJa);
    const input = normalizeQuery(move.input);
    return terms.some(
      (term) =>
        nameEn.includes(term) ||
        nameJa.includes(term) ||
        (input !== "" && input.includes(term)),
    );
  });
}
```

- [ ] **Step 6: テスト成功を確認**

Run: `pnpm vitest run`
Expected: 全テスト PASS(既存の search.test.ts の旧ケースが正規化強化で挙動変化していないか注意。大文字小文字の扱いは従来も lowercase 比較だったため互換)

- [ ] **Step 7: コミット**

```bash
git add src/utils/
git commit -m "feat(search): かな正規化・エイリアス辞書・テンキー表記検索を追加"
```

---

### Task 11: 検索画面のフィルタ UI

**Files:**
- Modify: `src/app/(tabs)/search.tsx`
- Create: `src/utils/searchFilters.ts`
- Modify: `src/i18n/ja.json`, `en.json` ほか
- Test: `src/utils/__tests__/searchFilters.test.ts`

**Interfaces:**
- Consumes: `parseFrameValue`、`Move` / `MoveCategory`、`FilterChip`、`CharacterSelectModal`
- Produces:
  - `interface SearchFilters { characterSlug: string | null; category: MoveCategory | "all"; maxStartup: number | null; maxOnBlock: number | null }`
  - `DEFAULT_FILTERS: SearchFilters`
  - `applyFilters(moves: Move[], filters: Omit<SearchFilters, "characterSlug">): Move[]`(キャラ絞り込みは画面側でキャラ単位に適用)

- [ ] **Step 1: テストを書く**

```ts
// src/utils/__tests__/searchFilters.test.ts
import { describe, expect, it } from "vitest";
import { applyFilters, DEFAULT_FILTERS } from "../searchFilters";
// makeMove は既存ヘルパーまたはローカルファクトリ

describe("applyFilters", () => {
  const moves = [
    makeMove({ nameJa: "速い技", startup: "4", onBlock: "-2", category: "normal" }),
    makeMove({ nameJa: "遅い技", startup: "12", onBlock: "-8", category: "special" }),
    makeMove({ nameJa: "投げ", startup: "5", onBlock: "-", category: "throw" }),
  ];

  it("デフォルトは全件返す", () => {
    expect(applyFilters(moves, DEFAULT_FILTERS)).toHaveLength(3);
  });
  it("maxStartup: 発生N以下のみ", () => {
    const result = applyFilters(moves, { ...DEFAULT_FILTERS, maxStartup: 5 });
    expect(result.map((m) => m.nameJa)).toEqual(["速い技", "投げ"]);
  });
  it("maxOnBlock: ガード時 -N 以下のみ(パース不能は除外)", () => {
    const result = applyFilters(moves, { ...DEFAULT_FILTERS, maxOnBlock: -6 });
    expect(result.map((m) => m.nameJa)).toEqual(["遅い技"]);
  });
  it("category 絞り込み", () => {
    const result = applyFilters(moves, { ...DEFAULT_FILTERS, category: "special" });
    expect(result.map((m) => m.nameJa)).toEqual(["遅い技"]);
  });
});
```

- [ ] **Step 2: テスト失敗を確認 → searchFilters.ts を実装**

```ts
// src/utils/searchFilters.ts
import type { Move, MoveCategory } from "@/types/frame-data";
import { parseFrameValue } from "./frameAdvantage";

export interface SearchFilters {
  characterSlug: string | null;
  category: MoveCategory | "all";
  /** 発生 N フレーム以下(null = 無効) */
  maxStartup: number | null;
  /** ガード時 N 以下(負数。null = 無効)。確反探し用 */
  maxOnBlock: number | null;
}

export const DEFAULT_FILTERS: SearchFilters = {
  characterSlug: null,
  category: "all",
  maxStartup: null,
  maxOnBlock: null,
};

export function applyFilters(
  moves: Move[],
  filters: Omit<SearchFilters, "characterSlug">,
): Move[] {
  return moves.filter((move) => {
    if (filters.category !== "all" && move.category !== filters.category) {
      return false;
    }
    if (filters.maxStartup !== null) {
      const startup = parseFrameValue(move.startup);
      if (startup === null || startup > filters.maxStartup) return false;
    }
    if (filters.maxOnBlock !== null) {
      const onBlock = parseFrameValue(move.onBlock);
      if (onBlock === null || onBlock > filters.maxOnBlock) return false;
    }
    return true;
  });
}
```

Run: `pnpm vitest run src/utils/__tests__/searchFilters.test.ts`
Expected: PASS

- [ ] **Step 3: i18n キーを追加**

ja(en ほかも同様):

```json
"searchFilter": {
  "allCharacters": "全キャラ",
  "startupMax": "発生{{n}}F以下",
  "onBlockMax": "ガード{{n}}以下",
  "showResults": "フィルタ"
}
```

en:

```json
"searchFilter": {
  "allCharacters": "All characters",
  "startupMax": "Startup ≤ {{n}}F",
  "onBlockMax": "On block ≤ {{n}}",
  "showResults": "Filters"
}
```

- [ ] **Step 4: search.tsx にフィルタ行を追加**

`SearchBar` の直下に横スクロールのフィルタ行を追加する:

```tsx
const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
const [charModalVisible, setCharModalVisible] = useState(false);

const STARTUP_PRESETS = [5, 7, 10];
const ONBLOCK_PRESETS = [-4, -6, -8];
// カテゴリは既存の filter.* i18n キー(キャラ詳細画面と共通)を使う
const CATEGORY_PRESETS = ["normal", "special", "super", "throw"] as const;
```

```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.filterRow}
>
  <FilterChip
    label={
      filters.characterSlug
        ? (lang === "ja"
            ? characters.find((c) => c.slug === filters.characterSlug)?.nameJa
            : characters.find((c) => c.slug === filters.characterSlug)?.name) ??
          t("searchFilter.allCharacters")
        : t("searchFilter.allCharacters")
    }
    selected={filters.characterSlug !== null}
    onPress={() => setCharModalVisible(true)}
  />
  {STARTUP_PRESETS.map((n) => (
    <FilterChip
      key={`su-${n}`}
      label={t("searchFilter.startupMax", { n })}
      selected={filters.maxStartup === n}
      onPress={() =>
        setFilters((f) => ({ ...f, maxStartup: f.maxStartup === n ? null : n }))
      }
    />
  ))}
  {ONBLOCK_PRESETS.map((n) => (
    <FilterChip
      key={`ob-${n}`}
      label={t("searchFilter.onBlockMax", { n })}
      selected={filters.maxOnBlock === n}
      onPress={() =>
        setFilters((f) => ({ ...f, maxOnBlock: f.maxOnBlock === n ? null : n }))
      }
    />
  ))}
  {CATEGORY_PRESETS.map((cat) => (
    <FilterChip
      key={`cat-${cat}`}
      label={t(`filter.${cat}`)}
      selected={filters.category === cat}
      onPress={() =>
        setFilters((f) => ({ ...f, category: f.category === cat ? "all" : cat }))
      }
    />
  ))}
</ScrollView>

<CharacterSelectModal
  visible={charModalVisible}
  characters={characters}
  selectedSlug={filters.characterSlug ?? undefined}
  onSelect={(c) => {
    setFilters((f) => ({
      ...f,
      characterSlug: f.characterSlug === c.slug ? null : c.slug,
    }));
    setCharModalVisible(false);
  }}
  onClose={() => setCharModalVisible(false)}
/>
```

`results` の useMemo を変更: キャラ絞り込み+`applyFilters` を適用し、**フィルタのみ指定でクエリ空でも結果を出す**:

```tsx
const results = useMemo((): SearchResult[] => {
  const hasQuery = query.trim() !== "";
  const hasFilter =
    filters.characterSlug !== null ||
    filters.category !== "all" ||
    filters.maxStartup !== null ||
    filters.maxOnBlock !== null;
  if (!allLoaded || (!hasQuery && !hasFilter)) return [];

  const matched: SearchResult[] = [];
  for (const char of characters) {
    if (filters.characterSlug && char.slug !== filters.characterSlug) continue;
    const data = frameDataCache[char.slug];
    if (!data) continue;
    const bySearch = hasQuery ? searchMoves(data.moves, query) : data.moves;
    const moves = applyFilters(bySearch, filters);
    if (moves.length > 0) {
      matched.push({ character: char, moves });
    }
  }
  return matched;
}, [allLoaded, query, filters, characters, frameDataCache]);
```

表示条件の分岐(`query.trim() === ""` でヒント表示)も `!hasQuery && !hasFilter` 相当に更新する。`filterRow` スタイルを追加:

```ts
filterRow: {
  paddingHorizontal: theme.spacing.lg,
  paddingBottom: theme.spacing.sm,
  alignItems: "center",
},
```

- [ ] **Step 5: 検証**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS

Run: `pnpm web` → 検索タブで「発生5F以下」チップのみで全キャラの速い技が一覧できる。`5MP` 検索・`dp` 検索がヒットする。

- [ ] **Step 6: コミット**

```bash
git add src/app/\(tabs\)/search.tsx src/utils/searchFilters.ts src/utils/__tests__/searchFilters.test.ts src/i18n/
git commit -m "feat(search): キャラ・発生・ガード時フィルタを追加"
```

---

### Task 12: a11y・ハプティクス・reduced motion・エンプティステート

**Files:**
- Create: `src/utils/haptics.ts`
- Create: `src/components/ui/Skeleton.tsx`
- Modify: `src/components/character/CharacterCard.tsx`、`src/components/character/CharacterGrid.tsx`、`src/components/character/CharacterSelectModal.tsx`、`src/components/ui/{SearchBar,MyCharacterBar,AppHeader}.tsx`、`src/app/(tabs)/{index,search,settings}.tsx`、`src/app/character/[slug].tsx`
- Modify: `package.json`(expo-haptics 追加)

**Interfaces:**
- Produces:
  - `lightImpact(): void` / `selectionTap(): void`(haptics.ts — Web では no-op)
  - `Skeleton({ width, height, borderRadius }: { width?: number | string; height?: number; borderRadius?: number })`

- [ ] **Step 1: expo-haptics を追加**

```bash
pnpm expo install expo-haptics
```

`metro.config.js` の web shim 対象(google-mobile-ads 等を空モジュールに差し替えている箇所)を確認し、expo-haptics は web ビルドを壊さないため shim 不要(公式に web no-op)。ビルドが通ることは Step 6 で確認。

- [ ] **Step 2: haptics.ts を実装**

```ts
// src/utils/haptics.ts
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
```

呼び出し箇所(それぞれ onPress 冒頭に追加):
- `FilterChip.onPress` → `selectionTap()`
- `CharacterCard` の onPress → `lightImpact()`
- `PunishSummaryRow` の onToggle(punish.tsx 側)→ `lightImpact()`
- 設定画面のテーマ/言語行 → `selectionTap()`

- [ ] **Step 3: Skeleton.tsx を実装し、ローディング表示を置換**

```tsx
// src/components/ui/Skeleton.tsx
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeContext";
import type { DimensionValue } from "react-native";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 6 }: SkeletonProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      style={[
        { width, height, borderRadius, backgroundColor: theme.colors.surfaceRaised },
        style,
      ]}
    />
  );
}
```

置換箇所:
- `character/[slug].tsx` のローディング分岐 → 技名列+数値行を模した Skeleton 8行(`gap: 12` の View に `<Skeleton height={40} />` ×8)
- `search.tsx` の `allLoaded` 前ローディング → Skeleton 6行
- `punish.tsx` の `isOpponentLoading` → Skeleton 6行

- [ ] **Step 4: reduced motion 対応**

`CharacterGrid.tsx` / `PunishSummaryRow.tsx`(および entering アニメーションを使う残りの箇所)で:

```tsx
import { useReducedMotion } from "react-native-reanimated";
// コンポーネント内
const reduced = useReducedMotion();
// entering={reduced ? undefined : FadeInUp.delay(index * 30)}
```

FilterChip / CharacterCard のプレススケールは `reduced` 時に `withTiming` を呼ばずスキップ(`if (reduced) return;` を onPressIn/Out 冒頭に)。

- [ ] **Step 5: a11y 属性の一括付与**

以下を確認し、欠けていれば追加(Task 5〜11 で追加済みのものはスキップ):
- `CharacterCard`: `accessibilityRole="button"`、`accessibilityLabel={キャラ名}`、選択状態があれば `accessibilityState={{ selected }}`
- `CharacterSelectModal` の閉じるボタン・各行: role/label
- `SearchBar` の TextInput: `accessibilityLabel={placeholder}`、クリアボタンがあれば label
- `MyCharacterBar`: role="button" + label
- 設定画面の全 Pressable(言語行・リンク行): role="button"(言語行は `radio` + `accessibilityState={{ selected }}`)
- タブ(`(tabs)/_layout.tsx`): expo-router の Tabs はデフォルトで role を付与するため確認のみ
- タッチターゲット: `FilterChip` は Task 5 で `minHeight: 32` にしたが、`hitSlop={6}` を追加して実効44ptを確保。他の小さい Pressable(VsBar の swap は 44×44 済み)も `hitSlop` で対応

- [ ] **Step 6: 検証**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build:web`
Expected: PASS

Run: `pnpm web` → macOS の「視差効果を減らす」を有効にした状態でアニメーションが消えること(または DevTools の prefers-reduced-motion エミュレーション)。VoiceOver/スクリーンリーダーの簡易確認(Tab キーでのフォーカス遷移が全インタラクティブ要素に届く)。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat(a11y): アクセシビリティ属性・ハプティクス・reduced motion・スケルトンを追加"
```

---

### Task 13: 最終検証と仕上げ

**Files:**
- Modify: 検証で見つかった不具合の修正のみ

- [ ] **Step 1: 全チェックを実行**

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build:web
```

Expected: すべて PASS(format:check が落ちたら `pnpm format` を実行)

- [ ] **Step 2: Web スモークテスト(Playwright)**

`pnpm web` をバックグラウンド起動し、playwright(依存に導入済み)で主要3画面を確認するスクリプトを一時実行:

```ts
// scripts/smoke-web.ts(一時ファイル。コミットしない)
// tsx scripts/smoke-web.ts で実行
import { chromium } from "playwright";

const BASE = "http://localhost:8081";

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  for (const path of ["/", "/punish", "/search", "/character/ryu"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.screenshot({ path: `/tmp/smoke${path.replace(/\//g, "_")}.png` });
  }

  // デスクトップ幅でも確認
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + "/character/ryu", { waitUntil: "networkidle" });

  await browser.close();
  if (errors.length > 0) {
    console.error("ページエラー:", errors);
    process.exit(1);
  }
  console.log("スモークテスト OK");
};

run();
```

Expected: 「スモークテスト OK」。スクリーンショットを目視し、ダーク/ライト両テーマ・モバイル/デスクトップ幅でレイアウト破綻がないこと。

- [ ] **Step 3: iOS シミュレーター目視確認**

Run: `pnpm ios`
確認項目: テーマ切替(システム追従含む)/ フレーム表の横スクロールと行ズレなし / 確反1画面フロー / ハプティクス(実機がなければスキップ可)/ 検索(5MP・dp・フィルタ)

- [ ] **Step 4: スペック突合**

スペック `docs/superpowers/specs/2026-07-07-ui-modernization-design.md` の各セクション(§1〜§6・テスト)を読み、実装漏れがないか確認。漏れがあれば修正タスクを追加。

- [ ] **Step 5: 最終コミット**

```bash
git add -A
git commit -m "fix(ui): 最終検証での修正"  # 修正があった場合のみ
```
