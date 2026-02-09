import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { getDatabaseInstance } from "../../services/helper";

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";

import Toast from "react-native-toast-message";
import styles from "./styles";
import Design from "./design";

export default function TextPanelScreen(props) {
  const [userProfileInfo, setUserProfileInfo] = useState({
    name: "",
    firstName: "",
  });

  return <Design screenProps={props} screenParams={props.route.params} />;
}
