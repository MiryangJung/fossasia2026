# Gallery Benchmark Demo App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expo 갤러리 벤치마크 앱 — RN Image / expo-image / mipmaps 3가지 모드로 대량 이미지 리스트 성능 비교 측정

**Architecture:** Expo Router file-based routing. 홈 화면에서 3개 모드 선택 → 각 독립 화면에서 FlashList 4-column 그리드 + MeasureOverlay. 공통 hooks로 media library 로드, 측정 로직 공유. Mipmap은 ImageManipulator → FileSystem → MMKV 캐시 파이프라인.

**Tech Stack:** Expo SDK 53, expo-image, expo-media-library, expo-image-manipulator, expo-file-system, @shopify/flash-list, react-native-mmkv, TypeScript

**Target:** iPhone 17 Pro simulator (iOS 26), UDID: `5F505C88-A204-4A5D-8438-34DBA88D9F1B`

**Images:** 6 photos in `assets/photos/` (1.5~4.1MB, up to 4616x5910)

---

### Task 1: Expo 프로젝트 초기화

**Files:**
- Create: `demo/` (Expo project root)

**Step 1: Create Expo project**

```bash
cd /Users/miryang/Repositories/fossasia-gallery
npx create-expo-app@latest demo --template blank-typescript
```

**Step 2: Install dependencies**

```bash
cd /Users/miryang/Repositories/fossasia-gallery/demo
npx expo install expo-image expo-media-library expo-image-manipulator expo-file-system @shopify/flash-list react-native-mmkv
```

**Step 3: Install Expo Router**

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens react-native-gesture-handler
```

**Step 4: Configure app.config.ts for Expo Router**

Replace `demo/app.json` with `demo/app.config.ts`:

```typescript
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Gallery Benchmark",
  slug: "gallery-benchmark",
  version: "1.0.0",
  scheme: "gallery-benchmark",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.fossasia.gallerybenchmark",
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        "This app needs access to your photo library to display images in the gallery benchmark.",
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-media-library",
      {
        photosPermission:
          "This app needs access to your photo library to display images.",
        savePhotosPermission: false,
        isAccessMediaLocationEnabled: false,
      },
    ],
  ],
};

export default config;
```

**Step 5: Set entry point**

In `demo/package.json`, set `"main"` to `"expo-router/entry"`.

**Step 6: Verify project builds**

```bash
cd /Users/miryang/Repositories/fossasia-gallery/demo
npx expo prebuild --platform ios --clean
npx expo run:ios --device "iPhone 17 Pro"
```

Expected: App launches on simulator with blank screen.

**Step 7: Commit**

```bash
git add demo/
git commit -m "feat: initialize Expo project with dependencies"
```

---

### Task 2: 이미지 덤프 스크립트

**Files:**
- Create: `demo/scripts/populate-simulator.ts`

**Step 1: Write the populate script**

```typescript
#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { readdirSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const PHOTOS_DIR = resolve(__dirname, "../../assets/photos");
const TEMP_DIR = resolve(__dirname, "../.temp-photos");
const COPIES = parseInt(process.argv[2] || "300", 10);
const SIMULATOR_UDID = process.argv[3] || "5F505C88-A204-4A5D-8438-34DBA88D9F1B";

