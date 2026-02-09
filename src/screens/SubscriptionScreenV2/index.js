import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";

import React, { Component } from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { selectors } from "../../store";
import {
  initModules,
  setDefaultStorage,
  syncAllModules,
} from "../../models/modules";
import * as Analytics from "../../services/Analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Design from "./design";
import crashlytics from "@react-native-firebase/crashlytics";
import messaging from "@react-native-firebase/messaging";
import { getDatabaseInstance } from "../../services/helper";

export const TOPIC_POSTFIX = "_topic";

class SubscriptionScreenV2 extends Component {
  state = {};
  defaultState = {
    channelName: "",
    channelInvitationCode: "",
    isSearchEnabled: true,
    keyword: null,
  };

  UNSAFE_componentWillMount() {
    this.setState(this.defaultState);
  }

  async componentDidMount() {
    await this.requestUserPermission();
    if (this.props.route.params?.browseChannel) {
      this.setState((prevState) => {
        return { isSearchEnabled: !prevState.isSearchEnabled, keyword: null };
      });
    }

    this.setState({ startTimestamp: new Date().getTime() });
    Analytics.track(Analytics.events.VIEW_SUBSCRIPTION_SCREEN);
    this.user = firebase.auth().currentUser;
    const { allChannels } = this.props;
    const genricChannels =
      allChannels &&
      Object.values(allChannels).filter(
        (e) =>
          e != null &&
          e.publicity === "public" &&
          !e.assignedTeams &&
          !e.associatedDomains
      );

    //await syncAllModules();
    this.setState({ genricChannels });
    // don't need any more this function module title already set in whitelist Obj getChannelDescription
    //await syncAllModules();
    try {
      getDatabaseInstance()
        .ref(`users/${this.user.uid}/teams`)
        .on("value", async (teamsSnapshot) => {
          let teams = teamsSnapshot.val();
          this.updateInstitutionChannels(teams, allChannels);
          this.user.teams = teams;
          await AsyncStorage.setItem("user", JSON.stringify(this.user));
        });
    } catch (err) {
      crashlytics().recordError(err);
      console.log("FIREBASE ERROR", err);
      if (this.user.teams) {
        this.updateInstitutionChannels(this.user.teams, allChannels);
      }
    }
    //assignedTeams, associatedDomains

    await setDefaultStorage();
  }

  requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  updateInstitutionChannels = (teams, allChannels) => {
    let institutionalChannels;
    let splittedEmail = this.user.email.split("@"); // need to update

    institutionalChannels =
      allChannels &&
      Object.values(allChannels).filter(
        (e) =>
          e != null &&
          ((e.associatedDomains &&
            splittedEmail.length > 0 &&
            e.associatedDomains.includes(splittedEmail[1])) ||
            (e.assignedTeams &&
              teams &&
              e.assignedTeams.filter((team) => teams.indexOf(team) >= 0)
                .length > 0))
      );

    this.setState({ institutionalChannels });
  };

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };

  subscribeToChannel = async (channelName, channelInvitationCode) => {
    const channelToSubscribe = this.props.allChannels[channelName];
    if (!channelToSubscribe) {
      const errorMsg = "Requested channel to be added does not exist";
      Alert.alert(errorMsg);

      Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL_ERROR, {
        "channel name": channelName,
        "invitation code": channelInvitationCode ? channelInvitationCode : null,
        "is private":
          channelToSubscribe.invitationCode !== null &&
          channelToSubscribe.invitationCode !== "",
        error: errorMsg,
      });

      this.setState(this.defaultState);
      return;
    }
    if (
      channelToSubscribe.invitationCode !== null &&
      channelToSubscribe.invitationCode !== "" &&
      channelToSubscribe.invitationCode !== channelInvitationCode
    ) {
      const errorMsg =
        "Requested private channel does not have the correct code";
      Alert.alert(errorMsg);

      Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL_ERROR, {
        "channel name": channelName,
        "invitation code": channelInvitationCode ? channelInvitationCode : null,
        "is private":
          channelToSubscribe.invitationCode !== null &&
          channelToSubscribe.invitationCode !== "",
        error: errorMsg,
      });

      this.setState(this.defaultState);
      return;
    }
    if (this.props.activeChannels.includes(channelName)) {
      const errorMsg = "Already subscribed to channel";
      Alert.alert(errorMsg);

      Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL_ERROR, {
        "channel name": channelName,
        "invitation code": channelInvitationCode ? channelInvitationCode : null,
        "is private":
          channelToSubscribe.invitationCode !== null &&
          channelToSubscribe.invitationCode !== "",
        error: errorMsg,
      });

      this.setState(this.defaultState);
      return;
    }
    this.props.dispatch({
      type: "SET_CHANNELS",
      channelName: "activeChannels",
      data: [...this.props.activeChannels, channelName],
    });
    const topic = channelName + TOPIC_POSTFIX;
    messaging()
      .subscribeToTopic(topic)
      .then(() => console.log("Subscribed to topic! ", topic))
      .catch((err) => console.log("topic Subscription Error : ", err));

    Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL, {
      "channel name": channelName,
      "is private":
        channelToSubscribe.invitationCode !== null &&
        channelToSubscribe.invitationCode !== "",
      duration: this.duration(),
    });
    this.setState(this.defaultState);
    this.updateFirebaseWithChannels();
    initModules();

    Analytics.identify(this.user.email, {
      "active channels": this.props.activeChannels,
    });
  };

  updateFirebaseWithChannels = () => {
    if (!this.user.isByPassUser) {
      setTimeout(async () => {
        try {
          getDatabaseInstance()
            .ref(`users/${this.user.uid}/subscriptions`)
            .set(this.props.activeChannels);
        } catch (e) {
          crashlytics().recordError(e);
          console.log("Update firebase db error", e);
        }
      });
    }
  };

  removeChannel = async (channel) => {
    //console.log("REMOVE CHANNEL", channel);
    Analytics.track(Analytics.events.CLICK_REMOVE_CHANNEL, {
      "channel name": channel.code,
      "is private": channel.invitationCode && channel.invitationCode !== "",
    });
    if (channel.code === "test") {
      await AsyncStorage.removeItem("test_channel_local");
    }
    this.props.dispatch({
      type: "SET_CHANNELS",
      channelName: "activeChannels",
      data: [
        ...this.props.activeChannels.filter(
          (currentChannel) => currentChannel !== channel.code
        ),
      ],
    });
    this.updateFirebaseWithChannels();
    const topic = channel.code + TOPIC_POSTFIX;
    messaging()
      .unsubscribeFromTopic(topic)
      .then(() => console.log("Topic Unsubscribed ! ", topic))
      .catch((err) => console.log("Error Topic Unsubscribed  : ", err));
  };

  resetSubscriptions = () => {
    Alert.alert(
      "Reset subscriptions",
      "Are you sure you want to reset subscriptions?",
      [
        {
          text: "Yes",
          onPress: async () => {
            Analytics.identify(this.user.email, {
              "reset subscriptions": new Date().toString(),
            });
            Analytics.track(Analytics.events.CONFIRM_RESET_SUBSCRIPTIONS);

            const releaseConfigurations = require("../../../releaseConfigurations.json");
            this.props.dispatch({
              type: "SET_RELEASE_TARGET",
              data: releaseConfigurations.activeReleaseTarget,
            });
            this.props.dispatch({
              type: "SET_CHANNELS",
              channelName: "activeChannels",
              data: releaseConfigurations.targets[
                releaseConfigurations.activeReleaseTarget
              ].defaultInitialChannels,
            });
          },
        },
        {
          text: "No",
          onPress: () => {
            Analytics.track(Analytics.events.CANCEL_RESET_SUBSCRIPTIONS);
          },
        },
      ]
    );
  };

  _matchTextToKeyword = (text) => {
    if (this.state.keyword) {
      return text.toLowerCase().includes(this.state.keyword.toLowerCase());
    } else {
      return false;
    }
  };

  onSearchText = (text) => {
    this.setState({ keyword: text });
    Analytics.track(Analytics.events.SEARCH_CHANNELS, {
      text,
    });
  };

  onChannelAddPress = (channel) => {
    if (this.props.activeChannels.includes(channel.code)) {
      this.removeChannel(channel);
      return;
    }
    if (channel.invitationCode && channel.invitationCode !== "") {
      this.privateChannelCode = channel.code;
      this.setState({ showPasswordInput: true, invitationCode: null });
    } else this.subscribeToChannel(channel.code);
  };

  onChangePassword = (text) => {
    this.setState({ invitationCode: text });
  };

  onDonePress = () => {
    if (this.state.invitationCode && this.state.invitationCode !== "") {
      this.subscribeToChannel(
        this.privateChannelCode,
        this.state.invitationCode
      );
      this.setState({ showPasswordInput: false });
    }
  };

  getChannelDescription = (channel) => {
    // let { allModules } = this.props;
    // if (!allModules) return "No module linked";
    // let description;
    // if (channel.description && channel.description !== "") {
    //   description = channel.description;
    // } else {
    //   if (channel.whiteList && channel.whiteList !== "") {
    //     description = channel.whiteList
    //       .map(
    //         (moduleCode) =>
    //           moduleCode &&
    //           moduleCode !== "" &&
    //           allModules[moduleCode] &&
    //           allModules[moduleCode].title
    //       )
    //       .reduce((acc, moduleName) =>
    //         moduleName ? acc + ", " + moduleName : ""
    //       );
    //   }
    // }
    // if (!description || description === "") {
    //   description = "No module linked";
    // }
    // return description;
    if (channel.description) return channel.description;
    const moduleNames = channel.whitelistObj
      ?.filter((item) => Boolean(item?.title))
      ?.map((item) => item.title)
      ?.join(", ");
    return moduleNames ?? "No module linked";
  };

  addSubsButtonPress = () => {
    this.toggleSearchState();
  };

  toggleSearchState = () => {
    this.setState((prevState) => {
      return { isSearchEnabled: !prevState.isSearchEnabled, keyword: null };
    });
  };

  setSearchInputRef = (ref) => {
    if (ref) this.searchInputRef = ref;
  };

  clearSearch = () => {
    this.searchInputRef.clear();
    this.setState({ keyword: null });
  };

  render() {
    const { navigation, myChannels, allChannels, activeChannels } = this.props;
    const { channelName, channelInvitationCode } = this.state;

    return (
      <Design
        _this={this}
        screenState={this.state}
        navigation={navigation}
        myChannels={myChannels}
        allChannels={allChannels}
        activeChannels={activeChannels}
        channelName={channelName}
        channelInvitationCode={channelInvitationCode}
      />
    );
  }
}

export default connect((state) => ({
  myChannels: selectors.myChannels(state),
  activeChannels: state.persist.channels.activeChannels,
  allChannels: state.persist.channels.allChannels,
  modules: state.persist.data.modules,
  allModules: state.persist.data.allModules,
}))(SubscriptionScreenV2);
