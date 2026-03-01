import type { ExpoConfig } from "expo/config";

const appJson = require("./app.json") as { expo: ExpoConfig };

const config: ExpoConfig = {
  ...appJson.expo,
  updates: {
    url: "https://u.expo.dev/c6a934fe-7501-4858-9978-adde8e615415",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    ...appJson.expo.extra,
    googleAuth: {
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    },
  },
};

export default { expo: config };
