import { getDatabaseInstance } from "./helper";
import crashlytics from "@react-native-firebase/crashlytics";
import releaseConfigurations from "../../releaseConfigurations.json";
export const FALLBACK_DEFAULT_CHANNELS =
  releaseConfigurations.targets[releaseConfigurations.activeReleaseTarget]
    .defaultInitialChannels;

export async function getDefaultChannels(): Promise<string[]> {
  return getDatabaseInstance()
    .ref(`config/defaultChannels`)
    .once("value")
    .then((defaultChannels) => {
      if (defaultChannels.exists) return defaultChannels.val();
      return FALLBACK_DEFAULT_CHANNELS;
    })
    .catch((err) => {
      crashlytics().recordError(err);
      console.log("FIREBASE ERROR", err);
      return FALLBACK_DEFAULT_CHANNELS;
    });
}
