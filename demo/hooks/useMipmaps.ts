import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Paths, Directory, File } from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { PhotoAsset } from "./useMediaLibraryPhotos";

const NUM_COLUMNS = 4;
const SCREEN_WIDTH = Dimensions.get("window").width;
const MIPMAP_WIDTH = Math.ceil(SCREEN_WIDTH / NUM_COLUMNS);

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

async function generateMipmap(photo: PhotoAsset): Promise<MipmapPhoto> {
  const cacheKey = getCacheKey(photo.id);
  const cached = storage.getString(cacheKey);
  if (cached) {
    const cachedFile = new File(cached);
    if (cachedFile.exists) {
      return { originalUri: photo.uri, mipmapUri: cached, id: photo.id };
    }
  }

  const context = ImageManipulator.manipulate(photo.uri);
  context.resize({ width: MIPMAP_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.8,
  });
  image.release();

  const destFile = new File(mipmapDir, `${photo.id}.jpg`);
  const resultFile = new File(result.uri);
  resultFile.move(destFile);

  const destUri = destFile.uri;
  storage.set(cacheKey, destUri);

  return { originalUri: photo.uri, mipmapUri: destUri, id: photo.id };
}

export function useMipmaps(photos: PhotoAsset[]) {
  const [mipmaps, setMipmaps] = useState<MipmapPhoto[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [generationTimeMs, setGenerationTimeMs] = useState<number | null>(null);
  const isGenerating = useRef(false);

  const generate = useCallback(async () => {
    if (isGenerating.current || photos.length === 0) return;
    isGenerating.current = true;

    const start = performance.now();
    ensureMipmapDir();

    setProgress({ done: 0, total: photos.length });
    const results: MipmapPhoto[] = [];

    const BATCH = 10;
    for (let i = 0; i < photos.length; i += BATCH) {
      const batch = photos.slice(i, i + BATCH);
      const batchResults = await Promise.all(batch.map(generateMipmap));
      results.push(...batchResults);
      setMipmaps([...results]);
      setProgress({ done: results.length, total: photos.length });
    }

    setGenerationTimeMs(performance.now() - start);
    isGenerating.current = false;
  }, [photos]);

  useEffect(() => {
    if (photos.length > 0) {
      generate();
    }
  }, [generate, photos.length]);

  return { mipmaps, progress, generationTimeMs };
}