async function main() {
  // 1. Read original photos
  const originals = readdirSync(PHOTOS_DIR).filter((f) =>
    /\.(jpg|jpeg|png)$/i.test(f),
  );
  console.log(`Found ${originals.length} original images`);

  // 2. Create temp dir with copies
  if (existsSync(TEMP_DIR)) {
    execSync(`rm -rf "${TEMP_DIR}"`);
  }
  mkdirSync(TEMP_DIR, { recursive: true });

  const totalImages = originals.length * COPIES;
  console.log(`Creating ${totalImages} copies...`);

  const allPaths: string[] = [];
  for (let i = 0; i < COPIES; i++) {
    for (const original of originals) {
      const ext = original.split(".").pop();
      const name = `photo_${String(i * originals.length + originals.indexOf(original) + 1).padStart(5, "0")}.${ext}`;
      const dest = join(TEMP_DIR, name);
      copyFileSync(join(PHOTOS_DIR, original), dest);
      allPaths.push(dest);
    }
    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${COPIES} batches done`);
    }
  }

  console.log(`Created ${allPaths.length} images`);

  // 3. Push to simulator in batches of 20
  const BATCH_SIZE = 20;
  for (let i = 0; i < allPaths.length; i += BATCH_SIZE) {
    const batch = allPaths.slice(i, i + BATCH_SIZE);
    const cmd = `xcrun simctl addmedia ${SIMULATOR_UDID} ${batch.map((p) => `"${p}"`).join(" ")}`;
    execSync(cmd, { stdio: "pipe" });
    if ((i + BATCH_SIZE) % 200 === 0) {
      console.log(`  Pushed ${Math.min(i + BATCH_SIZE, allPaths.length)}/${allPaths.length} to simulator`);
    }
  }

  console.log(`Done! ${allPaths.length} images added to simulator ${SIMULATOR_UDID}`);

  // 4. Cleanup
  execSync(`rm -rf "${TEMP_DIR}"`);
  console.log("Temp files cleaned up");
}

main().catch(console.error);
```

**Step 2: Add tsx as dev dependency and script**

In `demo/package.json`, add:
```json
{
  "scripts": {
    "populate": "npx tsx scripts/populate-simulator.ts"
  },
  "devDependencies": {
    "tsx": "^4"
  }
}
```

**Step 3: Boot simulator and run**

```bash
xcrun simctl boot 5F505C88-A204-4A5D-8438-34DBA88D9F1B
cd /Users/miryang/Repositories/fossasia-gallery/demo
npm run populate -- 300
```

Expected: 1800 photos in simulator Photos app.

**Step 4: Commit**

```bash
git add demo/scripts/ demo/package.json
git commit -m "feat: add simulator image populate script"
```

---

### Task 3: useMediaLibraryPhotos hook

**Files:**
- Create: `demo/hooks/useMediaLibraryPhotos.ts`

**Step 1: Implement the hook**

```typescript
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
```

**Step 2: Verify builds**

```bash
cd /Users/miryang/Repositories/fossasia-gallery/demo
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add demo/hooks/
git commit -m "feat: add useMediaLibraryPhotos hook with batching"
```

---

### Task 4: useLoadTimeTracker hook

**Files:**
- Create: `demo/hooks/useLoadTimeTracker.ts`

**Step 1: Implement**

```typescript
import { useCallback, useRef, useState } from "react";

type LoadEntry = {
  startMs: number;
  endMs: number;
};

export function useLoadTimeTracker() {
  const entries = useRef<LoadEntry[]>([]);
  const [stats, setStats] = useState({ count: 0, avgMs: 0, totalMs: 0 });

  const onLoadStart = useCallback(() => {
    return performance.now();
  }, []);

  const onLoadEnd = useCallback((startMs: number) => {
    const endMs = performance.now();
    entries.current.push({ startMs, endMs });

    const count = entries.current.length;
    const totalMs = entries.current.reduce(
      (sum, e) => sum + (e.endMs - e.startMs),
      0,
    );
    setStats({ count, avgMs: totalMs / count, totalMs });
  }, []);

  const reset = useCallback(() => {
    entries.current = [];
    setStats({ count: 0, avgMs: 0, totalMs: 0 });
  }, []);

  return { stats, onLoadStart, onLoadEnd, reset };
}
```

**Step 2: Commit**

```bash
git add demo/hooks/useLoadTimeTracker.ts
git commit -m "feat: add useLoadTimeTracker hook"
```

---

### Task 5: MeasureOverlay 컴포넌트

**Files:**
- Create: `demo/components/MeasureOverlay.tsx`

**Step 1: Implement**

```typescript
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  totalPhotos: number;
  loadedCount: number;
  avgLoadTimeMs: number;
  mediaLoadTimeMs: number | null;
  onReset: () => void;
};

export function MeasureOverlay({
  totalPhotos,
  loadedCount,
  avgLoadTimeMs,
  mediaLoadTimeMs,
  onReset,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Images: {loadedCount} / {totalPhotos}
      </Text>
      <Text style={styles.text}>
        Avg load: {avgLoadTimeMs > 0 ? `${avgLoadTimeMs.toFixed(1)}ms` : "-"}
      </Text>
      <Text style={styles.text}>
        Media load:{" "}
        {mediaLoadTimeMs != null ? `${mediaLoadTimeMs.toFixed(0)}ms` : "..."}
      </Text>
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    padding: 10,
    zIndex: 100,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: "auto",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
```

**Step 2: Commit**

```bash
git add demo/components/MeasureOverlay.tsx
git commit -m "feat: add MeasureOverlay component"
```

---

### Task 6: GalleryGrid 컴포넌트

**Files:**
- Create: `demo/components/GalleryGrid.tsx`

**Step 1: Implement**

```typescript
import { FlashList } from "@shopify/flash-list";
import { ReactElement, useCallback } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const GAP = 2;
export const ITEM_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

type Props<T> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
};

export function GalleryGrid<T>({ data, renderItem, keyExtractor }: Props<T>) {
  const flashListRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem],
  );

  const ItemSeparator = useCallback(
    () => <View style={{ height: GAP }} />,
    [],
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={flashListRenderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        estimatedItemSize={ITEM_SIZE}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ paddingLeft: GAP }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Step 2: Commit**

```bash
git add demo/components/GalleryGrid.tsx
git commit -m "feat: add GalleryGrid component with FlashList 4-column grid"
```

---

### Task 7: 홈 화면 + Layout

**Files:**
- Create: `demo/app/_layout.tsx`
- Create: `demo/app/index.tsx`

**Step 1: Implement layout**

```typescript
// demo/app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
      }}
    />
  );
}
```

**Step 2: Implement home screen**

```typescript
// demo/app/index.tsx
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MODES = [
  {
    title: "RN Image + FlashList",
    subtitle: "Baseline — React Native built-in Image",
    route: "/rn-image" as const,
    color: "#e74c3c",
  },
  {
    title: "Expo Image + FlashList",
    subtitle: "expo-image component",
    route: "/expo-image" as const,
    color: "#3498db",
  },
  {
    title: "Mipmaps + FlashList",
    subtitle: "Downscaled thumbnails via ImageManipulator",
    route: "/mipmaps" as const,
    color: "#2ecc71",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.title}>Gallery Benchmark</Text>
      <Text style={styles.subtitle}>Select a mode to compare performance</Text>
      {MODES.map((mode) => (
        <TouchableOpacity
          key={mode.route}
          style={[styles.card, { borderLeftColor: mode.color }]}
          onPress={() => router.push(mode.route)}
        >
          <Text style={styles.cardTitle}>{mode.title}</Text>
          <Text style={styles.cardSubtitle}>{mode.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#aaa",
  },
});
```

**Step 3: Verify on simulator**

```bash
npx expo run:ios --device "iPhone 17 Pro"
```

Expected: Home screen with 3 cards.

**Step 4: Commit**

```bash
git add demo/app/
git commit -m "feat: add home screen with mode selection"
```

---

### Task 8: Mode 1 — RN Image + FlashList

**Files:**
- Create: `demo/app/rn-image.tsx`

**Step 1: Implement**

```typescript
import { useCallback, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import { GalleryGrid, ITEM_SIZE } from "../components/GalleryGrid";
import { MeasureOverlay } from "../components/MeasureOverlay";
import { useMediaLibraryPhotos, PhotoAsset } from "../hooks/useMediaLibraryPhotos";
import { useLoadTimeTracker } from "../hooks/useLoadTimeTracker";
import { Stack } from "expo-router";

export default function RnImageScreen() {
  const { photos, loadTimeMs } = useMediaLibraryPhotos();
  const tracker = useLoadTimeTracker();
  const loadStartTimes = useRef<Map<string, number>>(new Map());

  const renderItem = useCallback(
    (item: PhotoAsset) => {
      return (
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: item.uri }}
            style={styles.image}
            onLoadStart={() => {
              loadStartTimes.current.set(item.id, performance.now());
            }}
            onLoadEnd={() => {
              const startMs = loadStartTimes.current.get(item.id);
              if (startMs) {
                tracker.onLoadEnd(startMs);
                loadStartTimes.current.delete(item.id);
              }
            }}
          />
        </View>
      );
    },
    [tracker],
  );

  const keyExtractor = useCallback((item: PhotoAsset) => item.id, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "RN Image + FlashList" }} />
      <MeasureOverlay
        totalPhotos={photos.length}
        loadedCount={tracker.stats.count}
        avgLoadTimeMs={tracker.stats.avgMs}
        mediaLoadTimeMs={loadTimeMs}
        onReset={tracker.reset}
      />
      <GalleryGrid
        data={photos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  itemContainer: { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
  image: { flex: 1, backgroundColor: "#1a1a1a" },
});
```

**Step 2: Test on simulator**

Open app → tap "RN Image + FlashList" → verify gallery loads with overlay.

**Step 3: Commit**

```bash
git add demo/app/rn-image.tsx
git commit -m "feat: add Mode 1 — RN Image + FlashList screen"
```

---

### Task 9: Mode 2 — expo-image + FlashList

**Files:**
- Create: `demo/app/expo-image.tsx`

**Step 1: Implement**

```typescript
import { Image as ExpoImage } from "expo-image";
import { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { GalleryGrid, ITEM_SIZE } from "../components/GalleryGrid";
import { MeasureOverlay } from "../components/MeasureOverlay";
import { useMediaLibraryPhotos, PhotoAsset } from "../hooks/useMediaLibraryPhotos";
import { useLoadTimeTracker } from "../hooks/useLoadTimeTracker";
import { Stack } from "expo-router";

export default function ExpoImageScreen() {
  const { photos, loadTimeMs } = useMediaLibraryPhotos();
  const tracker = useLoadTimeTracker();
  const loadStartTimes = useRef<Map<string, number>>(new Map());

  const renderItem = useCallback(
    (item: PhotoAsset) => {
      return (
        <View style={styles.itemContainer}>
          <ExpoImage
            source={{ uri: item.uri }}
            style={styles.image}
            recyclingKey={item.id}
            transition={0}
            onLoadStart={() => {
              loadStartTimes.current.set(item.id, performance.now());
            }}
            onLoadEnd={() => {
              const startMs = loadStartTimes.current.get(item.id);
              if (startMs) {
                tracker.onLoadEnd(startMs);
                loadStartTimes.current.delete(item.id);
              }
            }}
          />
        </View>
      );
    },
    [tracker],
  );

  const keyExtractor = useCallback((item: PhotoAsset) => item.id, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Expo Image + FlashList" }} />
      <MeasureOverlay
        totalPhotos={photos.length}
        loadedCount={tracker.stats.count}
        avgLoadTimeMs={tracker.stats.avgMs}
        mediaLoadTimeMs={loadTimeMs}
        onReset={tracker.reset}
      />
      <GalleryGrid
        data={photos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  itemContainer: { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
  image: { flex: 1, backgroundColor: "#1a1a1a" },
});
```

**Step 2: Test on simulator**

**Step 3: Commit**

```bash
git add demo/app/expo-image.tsx
git commit -m "feat: add Mode 2 — expo-image + FlashList screen"
```

---

### Task 10: useMipmaps hook

**Files:**
- Create: `demo/hooks/useMipmaps.ts`

**Step 1: Implement**

```typescript
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { MMKV } from "react-native-mmkv";
import { PhotoAsset } from "./useMediaLibraryPhotos";

const NUM_COLUMNS = 4;
const SCREEN_WIDTH = Dimensions.get("window").width;
const MIPMAP_WIDTH = Math.ceil(SCREEN_WIDTH / NUM_COLUMNS);
const MIPMAP_DIR = `${FileSystem.documentDirectory}mipmaps/`;

const storage = new MMKV({ id: "mipmap-cache" });

export type MipmapPhoto = {
  originalUri: string;
  mipmapUri: string;
  id: string;
};

function getCacheKey(id: string): string {
  return `mipmap_${MIPMAP_WIDTH}_${id}`;
}

async function ensureMipmapDir() {
  const info = await FileSystem.getInfoAsync(MIPMAP_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MIPMAP_DIR, { intermediates: true });
  }
}

async function generateMipmap(photo: PhotoAsset): Promise<MipmapPhoto> {
  // Check MMKV cache first
  const cacheKey = getCacheKey(photo.id);
  const cached = storage.getString(cacheKey);
  if (cached) {
    const fileInfo = await FileSystem.getInfoAsync(cached);
    if (fileInfo.exists) {
      return { originalUri: photo.uri, mipmapUri: cached, id: photo.id };
    }
  }

  // Generate mipmap
  const context = ImageManipulator.manipulate(photo.uri);
  context.resize({ width: MIPMAP_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    format: ImageManipulator.SaveFormat.JPEG,
    compress: 0.8,
  });
  image.release();

  // Move to persistent location
  const destUri = `${MIPMAP_DIR}${photo.id}.jpg`;
  await FileSystem.moveAsync({ from: result.uri, to: destUri });

  // Cache in MMKV
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
    await ensureMipmapDir();

    setProgress({ done: 0, total: photos.length });
    const results: MipmapPhoto[] = [];

    // Process in batches of 10 to avoid overwhelming
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
```

**Step 2: Verify builds**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add demo/hooks/useMipmaps.ts
git commit -m "feat: add useMipmaps hook with ImageManipulator + MMKV cache"
```

---

### Task 11: Mode 3 — Mipmaps + FlashList

**Files:**
- Create: `demo/app/mipmaps.tsx`

**Step 1: Implement**

```typescript
import { Image as ExpoImage } from "expo-image";
import { useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GalleryGrid, ITEM_SIZE } from "../components/GalleryGrid";
import { MeasureOverlay } from "../components/MeasureOverlay";
import { useMediaLibraryPhotos } from "../hooks/useMediaLibraryPhotos";
import { useMipmaps, MipmapPhoto } from "../hooks/useMipmaps";
import { useLoadTimeTracker } from "../hooks/useLoadTimeTracker";
import { Stack } from "expo-router";

export default function MipmapsScreen() {
  const { photos, loadTimeMs } = useMediaLibraryPhotos();
  const { mipmaps, progress, generationTimeMs } = useMipmaps(photos);
  const tracker = useLoadTimeTracker();
  const loadStartTimes = useRef<Map<string, number>>(new Map());

  const renderItem = useCallback(
    (item: MipmapPhoto) => {
      return (
        <View style={styles.itemContainer}>
          <ExpoImage
            source={{ uri: item.mipmapUri }}
            style={styles.image}
            recyclingKey={item.id}
            transition={0}
            onLoadStart={() => {
              loadStartTimes.current.set(item.id, performance.now());
            }}
            onLoadEnd={() => {
              const startMs = loadStartTimes.current.get(item.id);
              if (startMs) {
                tracker.onLoadEnd(startMs);
                loadStartTimes.current.delete(item.id);
              }
            }}
          />
        </View>
      );
    },
    [tracker],
  );

  const keyExtractor = useCallback((item: MipmapPhoto) => item.id, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Mipmaps + FlashList" }} />
      <MeasureOverlay
        totalPhotos={photos.length}
        loadedCount={tracker.stats.count}
        avgLoadTimeMs={tracker.stats.avgMs}
        mediaLoadTimeMs={loadTimeMs}
        onReset={tracker.reset}
      />
      {progress.done < progress.total && (
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>
            Generating mipmaps: {progress.done}/{progress.total}
            {generationTimeMs != null &&
              ` (${(generationTimeMs / 1000).toFixed(1)}s)`}
          </Text>
        </View>
      )}
      <GalleryGrid
        data={mipmaps}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  itemContainer: { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
  image: { flex: 1, backgroundColor: "#1a1a1a" },
  progressBar: {
    backgroundColor: "#2ecc71",
    padding: 8,
    alignItems: "center",
  },
  progressText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
});
```

**Step 2: Test all 3 modes on simulator**

**Step 3: Commit**

```bash
git add demo/app/mipmaps.tsx
git commit -m "feat: add Mode 3 — Mipmaps + FlashList screen"
```

---

### Task 12: 최종 빌드 검증 + .gitignore

**Files:**
- Create: `demo/.gitignore`

**Step 1: Add .gitignore**

```
node_modules/
.expo/
ios/
android/
.temp-photos/
```

**Step 2: Full build and test**

```bash
cd /Users/miryang/Repositories/fossasia-gallery/demo
npx expo prebuild --platform ios --clean
npx expo run:ios --device "iPhone 17 Pro"
```

Test all 3 modes, verify MeasureOverlay shows data.

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete gallery benchmark demo app"
```

---

Plan complete and saved. Two execution options:

**1. Subagent-Driven (this session)** - 태스크별로 서브에이전트 디스패치, 사이사이 리뷰, 빠른 반복

**2. Parallel Session (separate)** - 새 세션에서 executing-plans로 배치 실행

어떤 방식으로 할까요?