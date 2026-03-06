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
