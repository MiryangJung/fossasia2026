import { Image as ExpoImage } from "expo-image";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GalleryGrid, ITEM_SIZE } from "../components/GalleryGrid";
import { MeasureOverlay } from "../components/MeasureOverlay";
import { useMediaLibraryPhotos } from "../hooks/useMediaLibraryPhotos";
import { useMipmaps, MipmapPhoto } from "../hooks/useMipmaps";
import { useLoadTimeTracker } from "../hooks/useLoadTimeTracker";
import { Stack } from "expo-router";

function MipmapItem({
  item,
  onLoaded,
}: {
  item: MipmapPhoto;
  onLoaded: (startMs: number) => void;
}) {
  const mountTime = useRef(performance.now());

  useEffect(() => {
    mountTime.current = performance.now();
  }, [item.id]);

  return (
    <ExpoImage
      source={{ uri: item.mipmapUri }}
      style={styles.image}
      recyclingKey={item.id}
      transition={0}
      onLoad={() => {
        onLoaded(mountTime.current);
      }}
    />
  );
}

export default function MipmapsScreen() {
  const { photos, totalCount } = useMediaLibraryPhotos({ loadAll: true });
  const { mipmaps, progress, generationTimeMs } = useMipmaps(photos);
  const tracker = useLoadTimeTracker();

  const renderItem = useCallback(
    (item: MipmapPhoto) => {
      return (
        <View style={styles.itemContainer}>
          <MipmapItem
            item={item}
            onLoaded={(startMs) => {
              tracker.onLoadEnd(startMs);
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
        totalPhotos={totalCount}
        loadedCount={tracker.stats.count}
        avgLoadTimeMs={tracker.stats.avgMs}
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
