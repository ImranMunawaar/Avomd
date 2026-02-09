import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Image,
  Text
} from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { getHeight, getWidth } from "../services/helper";
import QRCode from "react-native-qrcode-svg";
import * as Analytics from "../services/Analytics";
import { PageHeaderV2 } from "../components/PageHeaderV2";
import { ShareQRCodeHeader } from "../components/theme/ShareQRCodeHeader";
import ViewShot from "react-native-view-shot";
import Clipboard from "@react-native-community/clipboard";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import Share from "react-native-share";
import ToastMsg from "../components/theme/ToastMsg";
import { fontFamily } from "../constants/strings";
export class ShareQRCodeScreen extends Component {
  async hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === "granted";
  }

  saveQrToDisk = async () => {
    if (Platform.OS === "android" && !(await this.hasAndroidPermission())) {
      return;
    }
    this.refs.viewShot
      .capture()
      .then((uri) => {
        CameraRoll.save(uri, { type: "photo", album: "avomd" });
      })
      .then(() => {
        Toast.show({
          type: "customToast",
          text1: "QR Code saved as image in gallery",
        });
        //   Alert.alert("QR code downloaded", "QR code is saved in gallery");
        //ToastAndroid.show('Saved to gallery !!', ToastAndroid.SHORT)
      });
  };

  shareInfo = async (heartflowLink) => {
    const url = heartflowLink;
    const title = "Heartflow QR Code";
    const message = "";

    const options = {
      title,
      url,
      message,
    };
    try {
      await Share.open(options);
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { params } = this.props.route;
    const heartflowLink = params ? params.heartFlowLink : null;
    const fullName = params ? params.firstName + " " + params.lastName : "";
    const isByPassInformation = params ? params.isByPassInformation : false;

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ShareQRCodeHeader
          onBackPress={() => {
            this.props.navigation.goBack();
          }}
          title="Share with QR Code"
        />
        <View
          style={{
            paddingTop: getHeight(74),
          }}
          iosBarStyle={"dark-content"}
        >
          <View style={{ alignItems: "center" }}>
            <ViewShot
              ref="viewShot"
              options={{ format: "png", quality: 0.9 }}
              style={{ backgroundColor: "#ffffff" }}
            >
              <View
                style={{
                  //marginHorizontal: getWidth(20),
                  //marginVertical: getHeight(20),
                  borderRadius: getHeight(20),
                  // width: getWidth(259),
                  // height: getHeight(259),
                  borderColor: "#6DDC91",
                  borderWidth: getWidth(3),
                  padding: getWidth(32),
                }}
              >
                <QRCode
                  value={heartflowLink}
                  size={205}
                  getRef={(c) => (this.svg = c)}
                />
              </View>
            </ViewShot>
            {!isByPassInformation && (
              <Text style={styles.userText}>For {fullName}</Text>
            )}
            <View style={styles.iconMainContainer}>
              <View style={styles.singleIconView}>
                <TouchableOpacity
                  onPress={async () => {
                    await this.shareInfo(heartflowLink);
                  }}
                >
                  <Image
                    source={require("../images/shareicon.png")}
                    style={styles.iconStyle}
                  />
                  <Text
                    style={[
                      styles.iconText,
                      {
                        marginHorizontal: getWidth(15),
                      },
                    ]}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.singleIconView}>
                <TouchableOpacity onPress={this.saveQrToDisk}>
                  <Image
                    source={require("../images/saveicon.png")}
                    style={styles.iconStyle}
                  />
                  <Text style={styles.iconText}>Download</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.singleIconView}>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setString(heartflowLink);
                    Toast.show({
                      type: "customToast",
                      text1: "Link copied to clipboard ",
                    });
                  }}
                >
                  <Image
                    source={require("../images/copyicon.png")}
                    style={styles.iconStyle}
                  />
                  <Text style={styles.iconText}>Copy Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <ToastMsg />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  userText: {
    fontSize: getHeight(14),
    color: "#566267",
    marginTop: getHeight(4),
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    lineHeight: getHeight(20),
  },
  iconMainContainer: {
    flexDirection: "row",
    // height: 100,
    paddingHorizontal: 5,
    marginTop: 14,
    //padding: 10,
  },
  singleIconView: {
    margin: 5,
    backgroundColor: "#F5F8F9",
    borderRadius: getHeight(8),
    width: getWidth(108),
    height: getHeight(76),
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconStyle: {
    width: getWidth(24),
    height: getHeight(24),
    alignContent: "center",
    marginHorizontal: getWidth(20),
    //marginRight: getWidth(12.83),
  },
  iconText: {
    fontSize: getHeight(14),
    color: "#1E1F20",
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    lineHeight: getHeight(20),
  },
});
