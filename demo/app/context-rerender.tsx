import { Image as ExpoImage, useImage } from "expo-image";
import { useCallback } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { GalleryGrid, ITEM_SIZE } from "../components/GalleryGrid";
import { MeasureOverlay } from "../components/MeasureOverlay";
import {
  useMediaLibraryPhotos,
  PhotoAsset,
} from "../hooks/useMediaLibraryPhotos";
import { Stack } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

function UseImageItem({ item }: { item: PhotoAsset }) {
  const imageSource = useImage(item.uri, {
    maxWidth: SCREEN_WIDTH,
    onError(error) {
      console.error("useImage error:", error.message);
    },
  });

  return (
    <ExpoImage
      source={imageSource}
      style={styles.image}
      transition={0}
      cachePolicy="disk"
      allowDownscaling
      recyclingKey={item.id}
    />
  );
}

export default function UseImageScreen() {
  const { photos, totalCount, loadMore } = useMediaLibraryPhotos();

  const renderItem = useCallback(
    (item: PhotoAsset) => {
      return (
        <View style={styles.itemContainer}>
          <UseImageItem item={item} />
        </View>
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: PhotoAsset) => item.id, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "useImage + FlashList" }} />
      <MeasureOverlay
        totalPhotos={totalCount}
        loadedCount={photos.length}
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
