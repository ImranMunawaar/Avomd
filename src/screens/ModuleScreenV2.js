import React, { Component } from "react";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/functions";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { connect } from "react-redux";
import {
  initModules,
  setActiveModule,
  isValid,
  setDefaultStorage,
  getDeeplink,
  setDeeplink,
  getReducedModules,
  getReducedCalculators2,
} from "../models/modules";
import { selectors } from "../store";
import Colors from "../constants/Colors";

import {
  buildVariants,
  deeplinkPaths,
  fontFamily,
  sortTypes,
} from "../constants/strings";
import * as Analytics from "../services/Analytics";
import _ from "lodash";
import ModuleItem from "../components/moduleItem";
import ChannelsEmptyState from "../components/dashboardScreen/ChannelsEmptyState";
import {
  getWidth,
  getHeight,
  getDatabaseInstance,
  sortArray,
  sortFavorite,
} from "../services/helper";
import { getStatusBarHeight } from "../services/iphoneXHelper";
import Env from "../constants/Env";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import crashlytics from "@react-native-firebase/crashlytics";
import { getModuleClickParams } from "../models/deepLinkActions";
import SubscribeChannelModal, {
  selectedChannelAtom,
} from "../modals/subscribeChannelModal";
import Sidebar from "../modals/Sidebar";
import SortModal from "../modals/SortModal";
import FilterByTagsModal, {
  tagCodeArrAtom,
  tagResetAtom,
} from "../modals/FilterByTagsModal";
import { SvgXml } from "react-native-svg";
import svgs from "../constants/svgs";
import SearchHistory from "../components/SearchHistory";
import moment from "moment";
import { useAtomValue, useSetAtom } from "jotai";

const tagItems = [{ title: "All", code: "all" }].concat([
  { title: "Labs/Electrolytes", code: "labs" },
  { title: "Infection", code: "infection" },
  { title: "Cardiology", code: "cardiology" },
]);

class ModuleScreen extends Component {
  state = {
    modulesLoading: false,
    keyword: "",
    debounceKeyword: "",
    tagItemToggle: {},
    gotoEnabled: true,
    isOpenChannelModal: false,
    isOpenSortModal: false,
    selectedChannel:
      Env.BUILD_VARIANT === buildVariants.COLUMBIA ? Env.CHANNELS[0] : null,
    isSearchInputFocused: null,
    isSideMenuOpen: null,
    sortType: sortTypes.DEFAULT,
    userActivity: null,
    isOpenFilterByTags: false,
    tags: [],
  };

  constructor(props) {
    super(props);

    this.user = firebase.auth().currentUser;
  }

  _loadModules = async () => {
    this.setState({ modulesLoading: true });
    await setDefaultStorage();
    await initModules();
    this.getUserActivity();
    this.setState({
      modulesLoading: false,
    });
    const { activeChannels } = this.props;
    if (this.user.email) {
      Analytics.identify(this.user.email, {
        "active channels": activeChannels,
      });
    }
  };

  getUserActivity() {
    getDatabaseInstance()
      .ref("user_activity/" + this.user.uid)
      .once("value")
      .then((user_activity) => {
        this.setState({ userActivity: user_activity.val() });
      });
  }

  getHeartFlowLink() {
    getDatabaseInstance()
      .ref("/users/" + this.user.uid)
      .once("value")
      .then((user) => {
        this.props.dispatch({
          type: "SET_HEART_FLOW_LINK",
          data: user.val().heartflowLink,
        });
      });
  }

  async componentWillUnmount() {
    let { path, queryParams } = getDeeplink();
    const deeplink = {
      path: path,
      queryParams: {
        ...queryParams,
        subscriptions: null,
        targetModule: null,
        isFromHeartFlow: null,
      },
    };
    setDeeplink(deeplink);
  }

