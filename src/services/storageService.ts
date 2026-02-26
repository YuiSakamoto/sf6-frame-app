import { createMMKV } from "react-native-mmkv";
import type { Result } from "@/types/result";
import { ok, err } from "@/types/result";

const storage = createMMKV({ id: "sf6-frame-data" });

export const storageService = {
  getString(key: string): Result<string> {
    const value = storage.getString(key);
    if (value === undefined) {
      return err(new Error(`Key not found: ${key}`));
    }
    return ok(value);
  },

  getObject<T>(key: string): Result<T> {
    const raw = storage.getString(key);
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
    storage.set(key, value);
  },

  setObject<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  },

  delete(key: string): void {
    storage.remove(key);
  },

  contains(key: string): boolean {
    return storage.contains(key);
  },

  zustandStorage: {
    getItem: (name: string): string | null => {
      return storage.getString(name) ?? null;
    },
    setItem: (name: string, value: string): void => {
      storage.set(name, value);
    },
    removeItem: (name: string): void => {
      storage.remove(name);
    },
  },
};
