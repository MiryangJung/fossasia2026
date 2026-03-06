import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const BATCH_SIZE = Platform.select({ ios: 50, default: 30 });

export type PhotoAsset = {
  uri: string;
  id: string;
};

export type LoadingState = "idle" | "loading" | "completed" | "error";

export function useMediaLibraryPhotos() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [loadTimeMs, setLoadTimeMs] = useState<number | null>(null);
  const didRun = useRef(false);

  const loadPhotos = useCallback(async () => {
    const start = performance.now();
    setLoadingState("loading");
    setPhotos([]);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setLoadingState("error");
        return;
      }

      let hasNextPage = true;
      let endCursor: string | undefined;
      const allPhotos: PhotoAsset[] = [];

      while (hasNextPage) {
        const batch = await MediaLibrary.getAssetsAsync({
          first: BATCH_SIZE,
          after: endCursor,
          mediaType: "photo",
          sortBy: [["modificationTime", false]],
        });

        const newAssets = batch.assets.map((a) => ({ uri: a.uri, id: a.id }));
        allPhotos.push(...newAssets);
        setPhotos((prev) => [...prev, ...newAssets]);

        hasNextPage = batch.hasNextPage;
        endCursor = batch.endCursor;
      }

      setLoadTimeMs(performance.now() - start);
      setLoadingState("completed");
    } catch (e) {
      console.error("Failed to load photos:", e);
      setLoadingState("error");
    }
  }, []);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    loadPhotos();
  }, [loadPhotos]);

  return { photos, loadingState, loadTimeMs, reload: loadPhotos };
}
