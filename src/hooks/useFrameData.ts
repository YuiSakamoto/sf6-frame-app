import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import type { CharacterFrameData } from "@/types/frame-data";

export function useFrameData(slug: string | null) {
  const loadFrameData = useDataStore((s) => s.loadFrameData);
  const cachedData = useDataStore(
    (s) => (slug ? s.frameDataCache[slug] : undefined) ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || cachedData) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loadFrameData(slug).then((result) => {
      if (cancelled) return;
      if (!result) {
        setError("Failed to load frame data");
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, cachedData, loadFrameData]);

  return {
    data: cachedData as CharacterFrameData | null,
    isLoading,
    error,
  };
}
