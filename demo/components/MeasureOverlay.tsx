import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  totalPhotos: number;
  loadedCount: number;
  avgLoadTimeMs?: number;
  onReset?: () => void;
};

export function MeasureOverlay({
  totalPhotos,
  loadedCount,
  avgLoadTimeMs,
  onReset,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Images: {loadedCount} / {totalPhotos}
      </Text>
      {avgLoadTimeMs != null && (
        <Text style={styles.text}>
          Avg load: {avgLoadTimeMs > 0 ? `${avgLoadTimeMs.toFixed(1)}ms` : "-"}
        </Text>
      )}
      {onReset && (
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={onReset}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}
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
    gap: 4,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
