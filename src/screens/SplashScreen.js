import React, { Component } from "react";
import { connect } from "react-redux";
import { Linking, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import { getDeeplink } from "../models/modules";
import { buildVariants, deeplinkPaths } from "../constants/strings";
import * as Analytics from "../services/Analytics";
import ENV from "../constants/Env";
import store from "../store";

class SplashScreen extends Component {
  componentDidUpdate(prevProps) {
    if (
      prevProps.isUserLoggedIn !== this.props.isUserLoggedIn &&
      this.props.isUserLoggedIn
    ) {
      this.props.navigation.navigate("Modules");
    }
  }
  async componentDidMount() {
    let user = firebase.auth().currentUser;
    /* if (user) {
      user = JSON.parse(user);
    } */
    let { path, queryParams, url } = getDeeplink();

    Analytics.track(Analytics.events.OPEN_APP);
    //heartFlow feature when user not logged In
    if (
      path === deeplinkPaths.SUBSCRIBE_CHANNEL &&
      queryParams &&
      queryParams.code &&
      !user
    ) {
      try {
        Linking.openURL(url);
      } catch (e) {
        console.log(e);
      }
    } else if (
      path === deeplinkPaths.ENTERPRISE &&
      queryParams &&
      queryParams.email &&
      user
    ) {
      user = null;
      this.signOutUser();
    } else if (
      path === deeplinkPaths.CDS &&
      queryParams &&
      queryParams.bypassCredential &&
      user
    ) {
      ENV.BUILD_VARIANT === buildVariants.COLUMBIA
        ? this.props.navigation.navigate("Authors")
        : this.props.navigation.navigate("SignUp");
      return;
    }

    if (user) {
      if (user.isByPassUser) {
        const prev = await AsyncStorage.getItem("previousLogin");
        if (prev) {
          user.email = prev;
          user.isByPassUser = null;
          await AsyncStorage.setItem("user", JSON.stringify(user));
        } else {
          user = null;
          this.signOutUser();
        }
      }
    }
    if (user) {
      Analytics.identify(user.email, {
        "last seen date": new Date().toString(),
      });
      Analytics.track(Analytics.events.AUTO_LOGIN);
      if (this.props.isUserLoggedIn) {
        this.props.navigation.navigate("Modules");
      } else {
        store.dispatch({
          type: "SET_IS_USER_LOGGED_IN",
          data: true,
        });
      }
    } else {
      store.dispatch({
        type: "SET_IS_USER_LOGGED_IN",
        data: false,
      });
      ENV.BUILD_VARIANT === buildVariants.COLUMBIA
        ? this.props.navigation.navigate("Authors")
        : this.props.navigation.navigate("SignUp");
    }
  }

  async signOutUser() {
    await firebase.auth().signOut();
    Analytics.track(Analytics.events.CLICK_SIGN_OUT);
    Analytics.reset();
    await AsyncStorage.removeItem("user");
  }

  render() {
    return null;
  }
}

export default connect((state) => ({
  isUserLoggedIn: state.persist.isUserLoggedIn,
}))(SplashScreen);
