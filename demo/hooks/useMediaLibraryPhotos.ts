import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const BATCH_SIZE = Platform.select({ ios: 50, default: 30 });

export type PhotoAsset = {
  uri: string;
  id: string;
};

export type LoadingState = "idle" | "loading" | "completed" | "error";

export function useMediaLibraryPhotos(options?: { loadAll?: boolean }) {
  const loadAll = options?.loadAll ?? false;
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [loadTimeMs, setLoadTimeMs] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const didRun = useRef(false);
  const cursorRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);
  const startTimeRef = useRef(0);

  const loadNextBatch = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setLoadingState("loading");

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setLoadingState("error");
        isLoadingRef.current = false;
        return;
      }

      if (startTimeRef.current === 0) {
        startTimeRef.current = performance.now();
        const countResult = await MediaLibrary.getAssetsAsync({
          first: 0,
          mediaType: "photo",
        });
        setTotalCount(countResult.totalCount);
      }

      const batch = await MediaLibrary.getAssetsAsync({
        first: BATCH_SIZE,
        after: cursorRef.current,
        mediaType: "photo",
        sortBy: [["modificationTime", false]],
      });

      const newAssets = batch.assets.map((a) => ({ uri: a.uri, id: a.id }));
      setPhotos((prev) => [...prev, ...newAssets]);

      hasMoreRef.current = batch.hasNextPage;
      cursorRef.current = batch.endCursor;

      setLoadTimeMs(performance.now() - startTimeRef.current);

      if (!batch.hasNextPage) {
        setLoadingState("completed");
      } else if (loadAll) {
        isLoadingRef.current = false;
        setLoadingState("idle");
        loadNextBatch();
        return;
      } else {
        setLoadingState("idle");
      }
    } catch (e) {
      console.error("Failed to load photos:", e);
      setLoadingState("error");
    } finally {
      isLoadingRef.current = false;
    }
  }, [loadAll]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    loadNextBatch();
  }, [loadNextBatch]);

  return { photos, loadingState, loadTimeMs, totalCount, loadMore: loadNextBatch };
}
