import { create } from "zustand";
import type { Character } from "@/types/character";
import type { CharacterFrameData, VersionInfo } from "@/types/frame-data";
import { dataService } from "@/services/dataService";

import bundledCharacters from "../../data/characters.json";
import bundledVersion from "../../data/version.json";

interface DataState {
  characters: Character[];
  frameDataCache: Record<string, CharacterFrameData>;
  version: VersionInfo | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  initialize: () => void;
  loadFrameData: (slug: string) => Promise<CharacterFrameData | null>;
  syncFromRemote: () => Promise<void>;
}

export const useDataStore = create<DataState>()((set, get) => ({
  characters: [],
  frameDataCache: {},
  version: null,
  isLoading: true,
  isSyncing: false,
  error: null,

  initialize: () => {
    const cachedCharacters = dataService.getCachedCharacters();
    const cachedVersion = dataService.getCachedVersion();
    const bundled = bundledCharacters as Character[];

    const characters =
      cachedCharacters.ok && cachedCharacters.value.length >= bundled.length
        ? cachedCharacters.value
        : bundled;

    const version = cachedVersion.ok
      ? cachedVersion.value
      : (bundledVersion as VersionInfo);

    set({ characters, version, isLoading: false });
  },

  loadFrameData: async (slug: string) => {
    const { frameDataCache } = get();

    if (frameDataCache[slug]) {
      return frameDataCache[slug];
    }

    const cached = dataService.getCachedFrameData(slug);
    if (cached.ok) {
      set((state) => ({
        frameDataCache: { ...state.frameDataCache, [slug]: cached.value },
      }));
      return cached.value;
    }

    const result = await dataService.fetchFrameData(slug);
    if (result.ok) {
      dataService.cacheFrameData(slug, result.value);
      set((state) => ({
        frameDataCache: { ...state.frameDataCache, [slug]: result.value },
      }));
      return result.value;
    }
    set({ error: result.error.message });
    return null;
  },

  syncFromRemote: async () => {
    set({ isSyncing: true });
    try {
      const remoteVersion = await dataService.fetchVersion();
      if (!remoteVersion.ok) {
        set({ isSyncing: false });
        return;
      }

      const currentVersion = get().version;
      if (currentVersion?.version === remoteVersion.value.version) {
        set({ isSyncing: false });
        return;
      }

      const remoteCharacters = await dataService.fetchCharacters();
      if (remoteCharacters.ok) {
        dataService.cacheCharacters(remoteCharacters.value);
        set({ characters: remoteCharacters.value });
      }

      dataService.cacheVersion(remoteVersion.value);
      set({ version: remoteVersion.value, isSyncing: false });
    } catch {
      set({ isSyncing: false });
    }
  },
}));