  async componentDidMount() {
    let { queryParams } = getDeeplink();

    this.getUserActivity();
    this.addHeartFlowlink();
    this.updatedUserInfo();
    if (Env.BUILD_VARIANT === buildVariants.COLUMBIA) {
      this.discardFirebaseUpdates = true;
      this.subscribeChannels(Env.CHANNELS);
    } else {
      this.addHeartFlowlink();
      this.getHeartFlowLink();
      this.discardFirebaseUpdates = this.user.isByPassUser;
      const { activeChannels } = this.props;

      /**Listening Subscriptions updates on firebase**/
      getDatabaseInstance()
        .ref(`users/${this.user.uid}/subscriptions`)
        .on("value", (subsSnapshot) => {
          try {
            let channelsToSubscribe = subsSnapshot.val();
            if (!this.discardFirebaseUpdates) {
              let activeChannelsToSubscribe = [...activeChannels];
              channelsToSubscribe = _.union(
                channelsToSubscribe,
                activeChannelsToSubscribe
              );
            }

            //Should handle push notification topics.

            this.subscribeChannels(
              channelsToSubscribe ? channelsToSubscribe : []
            );
            this.handleDeeplink();
            setTimeout(() => {
              const deeplink = {
                path: null,
                queryParams: {
                  code: null,
                  subscriptions: null,
                  targetModule: queryParams?.isFromHeartFlow
                    ? queryParams.targetModule
                    : null,
                },
              };
              setDeeplink(deeplink);
            });
          } catch (err) {
            crashlytics().recordError(err);
            console.log("FIREBASE ERROR", err);
          }
        });

      Analytics.identify(this.user.email, {
        "active channels": activeChannels,
      });
    }
    this.setState({ startTimestamp: new Date().getTime() });
    Analytics.track(Analytics.events.VIEW_MODULE_SCREEN);

    this.setState({ gotoEnabled: false });
    this.handleDeeplink();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let { deeplink, loadingData, enabledModules } = this.props;
    const isSurveyDone = this.props.route.params?.isSurveyDone;
    if (deeplink.updateTimestamp !== prevProps.deeplink.updateTimestamp) {
      this.handleDeeplink();
    }

    if (prevProps.loadingData && !loadingData) {
      if (enabledModules.includes(deeplink?.queryParams?.targetModule)) {
        this.gotoModule(deeplink?.queryParams?.targetModule);
      }
    }
    //open if dynamic link have one module
    if (!loadingData) {
      if (
        enabledModules.includes(deeplink?.queryParams?.targetModule) &&
        isSurveyDone
      ) {
        this.gotoModule(deeplink?.queryParams?.targetModule);
      }
    }
  }

  updatedUserInfo = async () => {
    let currentUser = firebase.auth().currentUser;
    const { params } = this.props.route;
    let userUid = currentUser.uid;
    await getDatabaseInstance()
      .ref()
      .child("users")
      .child(userUid)
      .once("value", (snapshot) => {
        let userInfo = snapshot.val();
        userInfo.name =
          params?.userName && params?.userName != ""
            ? params?.userName
            : userInfo?.name != undefined
            ? userInfo?.name
            : userInfo?.firstName != undefined
            ? userInfo?.firstName
            : userInfo?.firstName != undefined &&
              userInfo?.lastName != undefined
            ? userInfo?.firstName + " " + userInfo?.lastName
            : this.user?.name;
        userInfo.email =
          userInfo?.email != undefined ? userInfo?.email : this.user?.email;
        userInfo.uid =
          userInfo?.uid != undefined ? userInfo?.uid : this.user?.uid;
        this.setState({ userInfo });
      });
  };
  setUserActivity = async ({ id, type, lastViewedTimeStamp }) => {
    const uid = this?.user?.uid;
    if (!uid) return console.error("user not signed in");
    const userPath = `user_activity/${uid}/${type}/${id}`;
    const p2 = getDatabaseInstance()
      .ref(userPath + "/clickCount")
      .transaction((current_value) => {
        if (current_value === null) return 1;
        return current_value + 1;
      });
    const p1 = getDatabaseInstance()
      .ref(userPath + "/lastVisitedAt")
      .set(lastViewedTimeStamp);
    return await Promise.all([p1, p2]);
  };

  handleDeeplink() {
    const { path, queryParams } = getDeeplink();
    const { allChannels, activeChannels } = this.props;
    if (queryParams && queryParams.subscriptions) {
      const prevChannels = activeChannels.filter(
        (channel) => channel !== "avomd_public"
      );
      const channelsToSubscribe = queryParams.subscriptions.filter(
        (channelName) =>
          allChannels[channelName] &&
          (path === deeplinkPaths.ENTERPRISE ||
            !activeChannels.includes(channelName))
      );
      if (channelsToSubscribe.length > 0) {
        if (path === deeplinkPaths.ENTERPRISE) {
          const allSubscription = _.union(channelsToSubscribe, prevChannels);
          this.subscribeChannels(allSubscription);
        } else if (path === deeplinkPaths.CDS)
          this.subscribeChannels([...activeChannels, ...channelsToSubscribe]);
      }
    }
    if (
      path === deeplinkPaths.SUBSCRIBE_CHANNEL &&
      queryParams &&
      queryParams.code
    ) {
      const subscribeChannelsCodes = Object.values(
        queryParams.code.split(",")
      ).filter(
        (subscribeChannelsCode) =>
          allChannels[subscribeChannelsCode] &&
          !activeChannels.includes(subscribeChannelsCode)
      );
      if (subscribeChannelsCodes.length >= 1) {
        this.discardFirebaseUpdates = false;
        this.addReferences(queryParams, true);
        this.subscribeChannels([...activeChannels, ...subscribeChannelsCodes]);
      }
    }
  }

