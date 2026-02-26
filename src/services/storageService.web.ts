import type { Result } from "@/types/result";
import { ok, err } from "@/types/result";

export const storageService = {
  getString(key: string): Result<string> {
    const value = localStorage.getItem(key);
    if (value === null) {
      return err(new Error(`Key not found: ${key}`));
    }
    return ok(value);
  },

  getObject<T>(key: string): Result<T> {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return err(new Error(`Key not found: ${key}`));
    }
    try {
      return ok(JSON.parse(raw) as T);
    } catch {
      return err(new Error(`Failed to parse JSON for key: ${key}`));
    }
  },

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  },

  setObject<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  delete(key: string): void {
    localStorage.removeItem(key);
  },

  contains(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },

  zustandStorage: {
    getItem: (name: string): string | null => {
      return localStorage.getItem(name);
    },
    setItem: (name: string, value: string): void => {
      localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
      localStorage.removeItem(name);
    },
  },
};
