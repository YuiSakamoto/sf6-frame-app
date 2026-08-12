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
