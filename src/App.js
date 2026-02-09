import React from "react";
import { Notifications } from "expo";
//import * as Permissions from "expo-permissions";
import Constants from "expo-constants";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import { StyleSheet, Platform, StatusBar, LogBox } from "react-native";
import * as Linking from "expo-linking";
import { connect, Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";
import remoteConfig from "@react-native-firebase/remote-config";

import { testLink } from "../deepLinkTest";
import { deepLinkCallback } from "./models/modules";
import Sidebar from "./modals/Sidebar";
import store, { persistor } from "./store";
import crashlytics from "@react-native-firebase/crashlytics";
import { config } from "./auth/config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NavigationContainer from "./services/NavigationContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildVariants, LIVE_DB, STAGING_DB } from "./constants/strings";
import { getDatabaseInstance } from "./services/helper";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.urlHandlerSubscription = Linking.addEventListener(
      "url",
      this.handleOpenURL
    );

    LogBox.ignoreAllLogs();
  }

  //exp://127.0.0.1:19000/--/abg?targetModule=abg&data%255B0%255D%255Bcode%255D=2744-1&data%255B0%255D%255Bvalue%255D=7.1&data%255B1%255D%255Bcode%255D=2019-8&data%255B1%255D%255Bvalue%255D=20&data%255B2%255D%255Bcode%255D=2028-9&data%255B2%255D%255Bvalue%255D=18&data%255B3%255D%255Bcode%255D=2951-2&data%255B3%255D%255Bvalue%255D=140&data%255B4%255D%255Bcode%255D=2075-0&data%255B4%255D%255Bvalue%255D=97

  handleOpenURL = (event) => {
    if (!event || !event.url) {
      return;
    }
    if (event.url.includes("https://avomd.page.link")) {
      return;
    }
    //event.preventDefault;
    //console.log("handleOpenURL123", JSON.stringify(event));
    //console.log("handleOpenURL", event.url);
    //const { path, queryParams } = Linking.parse(event.url);
    //if (path) {
    // if (path !== "" || Object.keys(queryParams).length > 0)

    // Handle different deeplink "paths" to methods
    // if (path === null || queryParams === undefined) return;
    // else if (path === "testmodule") {
    console.log("*** RECEIVED OPEN URL EVENT ***", event);
    // let data = Linking.parse(event.url);
    //this.setState({ redirectData: data });
    //this.setState({ state: this.state });
    //Linking.getInitialURL().then(deepLinkCallback(event.url));
    this.setState({ deeplink: event.url });
    deepLinkCallback(event.url);
  };

  handleDeepLinkingRequests = () => {
    Linking.getInitialURL().then((url) => deepLinkCallback(url));
  };

  syncRemoteConfig = async () => {
    remoteConfig()
      .setDefaults({
        columbia_delete_user_feature_enabled: true,
      })
      .then(() => remoteConfig().fetchAndActivate())
      .then((fetchedRemotely) => {
        if (fetchedRemotely) {
          console.log("Configs were retrieved from the backend and activated.");
        } else {
          console.log(
            "No configs were fetched from the backend, and the local configs were already activated"
          );
        }
      });
  };

  async componentDidMount() {
    this.syncRemoteConfig();

    this.unsubscribeDynamicLink = dynamicLinks().onLink((link) =>
      deepLinkCallback(link?.url)
    );

    let urlState = "";
    let { cds, testmodule, enterprise, subscribeChannel } = testLink; // All deeplink paths
    const currentDeeplink = cds;
    if (testLink.usingDeepLinkTest && testLink.pureJS) {
      let deepLink = this.serialize(currentDeeplink.testingParameters);
      let scheme = "avomd:///";

      let deepLinkURL = scheme + currentDeeplink.path + "?" + deepLink;
      urlState = deepLinkURL;
      deepLinkCallback(deepLinkURL);
    } else if (testLink.usingDeepLinkTest) {
      deepLinkCallback(
        Linking.makeUrl(currentDeeplink.path, currentDeeplink.testingParameters)
      );
    } else {
      Linking.getInitialURL().then((url) => {
        urlState = url;
        if (!url) {
          return;
        }
        if (url.includes("https://avomd.page.link")) {
          return;
        }
        deepLinkCallback(url);
      });

      dynamicLinks()
        .getInitialLink()
        .then((result) => {
          if (result) {
            this.setState({ deeplink: result.url });
            deepLinkCallback(result.url);
          } else {
            Linking.getInitialURL()
              .then((initialUrl) => {
                if (initialUrl) {
                  dynamicLinks()
                    .resolveLink(initialUrl)
                    .then((resolvedLink) => {
                      this.setState({ deeplink: resolvedLink.url });
                      deepLinkCallback(resolvedLink.url);
                    })
                    .catch((error) => {
                      console.warn;
                      crashlytics().recordError(error);
                    });
                }
              })
              .catch((error) => {
                console.warn;
                crashlytics().recordError(error);
              });
          }
        })
        .catch((error) => {
          console.warn;
          crashlytics().recordError(error);
        });
    }
    this.setState({ deeplink: urlState });
  }

  handleAppOpenedWithUrl = async () => {
    const url = await this.getDeeplinkUrl();
    this.setState({ deeplink: url });
    deepLinkCallback(url);
  };
  getDeeplinkUrl = async () => {
    try {
      const url = await Promise.all([
        Linking.getInitialURL(),
        dynamicLinks().getInitialLink(),
      ]);
      return url[1].url || url[0]; // never the other way around (url[0] || url[1])
    } catch (e) {
      console.log("Error getDeeplinkUrl", e);
      crashlytics().recordError(e);
      return null;
    }
  };

  serialize = (params, prefix) => {
    const query = Object.keys(params).map((key, index) => {
      const value = params[key];

      if (params.constructor === Array) key = `${prefix}[${index}]`;
      else if (params.constructor === Object)
        key = prefix ? `${prefix}[${key}]` : key;

      key = encodeURIComponent(key);
      if (typeof value === "object") return this.serialize(value, key);
      else return `${key}=${encodeURIComponent(value)}`;
    });

    return [].concat.apply([], query).join("&");
  };

  componentWillUnmount() {
    this.unsubscribeDynamicLink && this.unsubscribeDynamicLink();

    this.urlHandlerSubscription && this.urlHandlerSubscription.remove();
  }

  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      const token = await Notifications.getExpoPushTokenAsync();
      getDatabaseInstance()
        .ref(
          `users/${firebase.auth().currentUser.email}/expoPushToken`.replace(
            /[@.]/g,
            "_"
          )
        )
        .set(token);
      this.setState({ expoPushToken: token });
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.createChannelAndroidAsync("default", {
        name: "default",
        sound: true,
        priority: "max",
        vibrate: [0, 250, 250, 250],
      });
    }
  };

  getActiveRouteName = (navigationState) => {
    if (!navigationState) return null;
    const route = navigationState.routes[navigationState.index];
    // Parse the nested navigators
    if (route.routes) return this.getActiveRouteName(route);
    return route.routeName;
  };

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GestureHandlerRootView style={styles.container}>
            <StatusBar barStyle={"dark-content"} />
            {/*<Text style={{ color: "black", marginTop: 50 }}>Deeplink: {JSON.stringify(store.getState().general.deeplink)}</Text>*/}
            <NavigationContainer
              getActiveRouteName={this.getActiveRouteName}
            />
          </GestureHandlerRootView>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  loadingView: {
    height: "100%",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  fbContainer: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});
