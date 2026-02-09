import { registerRootComponent } from "expo";
import { AppRegistry, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

import App from "./src/App";
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
if (Platform.OS === "ios") AppRegistry.registerComponent("AvoMD", () => App);
else registerRootComponent(App);
