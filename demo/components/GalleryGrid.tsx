import { FlashList } from "@shopify/flash-list";
import { ReactElement, useCallback } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const GAP = 2;
export const ITEM_SIZE =
  (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

type Props<T> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
  onEndReached?: () => void;
};

export function GalleryGrid<T>({ data, renderItem, keyExtractor, onEndReached }: Props<T>) {
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
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ paddingLeft: GAP }}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ITEM_SIZE}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
