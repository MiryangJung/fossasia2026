import { useCallback, useEffect, useRef, useState } from "react";
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
  onLoadStart,
  onLoadEnd,
}: {
  item: PhotoAsset;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}) {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    MediaLibrary.getAssetInfoAsync(item.id).then((info) => {
      if (!cancelled && info.localUri) {
        setLocalUri(info.localUri);
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
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
    />
  );
}

export default function RnImageScreen() {
  const { photos, loadTimeMs } = useMediaLibraryPhotos();
  const tracker = useLoadTimeTracker();
  const loadStartTimes = useRef<Map<string, number>>(new Map());

  const renderItem = useCallback(
    (item: PhotoAsset) => {
      return (
        <View style={styles.itemContainer}>
          <ResolvedImage
            item={item}
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
