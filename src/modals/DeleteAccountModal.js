import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { fontFamily } from "../constants/strings";
import { getDatabaseInstance, getHeight, getWidth } from "../services/helper";
import Modal from "react-native-modal";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";
import * as Analytics from "../services/Analytics";
import store from "../store";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Env from "../constants/Env";
import Toast from "react-native-toast-message";
import { isValid } from "../models/modules";
import { getUniqueId } from "react-native-device-info";

export function DeleteAccountModal(props) {
  const [passwordFieldVal, setPasswordFieldVal] = useState("");
  const [borderEnbl, setBorderEnbl] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  let appleIdentityToken = "";

  useEffect(() => {
    const getToken = async () => {
      let userInfo = JSON.parse(await AsyncStorage.getItem("user"));
      if (userInfo.gid) {
        let secureDataInfo = await SecureStore.getItemAsync(userInfo.gid);
        if (secureDataInfo) {
          secureDataInfo = JSON.parse(secureDataInfo);
          appleIdentityToken = secureDataInfo.appleIdentityToken;
        }
      }
    };
    getToken();
  }, []);

  // reset data on signout
  resetAndNavigate = async () => {
    Analytics.track(Analytics.events.CLICK_SIGN_OUT);
    store.dispatch({ type: "RESET_ALL_DATA" });
    Analytics.reset();
    await AsyncStorage.removeItem("user");
    //props.closeModal();
    store.dispatch({
      type: "SET_IS_USER_LOGGED_IN",
      data: false,
    });
  };

  signOutUser = async () => {
    let isConnected = (await NetInfo.fetch()).isConnected;
    // if no network then reset data without signout
    if (!isConnected) this.resetAndNavigate();
    try {
      let user = firebase.auth().currentUser;
      if (user === null || !user.uid) this.resetAndNavigate();
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
              (deviceIdItem) => deviceId !== deviceIdItem
            );
            writer.set(dbUser.deviceIds);
          }
        });

      await firebase.auth().signOut();
      this.resetAndNavigate();
    } catch (error) {
      console.log("Error logout press", error);
      Toast.show({
        type: "customToast",
        text1: "No internet connection, try again later!",
      });
    }
  };

  const revokeIosToken = async () => {
    if (!isValid(appleIdentityToken)) {
      return;
    }
    const requestOptions = {
      method: "POST",
      headers: {
        // Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        client_id: Env.CLIENT_ID,
        client_secret: Env.CLIENT_SECRET,
        token_type_hint: "access_token",
        token: appleIdentityToken,
      }),
    };

    try {
      await fetch("https://appleid.apple.com/auth/revoke", requestOptions).then(
        (response) => {
          console.log("response status is===", response.status);
          response.json().then((data) => {
            console.log("success data===", data);
          });
        }
      );
    } catch (error) {
      console.error("error data===", error);
    }
  };
  // verify password field need to add in the helper for reusing on changepassword filed
  verifyPassword = async () => {
    let currentPassword = passwordFieldVal;
    let user = firebase.auth().currentUser;
    let cred = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    console.log("cred===", cred);
    try {
      await user
        .reauthenticateWithCredential(cred)
        .then((data) => {
          console.log("data===", data);
          setBorderEnbl(true);
          setPwdError(false);
        })
        .catch((err) => {
          console.log("err===", err);
          setBorderEnbl(true);
          setPwdError(true);
        });
    } catch (error) {
      console.log("error===", error);
      setBorderEnbl(true);
      setPwdError(true);
    }
  };
  // delete current user info
  deleteCurrentUserInfo = async () => {
    let currenUser = firebase.auth().currentUser;
    // delete the current user
    await currenUser
      .delete()
      .then(() => {
        //track(user.email, 'user delete from admin spreadsheet', user);
        Analytics.track(Analytics.events.DELETE_ACCOUNT);

        this.signOutUser();

        revokeIosToken();

        close("Account deletion confirmed!");
      })
      .catch((err) => {
        console.log("delete account===", err);
        Toast.show({
          type: "customErrorToast",
          text1: "Session Expired. Please login and try again!",
        });
      });

    //getDatabaseInstance().
  };
  const { isVisible, close, userEmail } = props;
  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={close}
      swipeDirection={["down"]}
      propagateSwipe={true}
      style={styles.modal}
      onBackdropPress={close}
    >
      <View style={styles.mainView}>
        <Text style={styles.headingStyle}>Permanently delete account?</Text>
        <Text style={styles.simpleText}>
          Enter password to confirm deletion of all personal data.{"\n\n"}
          {userEmail}
        </Text>
        <TextInput
          value={passwordFieldVal}
          onChangeText={(text) => {
            setPasswordFieldVal(text);
          }}
          style={[
            styles.passwordField,
            {
              borderColor:
                borderEnbl && pwdError
                  ? "#F94B50"
                  : borderEnbl && !pwdError
                  ? "#08A88E"
                  : "#566267",
            },
          ]}
          secureTextEntry={true}
          onBlur={() => {
            verifyPassword();
          }}
        />
        <View>
          <TouchableOpacity
            onPress={() => {
              deleteCurrentUserInfo();
            }}
            style={styles.deleteButtonStyle}
            disabled={
              borderEnbl && pwdError
                ? true
                : borderEnbl && !pwdError
                ? false
                : true
            }
          >
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => close()}
          style={styles.cancelButtonStyle}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: "rgba(30, 31, 32, 0.3)",
    zIndex: 999,
    justifyContent: "center",
  },
  mainView: {
    backgroundColor: "#FFFFFF",
    paddingBottom: getHeight(20),
    marginHorizontal: getWidth(37),
    borderRadius: getHeight(30),
    justifyContent: "center",
    flexDirection: "column",
  },
  headingStyle: {
    color: "#000000",
    fontWeight: "600",
    lineHeight: getHeight(28),
    fontSize: getHeight(18),
    marginHorizontal: getWidth(55),
    marginTop: getHeight(35),
    textAlign: "center",
    fontFamily: fontFamily.Bold,
  },
  simpleText: {
    fontWeight: "400",
    color: "#1E1F20",
    marginTop: getHeight(16),
    marginHorizontal: getWidth(39),
    textAlign: "center",
    fontSize: getHeight(14),
    lineHeight: getHeight(20),
    fontFamily: fontFamily.Regular,
  },
  deleteButtonStyle: {
    backgroundColor: "#2E3438",
    width: getWidth(224),
    height: getHeight(50),
    borderRadius: getHeight(100),
    textAlign: "center",
    alignSelf: "center",
  },
  deleteAccountText: {
    color: "#ffffff",
    textAlign: "center",
    marginVertical: getHeight(14),
    fontFamily: fontFamily.Regular,
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: getHeight(20),
    letterSpacing: 0.25,
  },
  cancelButtonStyle: {
    backgroundColor: "#ffffff",
  },
  cancelButtonText: {
    color: "#1E1F20",
    textAlign: "center",
    marginVertical: getHeight(15),
    fontWeight: "600",
    fontSize: getHeight(14),
    lineHeight: getHeight(20),
    fontFamily: fontFamily.Bold,
  },
  passwordField: {
    width: getWidth(224),
    height: getHeight(50),
    borderRadius: getHeight(100),
    borderWidth: 1,
    borderColor: "#566267",
    marginVertical: getHeight(19),
    // marginHorizontal: getWidth(31),
    textAlign: "center",
    alignSelf: "center",
  },
});
