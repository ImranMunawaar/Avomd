import NetInfo from "@react-native-community/netinfo";

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";

import { getUniqueId } from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

import { getDatabaseInstance } from "../services/helper";
import * as Analytics from "../services/Analytics";
import store from "../store";
import { useNavigation } from "@react-navigation/native";

// reset data on signout
const resetAndNavigate = async () => {
  Analytics.track(Analytics.events.CLICK_SIGN_OUT);
  store.dispatch({ type: "RESET_ALL_DATA" });
  Analytics.reset();
  await AsyncStorage.removeItem("user");
  //this.props.closeModal();
  store.dispatch({
    type: "SET_IS_USER_LOGGED_IN",
    data: false,
  });
  const navigation = useNavigation();

  navigation.navigate("SignUp");
};

export const signOutUser = async () => {
  let isConnected = (await NetInfo.fetch()).isConnected;
  // if no network then reset data without signout
  if (!isConnected) resetAndNavigate();
  try {
    let user = firebase.auth().currentUser;
    if (user === null || !user.uid) resetAndNavigate();
    const db = getDatabaseInstance();
    const userUid = user.uid;
    //const dbUser = (await db.ref().child("users").child(userUid).get()).val();
    await db
      .ref("/users/" + userUid)
      .once("value")
      .then(async (snapshot) => {
        const dbUser = snapshot.val();
        if (dbUser?.deviceIds) {
          let deviceId = await getUniqueId();
          const basestr = "users/" + userUid + "/";
          let writer = db.ref(basestr + "deviceIds");
          dbUser.deviceIds = dbUser.deviceIds.filter(
            (deviceIdItem: any) => deviceId !== deviceIdItem
          );
          writer.set(dbUser.deviceIds);
        }
      });

    await firebase.auth().signOut();
    resetAndNavigate();
  } catch (error) {
    console.log("Error logout press", error);
    Toast.show({
      type: "customToast",
      text1: "No internet connection, try again later!",
    });
  }
};
