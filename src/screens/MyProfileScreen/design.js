import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import remoteConfig from "@react-native-firebase/remote-config";
import { getHeight, getWidth } from "../../services/helper";
import ToastMsg from "../../components/theme/ToastMsg";
import { SvgXml } from "react-native-svg";
import svgs from "../../constants/svgs";
import { TypeListModal } from "../../modals/TypeListModal";
import { DeleteAccountModal } from "../../modals/DeleteAccountModal";
import { ChangePasswordModal } from "../../modals/ChangePasswordModal";
import { GenericInfoModal } from "../../modals/GenericInfoModal";

import { PageHeaderV2 } from "../../components/PageHeaderV2";
import styles from "./styles";
import Toast from "react-native-toast-message";
import _ from "lodash";
import IAPStore from "../../services/IAPStore";
import Env from "../../constants/Env";
import { buildVariants } from "../../constants/strings";

const Design = ({
  screenState,
  screenProps,
  typeName,
  setTypeName,
  setUserProfileInfo,
}) => {
  const [loader, setLoader] = useState(false);
  const { navigation } = screenProps;
  const {
    firstName,
    lastName,
    firstNameBorderClr,
    lastNameBorderClr,
    userEmail,
    userInstitution,
    institutionBorderClr,
    enableProfileUpdateButton,
    typeModalVisible,
    deleteAccountModalVisible,
    changePasswordModalVisible,
    activeSubscriptionModalVisible,
    isProfileUpdate,
    toastMsg,
  } = screenState;
  // move toward sign in screen
  moveOnSignInScreen = _.debounce(function () {
    navigation.navigate("SignUp", {});
  }, 4500);

  let deleteUserEnabled =
    Env.BUILD_VARIANT === buildVariants.COLUMBIA
      ? remoteConfig()
          .getValue("columbia_delete_user_feature_enabled")
          .asBoolean()
      : true;

  return (
    <>
      <PageHeaderV2
        onBackPress={() => {
          //navigation.goBack();
          navigation.navigate("Modules", {
            userName: isProfileUpdate ? firstName + " " + lastName : "",
          });
        }}
        title="My Profile"
      />
      <ScrollView>
        {/* Profile setting View */}
        <View style={styles.innerView}>
          <Text style={styles.profileSettingText}>Profile Settings</Text>
          {/* User name Circle View */}
          <View style={styles.profileView}>
            {firstName != undefined ? (
              <Text style={styles.profileText}>{firstName[0]}</Text>
            ) : (
              <SvgXml
                xml={svgs.userPlaceHolder}
                width={getHeight(21)}
                height={getHeight(21)}
              />
            )}
          </View>
          {/* Name/Email/Type and Instittution field main view */}
          <View>
            {/* Name field view */}
            <View>
              <View style={styles.labelContainer}>
                <Text style={styles.fieldTitleText}>First Name</Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    borderColor:
                      firstName === ""
                        ? "#F94B50"
                        : firstNameBorderClr
                        ? "#08A88E"
                        : "#C5D1D8",
                  },
                ]}
                // editable={true}
                selectTextOnFocus={true}
                value={firstName}
                onFocus={() =>
                  setUserProfileInfo({
                    ...screenState,
                    firstNameBorderClr: true,
                  })
                }
                onBlur={() =>
                  setUserProfileInfo({
                    ...screenState,
                    firstNameBorderClr: false,
                  })
                }
                onChangeText={(firstName) => {
                  setUserProfileInfo({
                    ...screenState,
                    firstName: firstName,
                    enableProfileUpdateButton:
                      firstName !== "" && lastName !== "" ? true : false,
                  });
                }}
                accessible={true}
                accessibilityLabel="firstName"
              />
            </View>
            <View>
              <View style={styles.labelContainer}>
                <Text style={styles.fieldTitleText}>Last Name</Text>
                <Text style={styles.asteriskSymbol}>.</Text>
              </View>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    borderColor:
                      lastName === ""
                        ? "#F94B50"
                        : lastNameBorderClr
                        ? "#08A88E"
                        : "#C5D1D8",
                  },
                ]}
                // editable={true}
                selectTextOnFocus={true}
                value={lastName}
                onFocus={() =>
                  setUserProfileInfo({
                    ...screenState,
                    lastNameBorderClr: true,
                  })
                }
                onBlur={() =>
                  setUserProfileInfo({
                    ...screenState,
                    lastNameBorderClr: false,
                  })
                }
                onChangeText={(lastName) => {
                  setUserProfileInfo({
                    ...screenState,
                    lastName: lastName,
                    enableProfileUpdateButton:
                      firstName !== "" && lastName !== "" ? true : false,
                  });
                }}
                accessible={true}
                accessibilityLabel="lastName"
              />
            </View>
            {/* Email field view */}
            <View>
              <Text style={styles.fieldTitleText}>Email</Text>
              <TextInput
                editable={false}
                style={[styles.fieldInput, { backgroundColor: "#F5F8F9" }]}
                value={userEmail}
                accessible={true}
                accessibilityLabel="userEmail"
              />
            </View>
            {/* Type dropdown view */}
            <View>
              <Text style={[styles.fieldTitleText, {}]}>Type</Text>
              <TouchableOpacity
                onPress={() => {
                  setUserProfileInfo({
                    ...screenState,
                    typeModalVisible: true,
                  });
                }}
              >
                <View style={styles.rowStyle}>
                  <TextInput
                    pointerEvents="none"
                    style={[styles.fieldInput, {}]}
                    editable={false}
                    value={typeName}
                    accessible={true}
                    accessibilityLabel="typeName"
                  />
                  <Image
                    source={require("../../images/dropdownarrow.png")}
                    style={styles.dropDownArrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
            {/* Instituation view */}
            <View>
              <Text style={styles.fieldTitleText}>Institution</Text>
              <TextInput
                value={userInstitution}
                onChangeText={(userInstitution) => {
                  setUserProfileInfo({
                    ...screenState,
                    userInstitution: userInstitution,
                    enableProfileUpdateButton:
                      firstName !== "" && lastName !== "" ? true : false,
                  });
                }}
                onFocus={() =>
                  setUserProfileInfo({
                    ...screenState,
                    institutionBorderClr: true,
                  })
                }
                onBlur={() =>
                  setUserProfileInfo({
                    ...screenState,
                    institutionBorderClr: false,
                  })
                }
                style={[
                  styles.fieldInput,
                  {
                    borderColor: institutionBorderClr ? "#08A88E" : "#C5D1D8",
                  },
                ]}
                accessible={true}
                accessibilityLabel="institutionName"
              />
            </View>
            {/* Update Profile button view */}
            <View>
              <TouchableOpacity
                onPress={() => updateProfile()}
                disabled={!enableProfileUpdateButton}
                style={[
                  styles.updateProfileButton,
                  {
                    backgroundColor: !enableProfileUpdateButton
                      ? "#E5EDF0"
                      : "#23C29D",
                  },
                ]}
                accessible={true}
                accessibilityLabel="updateProfile"
              >
                <Text style={[styles.buttonText, {}]}>Update Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Type Modal */}
            <View>
              {typeModalVisible && (
                <TypeListModal
                  isVisible={typeModalVisible}
                  typeName={typeName}
                  setTypeName={(name) => {
                    setTypeName(name);
                  }}
                  close={() => {
                    setUserProfileInfo({
                      ...screenState,
                      enableProfileUpdateButton:
                        firstName !== "" && lastName !== "" ? true : false,
                      typeModalVisible: false,
                    });
                  }}
                />
              )}
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        {/* Change Password View */}
        <View style={styles.settingView}>
          <Text style={styles.headingStyle}>Password</Text>
          <Text style={styles.textStyle}>Change your password.</Text>
          <TouchableOpacity
            onPress={() =>
              setUserProfileInfo({
                ...screenState,
                changePasswordModalVisible: true,
              })
            }
            accessible={true}
            accessibilityLabel="changePasswordButton"
            style={[styles.buttonStyle, {}]}
          >
            <Text style={[styles.buttonText, { color: "#08A88E" }]}>
              Change Password
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        {deleteUserEnabled && (
          <View
            style={[
              styles.settingView,
              { marginBottom: getHeight(25), flex: 1 },
            ]}
          >
            <Text style={styles.headingStyle}>Account Management</Text>
            <Text style={styles.textStyle}>
              This will permanently delete the account associated with your
              email address, and cannot be undone.
            </Text>
            <TouchableOpacity
              onPress={async () => {
                setLoader(true);
                await IAPStore.init();
                await IAPStore.refreshProducts();
                if (
                  Env.BUILD_VARIANT === buildVariants.COLUMBIA &&
                  IAPStore.activeProducts.length >= 1
                ) {
                  setUserProfileInfo({
                    ...screenState,
                    activeSubscriptionModalVisible: true,
                  });
                  setLoader(false);
                } else {
                  setUserProfileInfo({
                    ...screenState,
                    deleteAccountModalVisible: true,
                  });
                  setLoader(false);
                }
              }}
              style={[
                styles.buttonStyle,
                { borderColor: "#F94B50", flexDirection: "row" },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: "#F94B50", marginLeft: getWidth(4) },
                ]}
              >
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Medical Specl Modal */}
        <View>
          {changePasswordModalVisible && (
            <ChangePasswordModal
              isVisible={changePasswordModalVisible}
              institutionName={(name) => {
                this.setState({ institutionName: name });
              }}
              onModalClose={() =>
                setUserProfileInfo({
                  ...screenState,
                  changePasswordModalVisible: false,
                })
              }
            />
          )}
        </View>
        {/* Delete Account Modal */}
        <View>
          {deleteAccountModalVisible && (
            <DeleteAccountModal
              isVisible={deleteAccountModalVisible}
              typeName={typeName}
              userEmail={userEmail}
              setTypeName={(name) => {
                setTypeName(name);
              }}
              close={(toastMsg = "") => {
                setUserProfileInfo({
                  ...screenState,
                  deleteAccountModalVisible: false,
                });
                if (typeof toastMsg !== "object" && toastMsg != "") {
                  Toast.show({
                    type: "customToast",
                    text1: toastMsg,
                  });
                  moveOnSignInScreen();
                }
              }}
            />
          )}
          {loader && (
            <View style={styles.loader}>
              <ActivityIndicator />
            </View>
          )}
          {activeSubscriptionModalVisible && (
            <GenericInfoModal
              isVisible={activeSubscriptionModalVisible}
              heading={"Cancel Subscriptions"}
              simpleText={
                "To delete your account, please cancel any active subscriptions through the App Store."
              }
              successText={"Go to Settings"}
              success={() => {
                Linking.openSettings();
              }}
              close={() => {
                setUserProfileInfo({
                  ...screenState,
                  activeSubscriptionModalVisible: false,
                });
              }}
            />
          )}
        </View>
      </ScrollView>
      <View>
        {/* Toast msg not readable through appium so reading it from text compoent and set the color same as backgroud */}
        <Text
          accessible={true}
          accessibilityLabel="profileUpdateToastMsg"
          style={{ color: "#FFFFFF" }}
        >
          {toastMsg}
        </Text>
        <ToastMsg toastMsg={toastMsg} />
      </View>
    </>
  );
};

export default Design;