  async buildLink() {
    let channelCode = null;
    await getDatabaseInstance()
      .ref("/users/" + this.user.uid)
      .once("value")
      .then((user) => {
        channelCode = user.val().qrSharingChannel;
      });
    if (channelCode) {
      const url =
        "https://live.avomd.io/subscribeChannel?code=" +
        channelCode +
        "&referredFrom=" +
        this.user.email;
      const link = await dynamicLinks().buildShortLink(
        {
          link: url,
          domainUriPrefix: "https://avomd.page.link",
          navigation: {
            forcedRedirectEnabled: false,
          },
          android: {
            packageName: "com.avomd.client",
          },
          ios: {
            bundleId: "com.synapticmed.siabg2016",
            appStoreId: "1114334146",
          },
        },
        dynamicLinks.ShortLinkType.SHORT
      );
      return link;
    }
  }

  addHeartFlowlink = async () => {
    const link = await this.buildLink();
    if (link) {
      getDatabaseInstance()
        .ref("/users/" + this.user.uid)
        .once("value")
        .then((snapshot) => {
          if (snapshot.val().qrSharingChannel) {
            var db = getDatabaseInstance();
            const basestr = "users/" + this.user.uid + "/";
            var writer = db.ref(basestr + "heartflowLink");
            if (
              !snapshot.val().heartflowLink ||
              snapshot.val().heartflowLink !== link
            ) {
              writer.set(link);
              this.getHeartFlowLink();
            }
          }
        });
    }
  };

  async subscribeChannels(channels) {
    this.props.dispatch({
      type: "SET_CHANNELS",
      channelName: "activeChannels",
      data: channels,
    });

    if (!this.discardFirebaseUpdates) {
      this.discardFirebaseUpdates = true;
      this.updateFirebaseWithChannels();
    }
    await setDefaultStorage();
    await initModules();
    if (this.user)
      Analytics.identify(this.user.email, {
        "active channels": channels,
      });
  }

  updateFirebaseWithChannels = () => {
    setTimeout(() => {
      try {
        getDatabaseInstance()
          .ref(`users/${this.user.uid}/subscriptions`)
          .set(this.props.activeChannels);
      } catch (e) {
        crashlytics().recordError(e);
        console.log("FIREBASE_DB_ERROR", e);
      }
    });
  };

  addUserReferred = async (email, channelCode) => {
    const updateReferringData = firebase
      .functions()
      .httpsCallable("updateReferringData");
    updateReferringData({
      referrerEmail: email,
      channelCode: channelCode,
      uid: this.user.uid,
    })
      .then((result) => {
        console.log("result : ", result.data.response);
      })
      .catch((error) => {
        const code = error.code;
        const message = error.message;
        const details = error.details;
        console.log(
          "Error code : ",
          code,
          "  message : ",
          message,
          " details : ",
          details
        );
      });
  };

  addReferredFrom = async (email, channelCode) => {
    if (email) {
      getDatabaseInstance()
        .ref("/users/" + this.user.uid)
        .once("value")
        .then((snapshot) => {
          Analytics.identify(this.user.email, {
            referredFrom: email,
            qrChannel: channelCode,
          });
          var db = getDatabaseInstance();
          const basestr = "users/" + this.user.uid + "/" + "referredFrom" + "/";
          if (snapshot.val().referredFrom) {
            if (!snapshot.val().referredFrom[channelCode]) {
              var writer = db.ref(basestr + channelCode);
              writer.set(email);
            }
          } else {
            var writer = db.ref(basestr + channelCode);
            writer.set(email);
          }
        });
    }
  };

