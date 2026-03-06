import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Paths, Directory, File } from "expo-file-system/next";
import { useEffect, useRef, useState } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { PhotoAsset } from "./useMediaLibraryPhotos";

const NUM_COLUMNS = 4;
const SCREEN_WIDTH = Dimensions.get("window").width;
const LAYOUT_WIDTH = SCREEN_WIDTH / NUM_COLUMNS;
const MIPMAP_WIDTH = PixelRatio.getPixelSizeForLayoutSize(LAYOUT_WIDTH);

const mipmapDir = new Directory(Paths.document, "mipmaps/");

const storage = createMMKV({ id: "mipmap-cache" });

export type MipmapPhoto = {
  originalUri: string;
  mipmapUri: string;
  id: string;
};

function getCacheKey(id: string): string {
  return `mipmap_${MIPMAP_WIDTH}_${id}`;
}

function ensureMipmapDir() {
  if (!mipmapDir.exists) {
    mipmapDir.create();
  }
}

function tryGetCached(photo: PhotoAsset): MipmapPhoto | null {
  const cacheKey = getCacheKey(photo.id);
  const cached = storage.getString(cacheKey);
  if (cached) {
    const cachedFile = new File(cached);
    if (cachedFile.exists) {
      return { originalUri: photo.uri, mipmapUri: cached, id: photo.id };
    }
  }
  return null;
}

async function generateMipmap(photo: PhotoAsset): Promise<MipmapPhoto> {
  const existing = tryGetCached(photo);
  if (existing) return existing;

  const context = ImageManipulator.manipulate(photo.uri);
  context.resize({ width: MIPMAP_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.9,
  });
  image.release();

  const safeId = photo.id.replace(/\//g, "_");
  const destFile = new File(mipmapDir, `${safeId}.jpg`);
  if (destFile.exists) {
    destFile.delete();
  }
  const resultFile = new File(result.uri);
  resultFile.move(destFile);

  const destUri = destFile.uri;
  storage.set(getCacheKey(photo.id), destUri);

  return { originalUri: photo.uri, mipmapUri: destUri, id: photo.id };
}

export function useMipmaps(photos: PhotoAsset[]) {
  const [mipmaps, setMipmaps] = useState<MipmapPhoto[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [generationTimeMs, setGenerationTimeMs] = useState<number | null>(null);
  const processedRef = useRef(new Set<string>());
  const isGenerating = useRef(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (photos.length === 0) return;

    // Check which photos are already cached vs need generation
    const cachedResults: MipmapPhoto[] = [];
    const needGeneration: PhotoAsset[] = [];

    for (const p of photos) {
      if (processedRef.current.has(p.id)) continue;
      processedRef.current.add(p.id);

      const cached = tryGetCached(p);
      if (cached) {
        cachedResults.push(cached);
      } else {
        needGeneration.push(p);
      }
    }

    // Immediately add cached mipmaps
    if (cachedResults.length > 0) {
      setMipmaps((prev) => [...prev, ...cachedResults]);
      setProgress((prev) => ({
        done: prev.done + cachedResults.length,
        total: processedRef.current.size,
      }));
    }

    if (needGeneration.length === 0) return;

    async function processNewPhotos() {
      while (isGenerating.current) {
        await new Promise((r) => setTimeout(r, 50));
      }
      isGenerating.current = true;

      if (startTimeRef.current === 0) {
        startTimeRef.current = performance.now();
        ensureMipmapDir();
      }

      setProgress((prev) => ({ ...prev, total: processedRef.current.size }));

      const BATCH = 10;
      for (let i = 0; i < needGeneration.length; i += BATCH) {
        const batch = needGeneration.slice(i, i + BATCH);
        const batchResults = await Promise.all(batch.map(generateMipmap));
        setMipmaps((prev) => [...prev, ...batchResults]);
        setProgress((prev) => ({
          done: prev.done + batchResults.length,
          total: processedRef.current.size,
        }));
      }

      setGenerationTimeMs(performance.now() - startTimeRef.current);
      isGenerating.current = false;
    }

    processNewPhotos();
  }, [photos]);

  return { mipmaps, progress, generationTimeMs };
}
