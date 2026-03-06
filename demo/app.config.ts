import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Gallery Benchmark",
  slug: "gallery-benchmark",
  version: "1.0.0",
  scheme: "gallery-benchmark",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.fossasia.gallerybenchmark",
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        "This app needs access to your photo library to display images in the gallery benchmark.",
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-media-library",
      {
        photosPermission:
          "This app needs access to your photo library to display images.",
        savePhotosPermission: false,
        isAccessMediaLocationEnabled: false,
      },
    ],
  ],
};

export default config;
