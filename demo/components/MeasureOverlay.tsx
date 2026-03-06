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
