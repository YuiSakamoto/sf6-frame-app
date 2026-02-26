import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageService } from "@/services/storageService";
import i18n from "@/i18n";

interface SettingsState {
  myCharacterSlug: string | null;
  language: string;
  setMyCharacter: (slug: string) => void;
  setLanguage: (lang: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      myCharacterSlug: null,
      language: i18n.language,
      setMyCharacter: (slug) => set({ myCharacterSlug: slug }),
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => storageService.zustandStorage),
    },
  ),
);
