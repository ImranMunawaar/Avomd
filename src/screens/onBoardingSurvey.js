import React, { useState, useEffect } from "react";
import * as Analytics from "../services/Analytics";
import { View, Text } from "react-native";
import { ActivityIndicator } from "react-native";
import Colors from "../constants/Colors";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/functions";

import { getActiveModule, loadSharedModule } from "../models/modules";
import DashboardScreen from "./DashboardScreen";

export default function OnboardingSurvey(props) {
  const [loading, setLoading] = useState(true);
  var user = firebase.auth().currentUser;
  let userId = user != null ? user.uid : "";

  useEffect(() => {
    loadSharedModule("onboarding-module")
      .then(() => {
        firebase
          .functions()
          .httpsCallable("getIntroCardTitle")({ uid: userId })
          .then((result) => {
            const title = result.data.title;
            const module = getActiveModule();
            module.title = title;
            Analytics.track(Analytics.events.VIEW_ADDITIONAL_INFO_SCREEN);
          })
          .catch((error) => {
            console.log("on-boarding firebase error", error);
            // interpret error and maybe display something on the UI
          })
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        console.log("Error loadSharedModule", err);
      });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.infoBoxThemeColor} />
      </View>
    );
  }
  return <DashboardScreen navigation={props.navigation} />;
}
