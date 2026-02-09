import React, { Component } from "react";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";

import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  Text,
} from "react-native";
import {
  getDatabaseInstance,
  getHeight,
  getWidth,
  validateEmail,
} from "../services/helper";
import { ShareQRCodeHeader } from "../components/theme/ShareQRCodeHeader";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import store from "../store";
import { InstitutionListModal } from "../modals/InstitutionListModal";
import { fontFamily } from "../constants/strings";
import Layout from "../constants/Layout";
export class ShareQRCodeStepOneScreen extends Component {
  state = {
    isByPassInformation: false,
    visible: false,
    institutionName: "",
    firstName: "",
    lastName: "",
    referredTo: "",
    isValidEmail: true,
    isValidFirstName: true,
    isValidLastName: true,
  };
  async buildLink() {
    const {
      firstName,
      lastName,
      referredTo,
      institutionName,
      isByPassInformation,
    } = this.state;
    // validation for the email if not valid additional check
    if (!isByPassInformation && !validateEmail(referredTo)) {
      console.log("email not valid");
      this.setState({ isValidEmail: false });
      return;
    }

    this.user = firebase.auth().currentUser;
    let channelCode = null;
    await getDatabaseInstance()
      .ref("/users/" + this.user.uid)
      .once("value")
      .then((user) => {
        channelCode = user.val().qrSharingChannel;
      });
    if (channelCode) {
      let { channels } = store.getState().persist;
      let singleChannelInfo = channels.allChannels[channelCode];
      let invitationCode =
        singleChannelInfo.invitationCode != undefined
          ? singleChannelInfo.invitationCode
          : "";

      let bindInstitutionName =
        institutionName != "" ? "&qrInstitution=" + institutionName : "";
      let pwd = invitationCode != "" ? "&pwd=" + invitationCode : "";
      let url =
        "https://live.avomd.io/subscribeChannel?code=" +
        channelCode +
        "&referredFrom=" +
        this.user.email +
        pwd;
      if (!isByPassInformation)
        url =
          "https://live.avomd.io/subscribeChannel?code=" +
          channelCode +
          "&referredFrom=" +
          this.user.email +
          "&referredTo=" +
          referredTo +
          "&qrFirstName=" +
          firstName +
          "&qrLastName=" +
          lastName +
          bindInstitutionName +
          pwd;

      url = Platform.OS === "ios" ? url.replaceAll(" ", "+") : url;

      const link = await dynamicLinks().buildShortLink(
        {
          link: url,
          domainUriPrefix: "https://avomd.page.link",
          navigation: {
            forcedRedirectEnabled: true,
          },
          android: {
            packageName: "com.avomd.client",
            fallbackUrl: url,
          },
          ios: {
            bundleId: "com.synapticmed.siabg2016",
            appStoreId: "1114334146",
            fallbackUrl: url,
          },
        },
        dynamicLinks.ShortLinkType.SHORT
      );
      this.props.navigation.navigate("ShareQRCode", {
        heartFlowLink: link,
        firstName: firstName,
        lastName: lastName,
        isByPassInformation: isByPassInformation,
      });
      return link;
    }
  }
  close = () => this.setState({ visible: false });
  render() {
    const { params } = this.props.route;
    const heartflowLink = params ? params.heartFlowLink : null;
    const {
      isValidEmail,
      isByPassInformation,
      visible,
      institutionName,
      firstName,
      lastName,
      referredTo,
      isValidFirstName,
      isValidLastName,
    } = this.state;
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
            flex: 1,
            justifyContent: "space-between",
            marginTop: getHeight(24),
            paddingHorizontal: getWidth(30),
            paddingBottom: getHeight(30),
          }}
        >
          <View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.fieldTitleText}>First Name</Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isByPassInformation
                      ? "#F5F8F9"
                      : "#FFFFFF",
                    borderColor:
                      !isByPassInformation &&
                      firstName != "" &&
                      isValidFirstName
                        ? "#08A88E"
                        : "#E5EDF0",
                  },
                ]}
                editable={!isByPassInformation}
                selectTextOnFocus={!isByPassInformation}
                value={firstName}
                onEndEditing={(e) => {
                  let regName = /^[a-zA-Z]+ */;
                  regName.test(e.nativeEvent.text)
                    ? this.setState({
                        firstName: e.nativeEvent.text,
                        isValidFirstName: true,
                      })
                    : this.setState({
                        firstName: e.nativeEvent.text,
                        isValidFirstName: false,
                      });
                }}
                onChangeText={(firstName) => {
                  this.setState({ firstName: firstName });
                }}
              />
              {!isValidFirstName && (
                <Text style={styles.errorText}>Please enter a valid name</Text>
              )}
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.fieldTitleText}>Last Name</Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isByPassInformation
                      ? "#F5F8F9"
                      : "#FFFFFF",
                    borderColor:
                      !isByPassInformation && lastName != "" && isValidLastName
                        ? "#08A88E"
                        : "#E5EDF0",
                  },
                ]}
                editable={!isByPassInformation}
                selectTextOnFocus={!isByPassInformation}
                value={lastName}
                onEndEditing={(e) => {
                  let regName = /^[a-zA-Z]+ */;
                  regName.test(e.nativeEvent.text)
                    ? this.setState({
                        lastName: e.nativeEvent.text,
                        isValidLastName: true,
                      })
                    : this.setState({
                        lastName: e.nativeEvent.text,
                        isValidLastName: false,
                      });
                }}
                onChangeText={(lastName) => {
                  this.setState({ lastName: lastName });
                }}
              />
              {!isValidLastName && (
                <Text style={styles.errorText}>Please enter a valid name</Text>
              )}
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.fieldTitleText}>Email</Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isByPassInformation
                      ? "#F5F8F9"
                      : "#FFFFFF",
                    borderColor:
                      !isByPassInformation && referredTo != "" && isValidEmail
                        ? "#08A88E"
                        : "#E5EDF0",
                  },
                ]}
                onEndEditing={(e) => {
                  validateEmail(e.nativeEvent.text)
                    ? this.setState({
                        referredTo: e.nativeEvent.text,
                        isValidEmail: true,
                      })
                    : this.setState({
                        referredTo: e.nativeEvent.text,
                        isValidEmail: false,
                      });
                }}
                editable={!isByPassInformation}
                selectTextOnFocus={!isByPassInformation}
                value={referredTo}
                onChangeText={(email) => {
                  this.setState({ referredTo: email });
                }}
              />
              {!isValidEmail && (
                <Text style={styles.errorText}>
                  The email address is invalid
                </Text>
              )}
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.fieldTitleText}>Institution</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    !isByPassInformation
                      ? this.setState({ visible: true })
                      : null;
                  }}
                >
                  <TextInput
                    pointerEvents="none"
                    style={[
                      styles.fieldInput,
                      {
                        backgroundColor: isByPassInformation
                          ? "#F5F8F9"
                          : "#FFFFFF",
                        borderColor:
                          !isByPassInformation && institutionName != ""
                            ? "#08A88E"
                            : "#E5EDF0",
                      },
                    ]}
                    editable={false}
                    selectTextOnFocus={!isByPassInformation}
                    value={institutionName}
                  />
                </TouchableOpacity>
                <Image
                  source={require("../images/dropdownarrow.png")}
                  style={styles.dropDownArrow}
                />
              </View>
            </View>
            <View>
              {visible && (
                <InstitutionListModal
                  isVisible={visible}
                  institutionName={(name) => {
                    this.setState({ institutionName: name });
                  }}
                  close={() => this.setState({ visible: false })}
                />
              )}
            </View>
            <View>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  this.setState({
                    isByPassInformation: !isByPassInformation,
                  });
                }}
              >
                {isByPassInformation ? (
                  <Image
                    source={require("../images/checked-box.png")}
                    style={{
                      height: getHeight(16),
                      width: getWidth(16),
                      left: 0,
                      marginTop: getHeight(17),
                      marginRight: getWidth(10),
                    }}
                  />
                ) : (
                  <Image
                    source={require("../images/uncheck-box.png")}
                    style={{
                      height: getHeight(16),
                      width: getWidth(16),
                      left: 0,
                      marginTop: getHeight(17),
                      marginRight: getWidth(10),
                    }}
                  />
                )}

                <Text style={styles.fieldTitleText}>
                  Bypass user information
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            onPress={() => this.buildLink()}
            disabled={
              !isByPassInformation &&
              !(
                firstName != "" &&
                isValidFirstName &&
                lastName != "" &&
                isValidLastName &&
                referredTo != "" &&
                isValidEmail
              )
            }
            style={[
              styles.createQrCodeButton,
              {
                backgroundColor:
                  isByPassInformation ||
                  (firstName != "" &&
                    isValidFirstName &&
                    lastName != "" &&
                    isValidLastName &&
                    referredTo != "" &&
                    isValidEmail)
                    ? "#6DDC91"
                    : "#E5EDF0",
              },
            ]}
          >
            <Text style={styles.buttonText}>Create QR Code</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    position: "absolute",
  },
  fieldTitleText: {
    color: "#566267",
    fontWeight: "400",
    fontSize: getHeight(16),
    lineHeight: 20,
    marginBottom: getHeight(10),
    fontFamily: fontFamily.Regular,
    marginTop: getHeight(16),
  },
  errorText: {
    color: "red",
    fontWeight: "400",
    fontSize: getHeight(13),
    marginHorizontal: getWidth(0),
    marginTop: getHeight(6),
    fontFamily: fontFamily.Regular,
  },
  createQrCodeButton: {
    borderRadius: getHeight(30),
    height: getHeight(44),
    width: Layout.window.width - getWidth(60),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
  },
  asteriskSymbol: {
    // width: "100%",
    color: "#FF8E3D",
    width: getWidth(40),
    fontWeight: "700",
    height: getHeight(40),
    // lineHeight: 1,
    fontSize: getHeight(30),
    marginTop: -getHeight(10),
    marginStart: getWidth(1),
  },
  buttonText: {
    textAlign: "center",
    fontSize: getHeight(14),
    letterSpacing: 0.25,
    fontWeight: "700",
    fontFamily: fontFamily.Regular,
    fontStyle: "normal",
    color: "#FFFFFF",
  },
  fieldInput: {
    width: Layout.window.width - getWidth(60),
    height: getHeight(40),
    alignItems: "flex-start",
    borderRadius: getHeight(4),
    elevation: 3,
    color: "#1E1F20",
    fontWeight: "400",
    fontSize: getHeight(14),
    fontFamily: fontFamily.Regular,
    shadowColor: "#000000",
    borderColor: "#E5EDF0",
    borderStyle: "solid",
    //shadowOpacity: 0.15,
    borderWidth: 1,
    // shadowOffset: {
    //   height: 4,
    //   width: 0,
    // },
    backgroundColor: "#FFFFFF",
    paddingHorizontal: getWidth(15),
  },
  checkbox: {
    marginTop: getHeight(10),
    borderColor: "#C5D1D8",
    borderWidth: 1,
    marginRight: getWidth(7),
    // color: "#000000",
    // backgroundColor: "#000000",
  },
  dropDownArrow: {
    marginTop: getHeight(18),
    position: "absolute",
    right: getWidth(10),
    width: getHeight(8),
    height: getHeight(5),
  },
});
