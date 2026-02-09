import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Splash from "react-native-splash-screen";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";

import messaging from "@react-native-firebase/messaging";

import Env from "../constants/Env";
import { initModules, setDefaultStorage } from "../models/modules";
import { buildVariants, LIVE_DB, STAGING_DB } from "../constants/strings";
import { config } from "../auth/config";

// import { SignUpScreenV2 } from "../screens/SignUpScreenV2";
import SignUpScreenV3 from "../screens/SignUpScreenV3";
import { Questionnaire } from "../screens/Questionnaire";
import { ForgotPassword } from "../screens/ForgotPassword";
import DashboardScreen from "../screens/DashboardScreen";
import { InfoScreen } from "../screens/InfoScreen";
import { CalculatorScreen } from "../screens/CalculatorScreen";
import { Calculator2Screen } from "../screens/Calculator2Screen";
import { ContentScreen } from "../screens/ContentScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import SubscriptionScreenV2, {
  TOPIC_POSTFIX,
} from "../screens/SubscriptionScreenV2";
import SplashScreen from "../screens/SplashScreen";
import { PreOpAuthors } from "../screens/PreOpAuthors";
import { PreOpPaymentPlan } from "../screens/PreOpPaymentPlan";
import PreOpModuleScreen from "../screens/PreOpModuleScreen";
import { Authors } from "../screens/Authors";
import { PaymentPlan } from "../screens/PaymentPlan";
import onBoardingSurvey from "../screens/onBoardingSurvey";
import { ShareQRCodeScreen } from "../screens/ShareQRCodeScreen";
import { ShareQRCodeStepOneScreen } from "../screens/ShareQRCodeStepOneScreen";
import { SignUpScreenV4 } from "../screens/SignUpScreenV4";
import MyProfileScreen from "../screens/MyProfileScreen";
import { AccountManagementScreen } from "../screens/AccountManagementScreen";
import { selectors } from "../store";
import Colors from "../constants/Colors";
import ModuleScreenV2 from "../screens/ModuleScreenV2";
import TextPanelScreen from "../screens/TextPanelScreen";

const Stack = createStackNavigator();

function MainStack() {
  return (
    <>
      <Stack.Screen name="Modules" component={ModuleScreenV2} />
      <Stack.Screen name="Info" component={InfoScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Calculator2" component={Calculator2Screen} />
      <Stack.Screen name="Content" component={ContentScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreenV2} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ShareQRCode" component={ShareQRCodeScreen} />
      <Stack.Screen
        name="ShareQRCodeStepOne"
        component={ShareQRCodeStepOneScreen}
      />
      <Stack.Screen
        name="AccountManagement"
        component={AccountManagementScreen}
      />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="TextPanel" component={TextPanelScreen} />
    </>
  );
}

function PreOpStack() {
  return (
    <>
      <Stack.Screen name="Authors" component={Authors} />
      <Stack.Screen name="PaymentPlan" component={PaymentPlan} />
      <Stack.Screen name="SignUp" component={SignUpScreenV4} />
    </>
  );
}

/* const AppNavigator = createSwitchNavigator({
  Splash: {
    screen: SplashScreen,
  },
  PreOpStack: {
    screen: PreOpStack,
  },
  SignUp: {
    screen:
      Env.BUILD_VARIANT === buildVariants.CLIENT
        ? SignUpScreenV3
        : SignUpScreenV4, //SignUpScreenV2
  },
  Questionnaire: {
    screen: Questionnaire,
  },
  MainStack: {
    screen: MainStack,
  },
}); */

export class NavContainer extends React.Component {
  state = {
    isReady: false,
  };

  componentDidUpdate(prevProps, prevState, snapshot) {}

  async componentDidMount() {
    await this.preloadData();
    if (this.props.activeChannels && this.props.activeChannels.length > 0) {
      this.subscribeToTopics(this.props.activeChannels);
    }
  }

  subscribeToTopics = (topics) => {
    topics.forEach((topic) => {
      messaging()
        .subscribeToTopic(topic + TOPIC_POSTFIX)
        .then(() => {})
        .catch((err) => console.log("topic Subscription Error : ", err));
    });
  };

  async preloadData() {
    try {
      await setDefaultStorage();
      if (this.props.enabledModules.length === 0) await initModules();
      this.setState({ isReady: true }, () => Splash.hide());
      // await SplashScreen.hideAsync();
    } catch (error) {
      console.log("preloadData error", error);
    }
  }

  render() {
    const { isReady } = this.state;
    const { isUserLoggedIn } = this.props;
    let user = firebase.auth().currentUser;
    return isReady ? (
      <NavigationContainer
        style={{ flex: 1 }}
        onNavigationStateChange={(prevState, currentState) => {
          const currentScreen = this.props.getActiveRouteName(currentState);
          const prevScreen = this.props.getActiveRouteName(prevState);
          if (prevScreen !== currentScreen) {
          }
        }}
      >
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ gestureEnabled: false, headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          {isUserLoggedIn ? (
            MainStack()
          ) : (
            <>
              <Stack.Screen
                name="SignUp"
                component={
                  Env.BUILD_VARIANT === buildVariants.CLIENT
                    ? SignUpScreenV3
                    : SignUpScreenV4
                }
              />
              <Stack.Screen name="Questionnaire" component={Questionnaire} />
              <Stack.Screen name="Survey" component={onBoardingSurvey} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    ) : (
      <View style={styles.loadingView}>
        <ActivityIndicator size={"large"} color={Colors.primaryColor} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    justifyContent: "center",
  },
});

export default connect((state) => ({
  activeChannels: state.persist.channels.activeChannels,
  isUserLoggedIn: state.persist.isUserLoggedIn,
  enabledModules: selectors.enabledModules(state),
}))(NavContainer);
