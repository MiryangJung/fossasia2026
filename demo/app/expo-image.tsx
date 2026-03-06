import { Image as ExpoImage } from "expo-image";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { GalleryGrid, ITEM_SIZE } from "../components/GalleryGrid";
import { MeasureOverlay } from "../components/MeasureOverlay";
import {
  useMediaLibraryPhotos,
  PhotoAsset,
} from "../hooks/useMediaLibraryPhotos";
import { useLoadTimeTracker } from "../hooks/useLoadTimeTracker";
import { Stack } from "expo-router";

function ExpoImageItem({
  item,
  onLoaded,
}: {
  item: PhotoAsset;
  onLoaded: (startMs: number) => void;
}) {
  const mountTime = useRef(performance.now());

  useEffect(() => {
    mountTime.current = performance.now();
  }, [item.id]);

  return (
    <ExpoImage
      source={{ uri: item.uri }}
      style={styles.image}
      recyclingKey={item.id}
      transition={0}
      onLoad={() => {
        onLoaded(mountTime.current);
      }}
    />
  );
}

export default function ExpoImageScreen() {
  const { photos, totalCount, loadMore } = useMediaLibraryPhotos();
  const tracker = useLoadTimeTracker();

  const renderItem = useCallback(
    (item: PhotoAsset) => {
      return (
        <View style={styles.itemContainer}>
          <ExpoImageItem
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

  const keyExtractor = useCallback((item: PhotoAsset) => item.id, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Expo Image + FlashList" }} />
      <MeasureOverlay
        totalPhotos={totalCount}
        loadedCount={tracker.stats.count}
        avgLoadTimeMs={tracker.stats.avgMs}
        onReset={tracker.reset}
      />
      <GalleryGrid
        data={photos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={loadMore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  itemContainer: { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
  image: { flex: 1, backgroundColor: "#1a1a1a" },
});
