import { useEffect } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { initStorage } from "@/services/storageService";

/**
 * アプリ起動時にデータを初期化し、バックグラウンドで同期を試みる
 */
export function useDataSync() {
  const initialize = useDataStore((s) => s.initialize);
  const syncFromRemote = useDataStore((s) => s.syncFromRemote);
  const isSyncing = useDataStore((s) => s.isSyncing);
  const isLoading = useDataStore((s) => s.isLoading);
  const version = useDataStore((s) => s.version);

  useEffect(() => {
    initStorage().then(() => {
      initialize();
      syncFromRemote();
    });
  }, [initialize, syncFromRemote]);

  return { isSyncing, isLoading, version };
}
