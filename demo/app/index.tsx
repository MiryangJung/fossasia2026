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
