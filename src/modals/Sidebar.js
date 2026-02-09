import React, { Component } from "react";
import {
  Linking,
  Alert,
  Image,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  FlatList,
  Text,
} from "react-native";
import Modal from "react-native-modal";
import NetInfo from "@react-native-community/netinfo";

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";

import { connect } from "react-redux";
import * as Analytics from "../services/Analytics";
import store from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabaseInstance, getHeight, getWidth } from "../services/helper";
import { getUniqueId } from "react-native-device-info";
import Env from "../constants/Env";
import { buildVariants, fontFamily, LIVE_DB } from "../constants/strings";
import Toast from "react-native-toast-message";
import { getBottomSpace, getStatusBarHeight } from "../services/iphoneXHelper";
import Layout from "../constants/Layout";
import { SvgXml } from "react-native-svg";
import svgs from "../constants/svgs";
import { version } from "../../package.json";
import Colors from "../constants/Colors";

class Sidebar extends Component {
  clicksCount = 0;

  // reset data on signout
  resetAndNavigate = async () => {
    Analytics.track(Analytics.events.CLICK_SIGN_OUT);
    store.dispatch({ type: "RESET_ALL_DATA" });
    Analytics.reset();
    await AsyncStorage.removeItem("user");
    this.props.closeModal();
    this.props.dispatch({
      type: "SET_IS_USER_LOGGED_IN",
      data: false,
    });
    this.props.navigation.navigate("SignUp", {});
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
  render() {
    const { heartFlowLink, isOpen, closeModal, userInfo, dbURL, navigation } =
      this.props;
    let user = userInfo;
    const toastConfig = {
      /*
        Or create a completely new type - `customToast`,
        building the layout from scratch.
    
        I can consume any custom `props` I want.
        They will be passed when calling the `show` method (see below)
      */
      customToast: ({ text1, props }) => (
        <View
          style={{
            borderRadius: getHeight(3),
            borderColor: "#2E3438",
            width: getWidth(344),
            height: getHeight(48),
            backgroundColor: "#2E3438",
            flexDirection: "row",
            shadowColor: "black",
            shadowOpacity: 0.15,
            shadowOffset: {
              height: getHeight(4),
              width: 0,
            },
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              width: getWidth(256),
              height: getHeight(40),
              marginVertical: getHeight(14),
              marginLeft: getWidth(16),
              flex: 0.95,
              fontSize: getHeight(14),
              lineHeight: getHeight(20),
            }}
          >
            {text1}
          </Text>
          <Image
            source={require("../images/error.png")}
            style={{
              marginVertical: getHeight(16),
              width: getWidth(16),
              height: getHeight(16),
            }}
          />
        </View>
      ),
    };

    const sideBarMenu = [
      {
        icon: require("../images/qrcode.png"),
        isVisible: !!heartFlowLink,
        title: "Share with QR Code",
        accessibilityLabel: "shareWithQRcode",
        onPress: async () => {
          closeModal();
          navigation.navigate("ShareQRCodeStepOne", {
            heartFlowLink: heartFlowLink,
          });
        },
      },
      {
        icon: require("../images/email.png"),
        isVisible: true,
        title: "Contact Us",
        accessibilityLabel: "contactUs",
        onPress: async () => {
          Analytics.track(Analytics.events.CLICK_CONTACT_US);
          closeModal();
          Linking.openURL("mailto:support@avomd.io?subject=AvoMD: Contact Us");
        },
      },
      {
        icon: require("../images/website.png"),
        isVisible: true,
        title: "Visit AvoMD",
        accessibilityLabel: "visitAvoMD",
        onPress: async () => {
          Analytics.track(Analytics.events.CLICK_VISIT_OUR_WEBSITE);
          closeModal();
          Linking.openURL("http://avomd.io");
        },
      },
      {
        icon: require("../images/website.png"),
        title: "Columbia Psychiatry",
        accessibilityLabel: "columbiaPsychiatry",
        isVisible: Env.BUILD_VARIANT === buildVariants.COLUMBIA,
        onPress: async () => {
          Analytics.track(Analytics.events.CLICK_VISIT_COLUMBIA_WEBSITE);
          closeModal();
          Linking.openURL("http://www.columbiapsychiatry.org/mindventures");
        },
      },
      {
        icon: require("../images/logout.png"),
        isVisible: true,
        title: "Sign Out",
        accessibilityLabel: "signOut",
        onPress: async () => {
          Alert.alert("", "Are you sure you want to sign out?", [
            {
              text: "Yes",
              onPress: async () => {
                this.signOutUser();
              },
            },
            {
              text: "No",
            },
          ]);
        },
      },
    ];

    return (
      <Modal
        isVisible={isOpen}
        style={{ margin: 0 }}
        propagateSwipe={true}
        backdropOpacity={0.3}
        swipeDirection={"down"}
        backdropColor={"#1E1F20"}
        onBackButtonPress={() => closeModal()}
        onBackdropPress={() => closeModal()}
        onSwipeComplete={() => closeModal()}
      >
        <View style={styles.modalView}>
          <Text
            style={{
              position: "absolute",
              bottom: getBottomSpace(),
              right: getWidth(14),
              color: "#85959D",
              fontFamily: fontFamily.Regular,
              fontSize: getHeight(12),
              opacity: 0.6,
            }}
          >
            v{version + (dbURL !== LIVE_DB ? " staging" : "")}
          </Text>
          <View style={styles.dragView}>
            <Image
              source={require("../images/dragline.png")}
              style={styles.dragImage}
            />
          </View>
          <View>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel="myProfile"
              onPress={async () => {
                closeModal();
                navigation.navigate("MyProfile", {});
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 16,
                }}
              >
                <View style={styles.profileView}>
                  {userInfo != undefined &&
                  "name" in userInfo &&
                  userInfo.name != "" &&
                  userInfo.name != undefined ? (
                    <Text style={styles.profileText}>{userInfo?.name[0]}</Text>
                  ) : (
                    <SvgXml
                      xml={svgs.userPlaceHolder}
                      width={getHeight(21)}
                      height={getHeight(21)}
                    />
                  )}
                </View>
                <View
                  style={{
                    alignItems: user?.name ? "flex-start" : "center",
                    justifyContent: user?.name ? "flex-start" : "center",
                  }}
                >
                  {user?.name && (
                    <Text style={styles.userName}>{user?.name}</Text>
                  )}
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
                <Image
                  source={require("../images/chevron-small-right.png")}
                  style={{
                    width: 20,
                    height: 20,
                    alignSelf: "center",
                    marginLeft: "auto",
                    marginRight: 10,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
          <FlatList
            style={{
              marginBottom: 52,
              borderTopWidth: 1,
              marginTop: 15,
              borderColor: "#d3d3d3",
            }}
            data={sideBarMenu}
            renderItem={({ item, index }) => {
              return item.isVisible ? (
                <View key={index + ""}>
                  <TouchableOpacity
                    accessible
                    accessibilityLabel={item.title.replaceAll(" ", "")}
                    style={[
                      styles.listView,
                      index === sideBarMenu.length - 1
                        ? { marginBottom: 0 }
                        : {},
                    ]}
                    onPress={item.onPress}
                  >
                    <Image source={item.icon} style={styles.menuIcons} />
                    <Text
                      accessible={true}
                      accessibilityLabel={item.accessibilityLabel}
                      style={styles.listText}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null;
            }}
            keyExtractor={(item) => item.title}
          />
          {/* <List
            style={{
              marginBottom: 52,
              borderTopWidth: 1,
              marginTop: 15,
              borderColor: "#d3d3d3",
            }}
            dataArray={sideBarMenu}
            renderRow={(data, index) => {
              return data.isVisible ? (
                <View key={index + ""}>
                  <TouchableOpacity
                    style={[
                      styles.listView,
                      index === sideBarMenu.length - 1
                        ? { marginBottom: 0 }
                        : {},
                    ]}
                    onPress={data.onPress}
                  >
                    <Image source={data.icon} style={styles.menuIcons} />
                    <Text
                      accessible={true}
                      accessibilityLabel={data.accessibilityLabel}
                      style={styles.listText}
                    >
                      {data.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null;
            }}
          /> */}
          {Env.BUILD_VARIANT === buildVariants.COLUMBIA && (
            <View style={{ flexDirection: "row" }}>
              <Image
                source={{ uri: "columbialogo" }}
                style={styles.columbiaIcon}
              />
            </View>
          )}
        </View>
        <Toast position="bottom" config={toastConfig} />
      </Modal>
    );
  }
}

export default connect((state) => ({
  drawer: state.general.drawer,
  heartFlowLink: state.persist.heartFlowLink,
  dbURL: state.persist.dbURL,
}))(Sidebar);

const styles = StyleSheet.create({
  modalView: {
    maxHeight: Layout.window.height - getStatusBarHeight(true) - getHeight(10),
    paddingBottom: getBottomSpace(),
    backgroundColor: "#FFFFFF",
    marginTop: "auto",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  avoLogoView: {
    flexDirection: "row",
    marginTop: getHeight(20),
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoIcon: {
    width: getWidth(258 / 2),
    height: getHeight(69 / 2),
    marginStart: getWidth(16),
    resizeMode: "contain",
    alignSelf: "flex-end",
  },
  listView: {
    flexDirection: "row",
    marginLeft: getWidth(16),
    marginTop: getHeight(15),
    alignItems: "center",
  },
  listText: {
    fontSize: getHeight(16),
    fontWeight: "400",
    fontFamily: fontFamily.Medium,
    lineHeight: getHeight(24),
    color: "#000000",
    alignSelf: "center",
  },
  menuIcons: {
    width: getHeight(27),
    height: getHeight(27),
    marginTop: getHeight(1),
    marginEnd: getWidth(8),
    marginStart: getWidth(0),
    paddingStart: getWidth(0),
    alignSelf: "center",
    tintColor: "#2E3438",
  },
  columbiaIcon: {
    width: getWidth(188),
    height: getHeight(67),
    marginStart: getWidth(33),
    marginBottom: getHeight(54),
  },
  dragView: {
    display: "flex",
    alignItems: "center",
    marginBottom: getHeight(30),
  },
  dragImage: {
    width: getWidth(36),
    height: getHeight(5),
    marginTop: getHeight(5),
  },
  horizontalLine: {
    height: getHeight(1),
    backgroundColor: "#E5EDF0",
    marginVertical: getHeight(8),
  },
  userName: {
    fontWeight: "600",
    fontSize: getHeight(16),
    lineHeight: getHeight(20),
    paddingStart: getWidth(0),
    color: "#1E1F20",
    fontFamily: fontFamily.SemiBold,
    //alignSelf: "center",
  },
  userEmail: {
    fontWeight: "600",
    fontSize: getHeight(12),
    lineHeight: getHeight(20),
    paddingStart: getWidth(0),
    color: "#566267",
    fontFamily: fontFamily.Regular,
    //alignSelf: "center",
  },
  profileText: {
    color: "#FFFFFF",
    fontFamily: fontFamily.Regular,
    fontSize: getHeight(18),
    fontWeight: "700",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  profileView: {
    marginEnd: getWidth(16),
    width: getHeight(32),
    height: getHeight(32),
    borderRadius: getHeight(32) / 2,
    backgroundColor:
      Env.BUILD_VARIANT === buildVariants.COLUMBIA
        ? Colors.primaryColor
        : "#057575",
    alignItems: "center",
    justifyContent: "center",
    //position: "absolute",
    //right: 0,
    // zIndex: 0,
  },
});
