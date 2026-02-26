import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import type { CharacterFrameData } from "@/types/frame-data";

export function useFrameData(slug: string | null) {
  const loadFrameData = useDataStore((s) => s.loadFrameData);
  const cachedData = useDataStore(
    (s) => (slug ? s.frameDataCache[slug] : undefined) ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || cachedData) return;

    loadFrameData(slug).then((result) => {
      if (!result) {
        setError("Failed to load frame data");
      }
    });
  }, [slug, cachedData, loadFrameData]);

  // cachedData が存在すればロード完了、slug がなければ待機不要
  const isLoading = slug !== null && cachedData === null && error === null;

  return {
    data: cachedData as CharacterFrameData | null,
    isLoading,
    error,
  };
}
