import { createContext, useContext, useMemo, type ReactNode } from "react";
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
    themeMode === "system"
      ? systemScheme === "light"
        ? "light"
        : "dark"
      : themeMode;
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
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