  addReferences = async (queryParams, isFromDeepLink = false) => {
    if (isFromDeepLink) {
      this.addReferredFrom(queryParams.refererId, queryParams.code);
      this.addUserReferred(queryParams.refererId, queryParams.code);
    }
  };

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };

  gotoModule(key) {
    console.log("gotoModule", key);
    const { deeplink } = this.props;
    const lastViewedTimeStamp = Date.now();
    const userActivity = { ...this.state.userActivity };

    let isCalculator = false;
    const module = this.props.modules[key];
    const calculator2 = this.props.calculators2[key];

    if (isValid(module)) {
      module.lastViewedTimeStamp = lastViewedTimeStamp;
      if (deeplink.queryParams && deeplink.queryParams.targetModule) {
        const deeplinkClone = _.cloneDeep(deeplink);

        deeplinkClone.queryParams.targetOpened =
          deeplinkClone.queryParams.targetModule;
        deeplinkClone.queryParams.targetModule = null;

        this.props.dispatch({
          type: "SET_DEEPLINK",
          data: deeplinkClone,
        });
      }
      setActiveModule(key);
      if (module.contents.dashboard)
        this.props.navigation.navigate("Dashboard");
      else {
        this.props.navigation.navigate("Content", {
          activePages: {
            dominant: module.contents.pages,
            dependent: [],
          },
          variables: {},
        });
      }
    } else if (isValid(calculator2)) {
      calculator2.lastViewedTimeStamp = lastViewedTimeStamp;
      isCalculator = true;

      this.props.navigation.navigate("Calculator2", {
        calculator: calculator2,
        variables: {},
        isFromModuleScreen: true,
      });
    }

    const type = isCalculator ? "calculators" : "modules";
    const data = isCalculator ? calculator2 : module;

    if (!userActivity[type]) {
      userActivity[type] = {};
      userActivity[type][data.code] = {};
    }

    if (!userActivity[type][data.code]) {
      userActivity[type][data.code] = {};
    }
    userActivity[type][data.code].lastVisitedAt = lastViewedTimeStamp;

    this.setState({ userActivity: userActivity });
    this.setUserActivity({
      id: key,
      type: isCalculator ? "calculator" : "module",
      lastViewedTimeStamp: lastViewedTimeStamp,
    })
      .then((responses) => {
        //console.log("responses", responses[0].val(), responses[1].val());
      })
      .catch((err) => console.log("setUserActivity error", err));

    Analytics.track(Analytics.events.CLICK_PROTOCOL, {
      ...getModuleClickParams(key, isCalculator),
      "time to locate": this.duration(),
    });
  }

  getLoadingText() {
    const { loadedData } = this.props;
    const loadedDataCount = Object.keys(loadedData).filter(
      (key) => loadedData[key] === true
    ).length;
    const totalDataCount = Object.keys(loadedData).length;
    const remainingData = Object.keys(loadedData).filter(
      (key) => loadedData[key] !== true
    );
    const loadingPercentage = Math.round(
      (loadedDataCount / totalDataCount) * 100
    );
    const modulesText =
      remainingData.length > 0 ? `\n\n${remainingData.join("\n")}` : "";
    return totalDataCount === 0
      ? "Checking for updates..."
      : `Loading: ${loadingPercentage} %${modulesText}`;
  }
  debounce_fun = _.debounce(function () {
    // console.log("Function debounced after 1000ms!");
    this.setState({ debounceKeyword: this.state.keyword });
  }, 1000);
  _onChangeSearchText = (text, setHistoryKeyword = false) => {
    if (setHistoryKeyword) {
      this.setState({ debounceKeyword: this.state.keyword });
    } else {
      this.debounce_fun();
    }

    if (text === "") {
      this.setState({ keyword: null });
    } else this.setState({ keyword: text });
  };

  _matchTextToKeyword = (text) => {
    if (this.state.keyword) {
      return text.toLowerCase().includes(this.state.keyword.toLowerCase());
    } else {
      return true;
    }
  };

  setSearchInputRef = (ref) => {
    if (ref) this.searchInputRef = ref;
  };

  clearSearch = () => {
    this.searchInputRef.clear();
    this.setState({ keyword: null, debounceKeyword: null });
  };

  applyTagsToFilter(module) {
    // All (No tags selected)
    if (Object.keys(this.state.tagItemToggle).length === 0) {
      return true;
    }

    var anyTrue = false;

    for (var key in this.state.tagItemToggle) {
      if (this.state.tagItemToggle[key]) {
        anyTrue = true;
      }
    }

    if (!anyTrue) {
      return true;
    }

    if (module.tags) {
      for (let index = 0; index < module.tags.length; index++) {
        const tag = module.tags[index];
        for (var moduleKey in this.state.tagItemToggle) {
          const targetTag = tagItems[moduleKey];
          if (
            this.state.tagItemToggle[moduleKey] === true &&
            targetTag.code.trim() === tag.trim()
          ) {
            return true;
          }
        }
      }
      return false;
    } else {
      return false;
    }
  }
  closeChannelModal = () => {
    this.setState({ isOpenChannelModal: false });
  };
  closeMenuModal = () => {
    this.setState({ isSideMenuOpen: false });
  };
  closeSortModal = (sortMode) => {
    if (sortMode) this.setState({ sortType: sortMode });
    this.setState({ isOpenSortModal: false });
  };
  closeFilterByTagsModal = () => {
    this.setState({ isOpenFilterByTags: false });
  };
  setSelectedChannel = (channelCode) => {
    this.setState({ selectedChannel: channelCode });
  };

  focusedInput = (ref) => {
    this[ref].setNativeProps({
      style: {
        borderWidth: 1,
        borderColor: Colors.button,
      },
    });
    this[ref].focus();
  };

  blurredInput = (ref) => {
    this[ref].setNativeProps({
      style: {
        borderWidth: 0,
        borderColor: "transparent",
      },
    });
  };

  setModuleFavorite = async ({ id, type, favorite }) => {
    try {
      const uid = this?.user?.uid;
      if (!uid) return console.error("user not signed in");
      const userPath = `user_activity/${uid}/${type}/${id}/favorite`;
      getDatabaseInstance().ref(userPath).set(favorite);
    } catch (e) {
      crashlytics().recordError(e);
      console.log("setModuleFavorite error", e);
    }
  };

  toggleModuleFavorite = (favoriteModule) => {
    const userActivity = { ...this.state.userActivity };
    const key = favoriteModule.code;
    const { modules, calculators2 } = this.props;
    const favorite = favoriteModule?.favorite ? null : Date.now();

    const calculator2 = calculators2[key];

    const type = isValid(calculator2) ? "calculators" : "modules";
    const data = isValid(calculator2) ? calculator2 : modules[key];

    if (!userActivity[type]) {
      userActivity[type] = {};
      userActivity[type][data.code] = {};
    }
    if (!userActivity[type][data.code]) {
      userActivity[type][data.code] = {};
    }
    userActivity[type][data.code].favorite = favorite;

    this.setState({ userActivity: userActivity });
    this.setModuleFavorite({
      id: key,
      type: type,
      favorite: favorite,
    });
  };

  setTeamCode = (teamCode) => {
    this.setState({ teamCode: teamCode });
  };

  applyTeamCodeToFilter = (finalList, teamCode) => {
    if (!teamCode) {
      return finalList;
    }

    return finalList.filter((item) => item.team === teamCode);
  };

  render() {
    const {
      loadingData,
      enabledModules,
      enabledCalculators2,
      activeChannels,
      navigation,
      allChannels,
      route,
      tags,
      selectedChannel,
      setTagReset,
    } = this.props;

    const {
      keyword,
      debounceKeyword,
      isOpenChannelModal,
      contentVerticalOffset,
      sortType,
      userInfo,
      userActivity,
    } = this.state;

    const { params } = route;

    if (userInfo != undefined && "name" in userInfo)
      userInfo.name =
        params?.userName && params?.userName != ""
          ? params?.userName
          : userInfo?.name;

    const reducedModules = getReducedModules(enabledModules, userActivity);
    const reducedCalculators2 = getReducedCalculators2(
      enabledCalculators2,
      userActivity
    );

    let selectedChannelModules;
    let teamCode;
    if (selectedChannel) {
      const channel = allChannels[selectedChannel];
      teamCode = channel?.team;
      selectedChannelModules = channel?.whitelistObj?.map((obj) => obj.code);
    }

    let finalList = [...reducedModules, ...reducedCalculators2];

    finalList = finalList.filter(
      (listItem) =>
        listItem != null &&
        this._matchTextToKeyword(listItem.title) &&
        this.applyTagsToFilter(listItem)
    );

    if (selectedChannel) {
      finalList = finalList.filter((listItem) =>
        selectedChannelModules?.includes(listItem.code)
      );
      //finalList = this.applyTeamCodeToFilter(finalList, teamCode);
    }

    if (tags && tags.length > 0) {
      finalList = finalList.filter((listItem) => {
        return listItem?.tags?.some((tag) => tags.includes(tag));
      });
    }

    finalList = sortArray(finalList, sortType);
    const favorites = _.remove(finalList, (item) => item.favorite);
    finalList = [...sortFavorite(favorites), ...finalList];

    const renderModuleItem = ({ item, index }) => {
      return (
        <ModuleItem
          module={item}
          onModulePress={(moduleCode) => this.gotoModule(moduleCode)}
          isLast={finalList.length - 1 === index}
          isFirst={index === 0}
          screenState={this.state}
          toggleModuleFavorite={(module) => this.toggleModuleFavorite(module)}
        />
      );
    };

    const keyExtractor = (item, index) => {
      const key = item.sectionTitle ? item.sectionTitle : item.code;
      return key;
    };

    const showClearButton =
      (tags && tags.length > 0) || sortType != sortTypes.DEFAULT;
    return (
      <View style={styles.rootView}>
        <View style={styles.screenView}>
          <View style={styles.headerContainer} iosBarStyle={"dark-content"}>
            <View style={styles.innerHeaderView}>
              <View style={{ flex: 1, alignItems: "flex-start" }}>
                {Env.BUILD_VARIANT === buildVariants.CLIENT && (
                  <TouchableOpacity
                    accessibilityLabel="allChannels"
                    accessible
                    onPress={() => {
                      this.setState({ isOpenChannelModal: true });
                    }}
                    style={styles.selectedChannelView}
                  >
                    <Text numberOfLines={1} style={styles.selectedChannelText}>
                      {selectedChannel
                        ? allChannels[selectedChannel]?.channelTitle
                        : "All Channels"}
                    </Text>
                    <Image
                      source={require("../images/chevron-down-black.png")}
                      style={styles.chevronDownIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.profileView}
                accessible={true}
                accessibilityLabel="profileSetting"
                onPress={() => {
                  this.setState({ isSideMenuOpen: true });
                }}
              >
                {userInfo != undefined &&
                "name" in userInfo &&
                userInfo.name != "" &&
                userInfo.name != undefined ? (
                  <Text style={styles.profileText}>{userInfo?.name[0]}</Text>
                ) : (
                  <SvgXml
                    xml={svgs.userPlaceHolder}
                    width={getHeight(21)}
                    height={getHeight(21)}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.searchContainer,
                {
                  borderColor: this.state.isSearchInputFocused
                    ? "#08A88E"
                    : "#C5D1D8",
                },
              ]}
            >
              <View style={styles.searchInputContainer}>
                <View style={styles.inputWrapper}>
                  <Image
                    source={{ uri: "searchicon" }}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    testID={"textInputSearchModule"}
                    accessible={true}
                    accessibilityLabel="textInputSearchModule"
                    ref={this.setSearchInputRef}
                    value={this.state.keyword}
                    style={styles.searchInput}
                    onChangeText={this._onChangeSearchText}
                    placeholder={"Search modules"}
                    placeholderTextColor={"#51515140"}
                    onFocus={() =>
                      this.setState({ isSearchInputFocused: true })
                    }
                    onBlur={() =>
                      this.setState({ isSearchInputFocused: false })
                    }
                  />
                </View>
                {keyword && keyword.length > 0 ? (
                  <TouchableOpacity
                    hitSlop={getHeight(10)}
                    onPress={this.clearSearch}
                    style={{
                      backgroundColor: "transparent",
                      marginEnd: getWidth(12),
                      justifyContent: "flex-end",
                    }}
                  >
                    <Image
                      style={styles.searchInputCloseIcon}
                      source={require("../images/crossicon.png")}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            {Env.BUILD_VARIANT === buildVariants.CLIENT && (
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  accessibilityLabel="tagFilter"
                  accessible
                  style={{ flexDirection: "row", marginEnd: getWidth(10) }}
                  onPress={() => {
                    this.setState({ isOpenFilterByTags: true });
                  }}
                >
                  <Image
                    style={[styles.sortChevron, { marginEnd: getWidth(2) }]}
                    source={require("../images/filter.png")}
                  />
                  <Text style={styles.sort}>Tags</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="sortChevron"
                  accessible
                  style={{ flexDirection: "row", marginEnd: getWidth(10) }}
                  onPress={() => {
                    this.setState({ isOpenSortModal: true });
                  }}
                >
                  <Text style={styles.sort}>{this.state.sortType}</Text>
                  <Image
                    style={styles.sortChevron}
                    source={require("../images/chevron-down-green.png")}
                  />
                </TouchableOpacity>
                {showClearButton && (
                  <TouchableOpacity
                    accessibilityLabel="clearFilter"
                    accessible
                    onPress={() => {
                      setTagReset();
                      this.setState({ sortType: sortTypes.DEFAULT });
                    }}
                  >
                    <Text style={styles.sort}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          <ChannelsEmptyState
            activeChannelLength={activeChannels.length}
            loadingData={loadingData}
            moduleListLength={finalList.length}
            keyword={keyword}
            navigation={navigation}
            styles={styles}
          />
          <FlatList
            refreshing={this.state.modulesLoading}
            ref={(ref) => (this.flatListRef = ref)}
            onRefresh={this._loadModules}
            data={finalList}
            windowSize={31}
            renderItem={renderModuleItem}
            keyExtractor={keyExtractor}
            onScroll={(event) => {
              this.setState({
                contentVerticalOffset: event.nativeEvent.contentOffset.y,
              });
            }}
          />
          <SearchHistory
            searchKeyword={debounceKeyword}
            setKeyWord={this._onChangeSearchText}
          />
          {contentVerticalOffset > 100 && (
            <TouchableWithoutFeedback
              onPress={() => {
                if (finalList.length > 0) {
                  this.flatListRef.scrollToIndex({
                    animated: true,
                    index: 0,
                  });
                }
              }}
            >
              <Image
                style={styles.scrollToTopBtn}
                resizeMode={"contain"}
                source={require("../images/scroll-top-button-icon.png")}
              />
            </TouchableWithoutFeedback>
          )}
        </View>

        {loadingData && (
          <View style={styles.loadingIndicatorContainer}>
            <View style={styles.loadingIndicatorBackground} />
            <ActivityIndicator color="white" />
            <Text
              numberOfLines={2}
              style={{ textAlign: "center", color: "white" }}
            >
              {this.getLoadingText()}
            </Text>
          </View>
        )}

        <SubscribeChannelModal
          close={this.closeChannelModal}
          isOpenChannelModal={isOpenChannelModal}
          navigation={navigation}
        />
        <Sidebar
          isOpen={this.state.isSideMenuOpen}
          closeModal={this.closeMenuModal}
          userInfo={userInfo}
          navigation={navigation}
        />
        <SortModal
          isOpen={this.state.isOpenSortModal}
          closeModal={this.closeSortModal}
          sortType={this.state.sortType}
          navigation={navigation}
        />
        {this.state.isOpenFilterByTags && (
          <FilterByTagsModal
            isOpen={this.state.isOpenFilterByTags}
            closeModal={this.closeFilterByTagsModal}
            teamCode={teamCode}
            tags={tags}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  screenView: {
    flex: 2,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    justifyContent: "flex-end",
    paddingTop: getHeight(
      Platform.OS === "ios" ? getStatusBarHeight(true) : 15
    ),
    paddingBottom: getHeight(11),
    zIndex: 500,
  },
  innerHeaderView: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    minHeight: 80,
    marginLeft: 10,
    marginRight: 10,
    marginVertical: 13,
    borderRadius: 8,
  },
  cardItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingLeft: 0,
    paddingRight: 0,
  },
  searchContainer: {
    marginTop: getHeight(10),
    borderWidth: 1,
    marginHorizontal: getWidth(16),
    borderRadius: getHeight(8),
    backgroundColor: "white",
    marginBottom: getHeight(11),
  },
  filterContainer: {
    marginHorizontal: getWidth(16),
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  sort: {
    fontSize: getHeight(14),
    fontWeight: "400",
    color: "#08A88E",
  },
  sortChevron: {
    height: getHeight(16),
    width: getHeight(12),
    marginStart: getWidth(3),
    alignSelf: "center",
  },
  searchInputContainer: {
    alignItems: "center",
    flexDirection: "row",
    height: getHeight(40),
    justifyContent: "space-between",
  },
  emptyStateContainer: {
    ...StyleSheet.absoluteFill,
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    //  zIndex: 999,
  },
  emptyText: {
    textAlign: "center",
    color: "#566267",
    fontWeight: "400",
    fontSize: getHeight(14),
  },
  searchInput: {
    fontSize: getHeight(16),
    paddingStart: getWidth(4),
  },
  searchIcon: {
    height: getHeight(14),
    width: getWidth(17),
    marginStart: getWidth(12),
    resizeMode: "contain",
    tintColor: "#6C7C83",
  },
  searchInputCloseIcon: {
    height: getHeight(16),
    width: getWidth(16),
    resizeMode: "contain",
  },
  loadingIndicatorContainer: {
    ...StyleSheet.absoluteFill,
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  emptyStateBackground: {
    //...StyleSheet.absoluteFill,
    //backgroundColor: "grey",
    opacity: 0.7,
  },
  loadingIndicatorBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "grey",
    opacity: 0.7,
  },
  moduleTitleText: {
    marginTop: 15,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 17,
    fontWeight: "600",
  },
  moduleSubtitleText: {
    fontSize: 13,
    marginHorizontal: 8,
    color: "gray",
  },
  moduleDescriptionText: {
    fontSize: 15,
    marginTop: 10,
    marginLeft: 8,
    marginRight: 8,
    color: "black",
    fontWeight: "300",
  },
  moduleBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginTop: 10,
    alignItems: "flex-end",
  },
  moduleAuthorText: {
    marginLeft: 8,
    marginRight: 8,
    marginVertical: 8,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "400",
    color: Colors.infoBoxThemeColor,
  },
  moduleButton: {
    height: 20,
    marginLeft: 0,
    marginTop: 4,
    marginBottom: 8,
    paddingBottom: 5,
    paddingTop: 2,
  },
  emptyStateText: {
    color: "#1E1F20",
    fontWeight: "600",
    fontSize: getHeight(18),
    lineHeight: getHeight(28),
    textAlign: "center",
    width: getWidth(266),
    marginTop: getHeight(24),
  },
  emptyStateSubText: {
    color: "#566267",
    fontWeight: "400",
    fontSize: getHeight(14),
    lineHeight: getHeight(20),
    textAlign: "center",
    marginTop: getHeight(4),
  },
  emptyStateSubView: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
  },
  addEmptyStateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    paddingTop: getHeight(5),
    // paddingBottom: getHeight(8),
    // paddingRight: getWidth(16),
    // paddingLeft: getWidth(16),
    width: getWidth(136),
    height: getHeight(36),
    borderColor: Colors.borderColor,
    borderRadius: getHeight(4),
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
    backgroundColor: "#23C29D",
    shadowRadius: 4,
    marginTop: getHeight(24),
  },
  emptyStateAddSubsButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: getHeight(16),
    fontFamily: fontFamily.SemiBold,
    lineHeight: getHeight(20),
  },
  profileText: {
    color: "#FFFFFF",
    fontFamily: fontFamily.Regular,
    fontSize: getHeight(18),
    fontWeight: "700",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  profileView: {
    marginEnd: getWidth(16),
    width: getHeight(32),
    height: getHeight(32),
    borderRadius: getHeight(32) / 2,
    backgroundColor:
      Env.BUILD_VARIANT === buildVariants.COLUMBIA
        ? Colors.primaryColor
        : "#057575",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChannelText: {
    fontSize: getHeight(18),
    fontWeight: "600",
    color: "#1E1F20",
    alignSelf: "center",
    fontFamily: fontFamily.SemiBold,
  },
  selectedChannelView: {
    marginStart: getWidth(16),
    flexDirection: "row",
    marginEnd: getWidth(20),
  },
  scrollToTopBtn: {
    width: getHeight(66),
    height: getHeight(66),
    borderRadius: getHeight(66) / 2,
    backgroundColor: "transparent",
    position: "absolute",
    right: getWidth(8),
    bottom: getHeight(32),
  },
  chevronDownIcon: {
    height: getHeight(19),
    width: getHeight(19),
    alignSelf: "center",
    marginStart: getWidth(2),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
});
export default connect((state) => ({
  enabledModules: selectors.enabledModules(state),
  enabledTestModules: selectors.enabledTestModules(state),
  enabledInstitutionalModules: selectors.enabledInstitutionalModules(state),
  modules: state.persist.data.modules,
  loadedData: state.persist.loadedData,
  loadingData: state.general.loadingData,
  deeplink: state.general.deeplink,
  drawer: state.general.drawer,
  activeChannels: state.persist.channels.activeChannels,
  allChannels: state.persist.channels.allChannels,
  dbURL: state.persist.dbURL,
  calculators2: state.persist.data.calculators2,
  enabledCalculators2: selectors.enabledCalculators2(state),
}))(function (props) {
  const tags = useAtomValue(tagCodeArrAtom);
  const setTagReset = useSetAtom(tagResetAtom);
  const selectedChannel = useAtomValue(selectedChannelAtom);

  const optionalProps = {
    tags,
    setTagReset,
    selectedChannel,
  };

  return <ModuleScreen {...props} {...optionalProps} />;
});
