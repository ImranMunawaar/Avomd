import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { getDatabaseInstance } from "../../services/helper";

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";

import Toast from "react-native-toast-message";
import styles from "./styles";
import Design from "./design";

export default function MyProfileScreen(props) {
  const [userProfileInfo, setUserProfileInfo] = useState({
    name: "",
    firstName: "",
    lastName: "",
    nameBorderClr: false,
    userEmail: "",
    userInstitution: "",
    institutionBorderClr: false,
    enableProfileUpdateButton: false,
    typeModalVisible: false,
    deleteAccountModalVisible: false,
    changePasswordModalVisible: false,
    isProfileUpdate: false,
    surveyInfoList: {},
    toastMsg: "",
  });
  // By some reason typeName not set on change from userProfileInfo Obj therefore setting here
  const [typeName, setTypeName] = useState("");
  // component did mount for get user info by id
  useEffect(() => {
    let currenUser = firebase.auth().currentUser;
    let userUid = currenUser.uid;

    getDatabaseInstance()
      .ref()
      .child("users")
      .child(userUid)
      .once("value", (snapshot) => {
        let userInfo = snapshot.val();
        let name = userInfo?.name;
        name = !name ? "" : name.split(" ");
        let firstNameExists = "firstName" in userInfo;
        let lastNameExists = "lastName" in userInfo;
        let firstName = userInfo?.firstName;
        let lastName = userInfo?.lastName;
        let userEmail = currenUser?.email;
        let surveyInfo = userInfo?.surveyProfile ? userInfo?.surveyProfile : {};
        let userType = surveyInfo?.userType;
        //  let userInstitution = surveyInfo?.["Where are you working"];
        let userInstitution = surveyInfo?.institution
          ? surveyInfo?.institution
          : surveyInfo?.["Where are you working"];

        setUserProfileInfo({
          ...userProfileInfo,
          userInstitution: userInstitution != undefined ? userInstitution : "",
          name: name != undefined ? name : "",
          firstName: firstNameExists ? firstName : name[0],
          lastName: lastNameExists ? lastName : name[1],
          userEmail: userEmail != undefined ? userEmail : "",
          // typeName: userType != undefined ? userType : "",
          surveyInfoList: surveyInfo,
        });
        // set user type
        setTypeName(userType != undefined ? userType : "");
      });
  }, []);
  // set state

  // update profile
  updateProfile = () => {
    let currenUser = firebase.auth().currentUser;
    let userUid = currenUser.uid;
    const basestr = "users/" + userUid + "/";
    const { firstName, lastName, userInstitution, toastMsg, surveyInfoList } =
      userProfileInfo;
    const newSurveyObj = {
      ...surveyInfoList,
      institution: userInstitution,
      userType: typeName,
    };
    try {
      getDatabaseInstance()
        .ref(basestr)
        .update({
          name: firstName + " " + lastName,
          firstName: firstName,
          lastName: lastName,
          surveyProfile: newSurveyObj,
        })
        .then(() => {
          setUserProfileInfo({
            ...userProfileInfo,
            isProfileUpdate: true,
            toastMsg: "Profile updated successfully!",
          });
          Toast.show({
            type: "customToast",
            text1: toastMsg,
          });
        })
        .catch((error) => {
          console.log("error is", error);
          setUserProfileInfo({
            ...userProfileInfo,
            toastMsg: "Changes not updated. Please try agin!",
          });
          Toast.show({
            type: "customToast",
            text1: toastMsg,
          });
        });
    } catch (error) {
      console.log("errror Info", error);
      setUserProfileInfo({
        ...userProfileInfo,
        toastMsg: "Changes not updated. Please try agin!",
      });
      Toast.show({
        type: "customErrorToast",
        text1: toastMsg,
      });
    }
  };
  return (
    <View style={styles.mainView}>
      <Design
        screenState={userProfileInfo}
        screenProps={props}
        setUserProfileInfo={setUserProfileInfo}
        typeName={typeName}
        setTypeName={setTypeName}
      />
    </View>
  );
}
