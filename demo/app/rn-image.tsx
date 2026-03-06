import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { GalleryGrid, ITEM_SIZE } from "../components/GalleryGrid";
import { MeasureOverlay } from "../components/MeasureOverlay";
import {
  useMediaLibraryPhotos,
  PhotoAsset,
} from "../hooks/useMediaLibraryPhotos";
import { useLoadTimeTracker } from "../hooks/useLoadTimeTracker";
import { Stack } from "expo-router";

function ResolvedImage({
  item,
  onResolved,
}: {
  item: PhotoAsset;
  onResolved: (startMs: number) => void;
}) {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    setLocalUri(null);
    let cancelled = false;
    const startMs = performance.now();
    MediaLibrary.getAssetInfoAsync(item.id).then((info) => {
      if (!cancelled && info.localUri) {
        setLocalUri(info.localUri);
        onResolved(startMs);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  if (!localUri) {
    return <View style={styles.image} />;
  }

  return (
    <Image
      source={{ uri: localUri }}
      style={styles.image}
    />
  );
}

export default function RnImageScreen() {
  const { photos, totalCount, loadMore } = useMediaLibraryPhotos();
  const tracker = useLoadTimeTracker();

  const renderItem = useCallback(
    (item: PhotoAsset) => {
      return (
        <View style={styles.itemContainer}>
          <ResolvedImage
            item={item}
            onResolved={(startMs) => {
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
      <Stack.Screen options={{ title: "RN Image + FlashList" }} />
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
