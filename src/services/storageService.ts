import type { Result } from "@/types/result";
import { ok, err } from "@/types/result";
import AsyncStorage from "@react-native-async-storage/async-storage";

// メモリキャッシュ（同期API用）。起動時に AsyncStorage から復元する。
const memoryStore = new Map<string, string>();
let initialized = false;

// AsyncStorage からメモリキャッシュを復元
export async function initStorage(): Promise<void> {
  if (initialized) return;
  try {
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        memoryStore.set(key, value);
      }
    }
  } catch {
    // 初期化失敗時はメモリのみで動作
  }
  initialized = true;
}

// AsyncStorage にバックグラウンドで書き込み
function persistAsync(key: string, value: string): void {
  AsyncStorage.setItem(key, value).catch(() => {});
}

function removeAsync(key: string): void {
  AsyncStorage.removeItem(key).catch(() => {});
}

export const storageService = {
  getString(key: string): Result<string> {
    const value = memoryStore.get(key);
    if (value === undefined) {
      return err(new Error(`Key not found: ${key}`));
    }
    return ok(value);
  },

  getObject<T>(key: string): Result<T> {
    const raw = memoryStore.get(key);
    if (raw === undefined) {
      return err(new Error(`Key not found: ${key}`));
    }
    try {
      return ok(JSON.parse(raw) as T);
    } catch {
      return err(new Error(`Failed to parse JSON for key: ${key}`));
    }
  },

  set(key: string, value: string): void {
    memoryStore.set(key, value);
    persistAsync(key, value);
  },

  setObject<T>(key: string, value: T): void {
    const json = JSON.stringify(value);
    memoryStore.set(key, json);
    persistAsync(key, json);
  },

  delete(key: string): void {
    memoryStore.delete(key);
    removeAsync(key);
  },

  contains(key: string): boolean {
    return memoryStore.has(key);
  },

  zustandStorage: {
    getItem: (name: string): string | null => {
      return memoryStore.get(name) ?? null;
    },
    setItem: (name: string, value: string): void => {
      memoryStore.set(name, value);
      persistAsync(name, value);
    },
    removeItem: (name: string): void => {
      memoryStore.delete(name);
      removeAsync(name);
    },
  },
};
