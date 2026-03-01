import type { CharacterFrameData, VersionInfo } from "@/types/frame-data";
import type { Character } from "@/types/character";
import type { Result } from "@/types/result";
import { ok, err } from "@/types/result";
import { storageService } from "./storageService";

const BASE_URL =
  "https://raw.githubusercontent.com/YuiSakamoto/sf6-frame-app/main/data";

const CACHE_KEYS = {
  version: "cache:version",
  characters: "cache:characters",
  frameData: (slug: string) => `cache:frames:${slug}`,
} as const;

async function fetchJson<T>(url: string): Promise<Result<T>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return err(new Error(`HTTP ${response.status}: ${url}`));
    }
    const data = (await response.json()) as T;
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Unknown fetch error"));
  }
}

export const dataService = {
  /** リモートのバージョン情報を取得 */
  async fetchVersion(): Promise<Result<VersionInfo>> {
    return fetchJson<VersionInfo>(`${BASE_URL}/version.json`);
  },

  /** キャラクター一覧を取得 */
  async fetchCharacters(): Promise<Result<Character[]>> {
    return fetchJson<Character[]>(`${BASE_URL}/characters.json`);
  },

  /** キャラクターのフレームデータを取得 */
  async fetchFrameData(slug: string): Promise<Result<CharacterFrameData>> {
    return fetchJson<CharacterFrameData>(`${BASE_URL}/frames/${slug}.json`);
  },

  /** キャッシュされたバージョン情報を取得 */
  getCachedVersion(): Result<VersionInfo> {
    return storageService.getObject<VersionInfo>(CACHE_KEYS.version);
  },

  /** キャッシュされたキャラクター一覧を取得 */
  getCachedCharacters(): Result<Character[]> {
    return storageService.getObject<Character[]>(CACHE_KEYS.characters);
  },

  /** キャッシュされたフレームデータを取得 */
  getCachedFrameData(slug: string): Result<CharacterFrameData> {
    return storageService.getObject<CharacterFrameData>(
      CACHE_KEYS.frameData(slug),
    );
  },

  /** バージョン情報をキャッシュに保存 */
  cacheVersion(version: VersionInfo): void {
    storageService.setObject(CACHE_KEYS.version, version);
  },

  /** キャラクター一覧をキャッシュに保存 */
  cacheCharacters(characters: Character[]): void {
    storageService.setObject(CACHE_KEYS.characters, characters);
  },

  /** フレームデータをキャッシュに保存 */
  cacheFrameData(slug: string, data: CharacterFrameData): void {
    storageService.setObject(CACHE_KEYS.frameData(slug), data);
  },
};
