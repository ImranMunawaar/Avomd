import React, { Component } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  View,
  Text,
} from "react-native";
import { getHeight, getWidth } from "../services/helper";
import ToastMsg from "../components/theme/ToastMsg";
import Toast from "react-native-toast-message";
import Modal from "react-native-modal";
import { getStatusBarHeight } from "../services/iphoneXHelper";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";
import _ from "lodash";
import { fontFamily } from "../constants/strings";

export class ChangePasswordModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassVal: "",
      oldPassError: false,
      oldPassEyeEnbl: false,
      oldPassTickEnbl: false,
      oldPassErrMsg: "",
      newPassVal: "",
      newPassError: false,
      newPassEyeEnbl: false,
      newPassErrMsg: "",
      confPassVal: "",
      confPassError: false,
      confPassEyeEnbl: false,
      confPassErrMsg: "",
      toastMsg: "",
    };
  }
  // verify old password
  async verifyPassword() {
    let currentPassword = this.state.oldPassVal;
    let user = firebase.auth().currentUser;
    let cred = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    try {
      await user
        .reauthenticateWithCredential(cred)
        .then((data) => {
          //console.log("valid data===", data.user);
          this.setState({
            oldPassError: false,
            oldPassTickEnbl: true,
            oldPassErrMsg: "",
          });
        })
        .catch((err) => {
          console.log("Verify Password==", err.message);
          this.setState({
            oldPassError: true,
            oldPassErrMsg: "Wrong password. Please try again.",
          });
        });
    } catch (error) {
      console.log("Verify Password==", error.message);
      this.setState({
        oldPassError: true,
        oldPassErrMsg: "Wrong password. Please try again.",
      });
    }
  }
  // update new password
  async changePassword() {
    let newPassword = this.state.confPassVal;
    let user = firebase.auth().currentUser;
    try {
      user
        .updatePassword(newPassword)
        .then(() => {
          this.setState({ toastMsg: "Password changed successfully!" });
          Toast.show({
            type: "customToast",
            text1: this.state.toastMsg,
          });
          this.closeModalWithDelay();
        })
        .catch((error) => {
          this.setState({ toastMsg: "Password not updated!" });
          Toast.show({
            type: "customErrorToast",
            text1: this.state.toastMsg,
          });
          console.log("Password not updated!", error);
        });
    } catch (error) {
      this.setState({ toastMsg: "Password not updated!" });
      Toast.show({
        type: "customErrorToast",
        text1: this.state.toastMsg,
      });
      console.log("error msssage==", error.message);
    }
  }
  // close modal with delay
  closeModalWithDelay = _.debounce(function () {
    // console.log("Function debounced after 1000ms!");
    this.props.onModalClose(true);
  }, 2500);
  render() {
    const { isVisible, onModalClose } = this.props;
    const {
      oldPassVal,
      oldPassError,
      oldPassEyeEnbl,
      oldPassTickEnbl,
      oldPassErrMsg,
      newPassVal,
      newPassError,
      newPassEyeEnbl,
      newPassErrMsg,
      confPassVal,
      confPassError,
      confPassEyeEnbl,
      confPassErrMsg,
      toastMsg,
    } = this.state;
    let buttonStatus =
      oldPassVal === "" ||
      oldPassError ||
      newPassVal === "" ||
      newPassError ||
      confPassVal === "" ||
      confPassError;
    return (
      <Modal
        style={styles.modalStyle}
        isVisible={isVisible}
        onBackButtonPress={onModalClose}
      >
        <View style={styles.mainView}>
          <View style={styles.cardStyle}>
            {/* Header View */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ width: getHeight(15), height: getHeight(15) }} />

              <Text style={styles.mainHeadingText}>Change Password</Text>

              <TouchableOpacity
                hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
                style={styles.crossOpsity}
                onPress={onModalClose}
              >
                <Image
                  source={require("../images/close-thick.png")}
                  style={styles.crossImage}
                />
              </TouchableOpacity>
            </View>
            {/* Old Password View */}
            <View style={styles.rowStyle}>
              <View style={styles.dirctionRowStyle}>
                <Text style={[styles.fieldTitleText]}>Old Password</Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <View style={styles.dirctionRowStyle}>
                <TextInput
                  autoFocus
                  accessible={true}
                  accessibilityLabel="oldPassInput"
                  value={oldPassVal}
                  onChangeText={(oldPassVal) => this.setState({ oldPassVal })}
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: oldPassError
                        ? "#F94B50"
                        : oldPassVal != ""
                        ? "#08A88E"
                        : "#C5D1D8",
                    },
                  ]}
                  secureTextEntry={!oldPassEyeEnbl}
                  onFocus={() => this.setState({ oldPassTickEnbl: false })}
                  onBlur={() => oldPassVal != "" && this.verifyPassword()}
                />
                {oldPassVal != "" && !oldPassTickEnbl && (
                  <TouchableOpacity
                    style={styles.eyeIconOpcity}
                    onPress={() =>
                      this.setState({
                        oldPassEyeEnbl: oldPassEyeEnbl ? false : true,
                      })
                    }
                  >
                    <Image
                      style={styles.eyeIcon}
                      source={
                        oldPassEyeEnbl
                          ? require("../images/eye.png")
                          : require("../images/eye-off.png")
                      }
                    />
                  </TouchableOpacity>
                )}
                {oldPassTickEnbl && (
                  <Image
                    source={require("../images/checkmark.png")}
                    style={[styles.markIcon, {}]}
                  />
                )}
              </View>
              {oldPassError && oldPassErrMsg != "" && (
                <View style={styles.errMsgView}>
                  <Text style={styles.errorMsg}>{oldPassErrMsg}</Text>
                </View>
              )}
            </View>
            {/* New Password View */}
            <View>
              <View style={styles.dirctionRowStyle}>
                <Text style={[styles.fieldTitleText]}>New Password</Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <View style={styles.dirctionRowStyle}>
                <TextInput
                  accessible={true}
                  accessibilityLabel="newPassInput"
                  value={newPassVal}
                  onChangeText={(newPassVal) => {
                    newPassVal = newPassVal.trim();
                    this.setState({ newPassVal });
                    if (newPassVal.length < 8) {
                      this.setState({
                        newPassError: true,
                      });
                    } else {
                      this.setState({
                        newPassError: false,
                      });
                    }
                  }}
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: newPassError
                        ? "#F94B50"
                        : newPassVal != ""
                        ? "#08A88E"
                        : "#C5D1D8",
                    },
                  ]}
                  secureTextEntry={!newPassEyeEnbl}
                  onBlur={() => {
                    if (newPassVal.length < 8) {
                      this.setState({
                        newPassErrMsg:
                          "Password must be equal or longer than 8 characters",
                      });
                    } else {
                      this.setState({
                        newPassErrMsg: "",
                      });
                    }
                  }}
                />
                {newPassVal != "" && (
                  <TouchableOpacity
                    style={styles.eyeIconOpcity}
                    onPress={() =>
                      this.setState({
                        newPassEyeEnbl: newPassEyeEnbl ? false : true,
                      })
                    }
                  >
                    <Image
                      style={styles.eyeIcon}
                      source={
                        newPassEyeEnbl
                          ? require("../images/eye.png")
                          : require("../images/eye-off.png")
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>
              {newPassError && newPassErrMsg != "" && (
                <View style={styles.errMsgView}>
                  <Text style={styles.errorMsg}>{newPassErrMsg}</Text>
                </View>
              )}
            </View>
            {/* Confirm New Password View */}
            <View>
              <View style={styles.dirctionRowStyle}>
                <Text style={[styles.fieldTitleText]}>
                  Confirm New Password
                </Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <View style={styles.dirctionRowStyle}>
                <TextInput
                  accessible={true}
                  accessibilityLabel="conPassInput"
                  value={confPassVal}
                  onChangeText={(confPassVal) => {
                    confPassVal = confPassVal.trim();
                    this.setState({ confPassVal });
                    if (confPassVal != newPassVal) {
                      this.setState({
                        confPassError: true,
                      });
                    } else {
                      this.setState({
                        confPassError: false,
                      });
                    }
                  }}
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: confPassError
                        ? "#F94B50"
                        : confPassVal != ""
                        ? "#08A88E"
                        : "#C5D1D8",
                    },
                  ]}
                  secureTextEntry={!confPassEyeEnbl}
                  onBlur={() => {
                    if (confPassVal != newPassVal) {
                      this.setState({
                        confPassErrMsg:
                          "New password does not match with confirm password",
                      });
                    } else {
                      this.setState({
                        confPassErrMsg: "",
                      });
                    }
                  }}
                />
                {confPassVal != "" && (
                  <TouchableOpacity
                    style={styles.eyeIconOpcity}
                    onPress={() =>
                      this.setState({
                        confPassEyeEnbl: confPassEyeEnbl ? false : true,
                      })
                    }
                  >
                    <Image
                      style={styles.eyeIcon}
                      source={
                        confPassEyeEnbl
                          ? require("../images/eye.png")
                          : require("../images/eye-off.png")
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>
              {confPassError && confPassErrMsg != "" && (
                <View style={styles.errMsgView}>
                  <Text style={styles.errorMsg}>{confPassErrMsg}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.changePasswordView}>
            <TouchableOpacity
              //onPress={() => this.changePassword()}
              accessible={true}
              accessibilityLabel="updatePasswordButton"
              onPress={() => {
                this.changePassword();
              }}
              style={[
                styles.changePasswordButton,
                { backgroundColor: buttonStatus ? "#E5EDF0" : "#23C29D" },
              ]}
              disabled={buttonStatus}
            >
              <Text style={[styles.buttonText, {}]}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onModalClose(true)}
              style={[styles.cancelButton, {}]}
            >
              <Text style={[styles.buttonText, { color: "#08A88E" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            {/* Hidden input text for checking the wha't the toast msg is */}
            <Text
              accessible={true}
              accessibilityLabel="passUpdateToastMsg"
              style={{ color: "#FFFFFF" }}
            >
              {toastMsg}
            </Text>
            <ToastMsg toastMsg={toastMsg} />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginEnd: getWidth(16),
    marginVertical: getHeight(14),
    paddingStart: getWidth(24),
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
  fieldInput: {
    width: getWidth(328),
    height: getHeight(40),
    alignItems: "flex-start",
    borderRadius: getHeight(4),
    elevation: 3,
    color: "#1E1F20",
    fontWeight: "400",
    fontSize: getHeight(14),
    fontFamily: fontFamily.Regular,
    shadowColor: "#000000",
    borderColor: "#C5D1D8",
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
  asteriskSymbol: {
    // width: "100%",
    color: "#FF8E3D",
    width: getWidth(40),
    fontWeight: "700",
    height: getHeight(40),
    // lineHeight: 1,
    fontSize: getHeight(30),
    bottom: 10,
    //marginTop: -getHeight(10),
    //marginStart: getWidth(1),
    // position: "absolute",
    //left: getWidth(20),
  },
  dirctionRowStyle: {
    flexDirection: "row",
  },
  rowStyle: {
    marginTop: getHeight(46),
  },
  mainView: {
    flex: 1,
    paddingTop: getStatusBarHeight(true),
    backgroundColor: "white",
    justifyContent: "space-between",
    //height: getHeight(900),
    //maxHeight: getHeight(900),
    // minHeight: getHeight(500),
  },
  crossOpsity: {},
  crossImage: {
    width: getWidth(15),
    height: getHeight(15),
    resizeMode: "contain",
  },
  mainHeadingView: {
    alignSelf: "center",
  },
  mainHeadingText: {
    fontWeight: "600",
    fontSize: getHeight(18),
    fontFamily: fontFamily.Regular,
    fontStyle: "normal",
    color: "#1E1F20",
  },
  markIcon: {
    position: "absolute",
    right: getWidth(15),
    top: getHeight(13),
    //paddingVertical: getHeight(8),
    //paddingHorizontal: getWidth(6),
    width: getWidth(16),
    height: getHeight(16),
  },
  eyeIconOpcity: {
    position: "absolute",
    end: 5,
    paddingVertical: getHeight(10),
    paddingHorizontal: getWidth(6),
  },
  eyeIcon: {
    height: getHeight(20),
    width: getHeight(20),
  },
  changePasswordButton: {
    height: getHeight(44),
    width: getWidth(328),
    borderRadius: getHeight(4),
    backgroundColor: "#E5EDF0",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginBottom: getHeight(12),
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: getHeight(20),
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: getHeight(14),
    fontFamily: fontFamily.Regular,
    lineHeight: getHeight(20),
    fontStyle: "normal",
  },
  errorMsg: {
    color: "#F94B50",
    fontWeight: "400",
    fontSize: getHeight(12),
    fontFamily: fontFamily.Regular,
    lineHeight: getHeight(16),
  },
  modalStyle: {
    margin: 0,
  },
  errMsgView: {
    marginTop: getHeight(10),
  },
  changePasswordView: {
    marginEnd: getWidth(16),
    paddingStart: getWidth(24),
    marginBottom: getHeight(10),
  },
});
