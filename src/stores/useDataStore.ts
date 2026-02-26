import { create } from "zustand";
import type { Character } from "@/types/character";
import type { CharacterFrameData, VersionInfo } from "@/types/frame-data";
import { dataService } from "@/services/dataService";

// バンドル済みの初期データ
import bundledCharacters from "../../data/characters.json";
import bundledVersion from "../../data/version.json";
import bundledRyu from "../../data/frames/ryu.json";
import bundledLuke from "../../data/frames/luke.json";
import bundledKen from "../../data/frames/ken.json";

const BUNDLED_FRAMES: Record<string, CharacterFrameData> = {
  ryu: bundledRyu as CharacterFrameData,
  luke: bundledLuke as CharacterFrameData,
  ken: bundledKen as CharacterFrameData,
};

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
    // キャッシュからロード、なければバンドルデータを使用
    const cachedCharacters = dataService.getCachedCharacters();
    const cachedVersion = dataService.getCachedVersion();

    const characters = cachedCharacters.ok
      ? cachedCharacters.value
      : (bundledCharacters as Character[]);

    const version = cachedVersion.ok
      ? cachedVersion.value
      : (bundledVersion as VersionInfo);

    set({ characters, version, isLoading: false });
  },

  loadFrameData: async (slug: string) => {
    const { frameDataCache } = get();

    // メモリキャッシュをチェック
    if (frameDataCache[slug]) {
      return frameDataCache[slug];
    }

    // MMKVキャッシュをチェック
    const cached = dataService.getCachedFrameData(slug);
    if (cached.ok) {
      set((state) => ({
        frameDataCache: { ...state.frameDataCache, [slug]: cached.value },
      }));
      return cached.value;
    }

    // バンドル済みデータを参照
    const bundled = BUNDLED_FRAMES[slug];
    if (bundled) {
      set((state) => ({
        frameDataCache: { ...state.frameDataCache, [slug]: bundled },
      }));
      return bundled;
    }

    // バンドルにもない場合、リモートからフェッチ
    {
      const result = await dataService.fetchFrameData(slug);
      if (result.ok) {
        dataService.cacheFrameData(slug, result.value);
        set((state) => ({
          frameDataCache: {
            ...state.frameDataCache,
            [slug]: result.value,
          },
        }));
        return result.value;
      }
      set({ error: result.error.message });
      return null;
    }
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

      // キャラクター一覧を更新
      const remoteCharacters = await dataService.fetchCharacters();
      if (remoteCharacters.ok) {
        dataService.cacheCharacters(remoteCharacters.value);
        set({ characters: remoteCharacters.value });
      }

      // 各キャラクターのフレームデータを更新
      for (const slug of remoteVersion.value.characters) {
        const frameData = await dataService.fetchFrameData(slug);
        if (frameData.ok) {
          dataService.cacheFrameData(slug, frameData.value);
          set((state) => ({
            frameDataCache: {
              ...state.frameDataCache,
              [slug]: frameData.value,
            },
          }));
        }
      }

      dataService.cacheVersion(remoteVersion.value);
      set({ version: remoteVersion.value, isSyncing: false });
    } catch {
      set({ isSyncing: false });
    }
  },
}));
