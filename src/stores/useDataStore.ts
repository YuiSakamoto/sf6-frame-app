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
import bundledJamie from "../../data/frames/jamie.json";
import bundledGuile from "../../data/frames/guile.json";
import bundledKimberly from "../../data/frames/kimberly.json";
import bundledJuri from "../../data/frames/juri.json";
import bundledBlanka from "../../data/frames/blanka.json";
import bundledDhalsim from "../../data/frames/dhalsim.json";
import bundledDeejay from "../../data/frames/deejay.json";
import bundledManon from "../../data/frames/manon.json";
import bundledMarisa from "../../data/frames/marisa.json";
import bundledLily from "../../data/frames/lily.json";
import bundledZangief from "../../data/frames/zangief.json";
import bundledCammy from "../../data/frames/cammy.json";
import bundledJp from "../../data/frames/jp.json";
import bundledRashid from "../../data/frames/rashid.json";
import bundledAki from "../../data/frames/aki.json";
import bundledEd from "../../data/frames/ed.json";
import bundledAkuma from "../../data/frames/gouki_akuma.json";
import bundledChunli from "../../data/frames/chunli.json";
import bundledEhonda from "../../data/frames/ehonda.json";
import bundledBison from "../../data/frames/vega_mbison.json";
import bundledTerry from "../../data/frames/terry.json";
import bundledMai from "../../data/frames/mai.json";
import bundledElena from "../../data/frames/elena.json";
import bundledCviper from "../../data/frames/cviper.json";
import bundledSagat from "../../data/frames/sagat.json";
import bundledAlex from "../../data/frames/alex.json";

const BUNDLED_FRAMES: Record<string, CharacterFrameData> = {
  ryu: bundledRyu as CharacterFrameData,
  luke: bundledLuke as CharacterFrameData,
  ken: bundledKen as CharacterFrameData,
  jamie: bundledJamie as CharacterFrameData,
  guile: bundledGuile as CharacterFrameData,
  kimberly: bundledKimberly as CharacterFrameData,
  juri: bundledJuri as CharacterFrameData,
  blanka: bundledBlanka as CharacterFrameData,
  dhalsim: bundledDhalsim as CharacterFrameData,
  deejay: bundledDeejay as CharacterFrameData,
  manon: bundledManon as CharacterFrameData,
  marisa: bundledMarisa as CharacterFrameData,
  lily: bundledLily as CharacterFrameData,
  zangief: bundledZangief as CharacterFrameData,
  cammy: bundledCammy as CharacterFrameData,
  jp: bundledJp as CharacterFrameData,
  rashid: bundledRashid as CharacterFrameData,
  aki: bundledAki as CharacterFrameData,
  ed: bundledEd as CharacterFrameData,
  gouki_akuma: bundledAkuma as CharacterFrameData,
  chunli: bundledChunli as CharacterFrameData,
  ehonda: bundledEhonda as CharacterFrameData,
  vega_mbison: bundledBison as CharacterFrameData,
  terry: bundledTerry as CharacterFrameData,
  mai: bundledMai as CharacterFrameData,
  elena: bundledElena as CharacterFrameData,
  cviper: bundledCviper as CharacterFrameData,
  sagat: bundledSagat as CharacterFrameData,
  alex: bundledAlex as CharacterFrameData,
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
    // バンドルの方がキャラ数が多い場合はバンドルを優先（アプリ更新でキャラ追加された場合）
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
