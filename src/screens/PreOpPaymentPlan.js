import React, { Component } from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  Alert,
  Platform,
  Linking,
  Pressable
} from "react-native";
// This is related to preop. If we have to use it we should have to import it from react native
// import { Icon } from "native-base";
import { fontWeight } from "../constants/strings";
import PasswordInput from "../components/passwordInput";
import RedeemCodeInput from "../components/redeemCodeInput";
import * as Analytics from "../services/Analytics";
import * as helper from "../services/helper";
import IAPStore from "../services/IAPStore";
import store from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import crashlytics from "@react-native-firebase/crashlytics";

export class PreOpPaymentPlan extends Component {
  constructor(props) {
    super(props);
    this.preopConfig = require("../../preOpConfig");
    this.availableRedeemCodes = [];
    this.preopConfig.redeemCodes.forEach((redeemCode) => {
      this.availableRedeemCodes.push(...redeemCode.codes);
    });
    this.state = {
      trialMonths: 1,
      paymentPlans: [
        {
          title: "Individual Subscription",
          subTitle: `$${this.preopConfig.price.individual}/year after trial ends`,
        },
        {
          title: "Institutional Subscription",
          subTitle: `$${this.preopConfig.price.institutional}/year after trial ends`,
        },
        {
          title: "Redeem Code",
          subTitle: `Use a promo code`,
        },
      ],
    };
  }

  async componentDidMount() {
    let tryOnce = await AsyncStorage.getItem("tryOnce");
    if (!tryOnce || tryOnce === "done") {
      tryOnce = 3;
    } else tryOnce = Number(tryOnce);
    if (tryOnce > 0) {
      this.setState({ tryOnce: tryOnce });
    }
    await IAPStore.init();
    await IAPStore.refreshProducts();
    if (IAPStore.activeProducts.length > 0) {
      let user = await AsyncStorage.getItem("user");
      if (user) {
        user = JSON.parse(user);
        if (user.email) {
          this.props.navigation.navigate("Modules");
          return;
        }
      }
      this.props.navigation.navigate("SignUp");
      //Analytics.track(Analytics.events.CLICK_START_NOW);
    }
    //console.log(IAPStore.activeProducts);
  }

  onPaymentPlanPress = (index) => {
    switch (index) {
      case 0:
        this.setState((prevState) => {
          let paymentPlans = [...prevState.paymentPlans];
          paymentPlans.forEach(
            (paymentPlan) => (paymentPlan.isSelected = false)
          );
          paymentPlans[index].isSelected = true;
          return { paymentPlans };
        });
        Analytics.track(Analytics.events.CLICK_INDIVIDUAL_PLAN);
        break;
      case 1:
        this.setState({ showPasswordInput: true });
        Analytics.track(Analytics.events.CLICK_INSTITUTIONAL_PLAN);
        break;
      case 2:
        this.setState({ showRedeemCodeInput: true });
        break;
    }
  };

  onStartPress = async () => {
    if (this.state.paymentRestored) {
      let user = await AsyncStorage.getItem("user");
      if (user) {
        user = JSON.parse(user);
        if (user.email) {
          this.props.navigation.navigate("Modules");
          return;
        }
      }
      this.props.navigation.navigate("SignUp");
      return;
    }
    if (!this.state.paymentPlans[0].isSelected) {
      alert("Please select any payment plan first");
      return;
    }

    try {
      IAPStore.buy(
        Platform.select({
          ios: `iap_individual_intro_${this.state.trialMonths}m`,
          android: `iap_individual_${this.state.trialMonths}m`,
        }),
        (err) => {
          //IAPStore.buy("com.avomd.preop.iapIndividual1m", err => {
          if (!err) {
            this.props.navigation.navigate("SignUp");
            Analytics.track(Analytics.events.CLICK_START_NOW);
          }
        }
      );
    } catch (e) {
      crashlytics().recordError(e);
      console.log("Payment error", e);
    }
  };

  onChangePassword = (text) => {};

  onDonePress = () => {
    alert("The code that you entered is not correct");
  };

  onPasswordClosePress = () => {
    this.setState((prevState) => {
      let paymentPlans = [...prevState.paymentPlans];
      paymentPlans.forEach((paymentPlan) => (paymentPlan.isSelected = false));
      return { paymentPlans };
    });
  };

  onRedeemInputClosePress = () => {};

  onRedeemInputDonePress = () => {
    if (!this.availableRedeemCodes.includes(this.state.redeemCode)) {
      alert("This redeem code does not exist");
      return;
    }
    this.preopConfig.redeemCodes.forEach((redeemCode) => {
      if (redeemCode.codes.includes(this.state.redeemCode)) {
        this.setState({
          trialMonths: redeemCode.months,
          showRedeemCodeInput: false,
        });
        Alert.alert(
          "Hurray!",
          `You have redeemed free trial of ${redeemCode.months} months.`
        );
      }
    });
  };

  onChangeRedeemCode = (text) => {
    this.setState({ redeemCode: text });
  };

  render() {
    let {
      showPasswordInput,
      tryOnce,
      showRedeemCodeInput,
      trialMonths,
      paymentRestored,
    } = this.state;
    return (
      <View style={styles.fullSize}>
        <TouchableOpacity
          onPress={async () =>
            await IAPStore.restore(() => {
              if (IAPStore.activeProducts.length > 0) {
                this.setState({ paymentRestored: true });
              }
            })
          }
          style={{
            alignSelf: "flex-end",
            marginTop: helper.getHeight(25),
            marginEnd: helper.getWidth(20),
          }}
        >
          <Text style={{ fontSize: helper.getHeight(17) }}>Restore</Text>
        </TouchableOpacity>
        <View style={{ paddingStart: 39, paddingEnd: 39 }}>
          <TouchableOpacity
            onPress={() => {
              //this.props.navigation.navigate("SignUp");
            }}
          >
            <Text style={styles.onboardTitleLine1}>
              Get your first month free
            </Text>
          </TouchableOpacity>
          <Text style={styles.onboardTitleLine2}>
            No commitment. Cancel anytime.
          </Text>
          <View style={styles.termsAndPolicy}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://www.avomd.io/subscriptionagreementandtermsofuse"
                )
              }
            >
              <Text style={styles.hyperLinkText}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.aboutUsText}> and </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.avomd.io/privacypolicy")
              }
            >
              <Text style={styles.hyperLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: "center", zIndex: 0 }}>
          {this.state.paymentPlans.map((plan, index) => {
            return (
              <TouchableOpacity
                onPress={() => this.onPaymentPlanPress(index)}
                style={[
                  styles.paymentPlanButton,
                  {
                    backgroundColor: plan.isSelected ? "black" : "white",
                  },
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.planTitleText,
                      { color: plan.isSelected ? "white" : "black" },
                    ]}
                  >
                    {plan.title}
                  </Text>
                  <Text
                    style={[
                      styles.planSubTitleText,
                      {
                        color: plan.isSelected ? "white" : "black",
                        width: helper.getWidth(279),
                      },
                    ]}
                  >
                    {plan.subTitle}
                  </Text>
                </View>
                {/* {plan.isSelected && (
                  <Icon
                    style={{
                      color: "white",
                      marginStart: helper.getWidth(
                        Platform.select({ ios: -48, android: -55 })
                      ),
                    }}
                    type={"Fontisto"}
                    name={"check"}
                  />
                )} */}
              </TouchableOpacity>
            );
          })}
          <Text
            style={{
              fontSize: helper.getHeight(16),
              alignSelf: "center",
              color: "#a5a5a5",
              marginTop: helper.getHeight(10),
              marginHorizontal: helper.getWidth(30),
            }}
          >
            You can subscribe to the unlimited use of the AvoMD preoperative
            assistant service. Plan automatically renews ($19.99/year) annually
            once the trial period (can be increased by redeeming promo code)
            finishes
          </Text>
        </View>
        <Pressable
          onPress={this.onStartPress}
          style={[
            styles.nextButton,
            {
              marginBottom:
                tryOnce > 0 && this.preopConfig.preop.tryOnceAvailable
                  ? styles.nextButton.marginBottom
                  : helper.getHeight(78),
            },
          ]}
        >
          <Text style={styles.nextText}>
            {paymentRestored
              ? "Continue"
              : `Start Free ${trialMonths} Month${trialMonths > 1 ? "s" : ""}`}
          </Text>
        </Pressable>
        {this.preopConfig.preop.tryOnceAvailable && (
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem("tryOnce", (tryOnce - 1).toString());
              //await AsyncStorage.setItem("tryOnce", "done");
              store.dispatch({
                type: "SET_GENERAL_VAR",
                key: "tryOnceUsed",
                data: true,
              });
              this.props.navigation.navigate("Modules");
              Analytics.track(Analytics.events.CLICK_TRY_ONCE);
            }}
          >
            {tryOnce > 0 && (
              <Text numberOfLines={1} style={styles.tryOnceText}>
                Try {tryOnce} session{tryOnce > 1 ? "s" : ""}
              </Text>
            )}
          </TouchableOpacity>
        )}
        {showPasswordInput && <PasswordInput _this={this} />}
        {showRedeemCodeInput && <RedeemCodeInput _this={this} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullSize: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  onboardTitleLine1: {
    fontSize: helper.getHeight(38),
    fontWeight: "bold",
    marginTop: helper.getHeight(20),
    textAlign: "center",
  },
  onboardTitleLine2: {
    fontSize: helper.getHeight(20),
    textAlign: "center",
    fontWeight: fontWeight.Light,
    alignSelf: "center",
    marginTop: helper.getHeight(10),
    marginBottom: helper.getHeight(10),
  },
  paymentPlanButton: {
    width: helper.getWidth(314),
    height: helper.getHeight(89),
    borderRadius: helper.getHeight(89 / 2),
    alignSelf: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    backgroundColor: "#14DB58",
    shadowRadius: 4,
    alignItems: "center",
    marginBottom: 7,
    flexDirection: "row",
    paddingStart: helper.getWidth(35),
  },
  nextText: {
    color: "white",
    fontWeight: "bold",
    fontSize: helper.getHeight(21),
    width: helper.getWidth(255),
    textAlign: "center",
  },
  planTitleText: {
    fontWeight: "bold",
    fontSize: helper.getHeight(21),
  },
  planSubTitleText: {
    fontWeight: fontWeight.Light,
    fontSize: helper.getHeight(16),
  },
  nextButton: {
    width: helper.getWidth(255),
    height: helper.getHeight(58),
    borderRadius: helper.getHeight(58 / 2),
    alignSelf: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    backgroundColor: "#14DB58",
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: helper.getHeight(7),
    marginTop: helper.getHeight(10),
  },
  tryOnceText: {
    color: "black",
    fontWeight: "bold",
    fontSize: helper.getHeight(16),
    textDecorationLine: "underline",
    alignSelf: "center",
    marginBottom: helper.getHeight(51),
    textAlign: "center",
    width: helper.getWidth(255),
  },
  termsAndPolicy: {
    flexDirection: "row",
    marginBottom: helper.getHeight(30),
    alignSelf: "center",
  },
  aboutUsText: {
    color: "black",
    fontSize: helper.getHeight(16),
  },
  hyperLinkText: {
    color: "black",
    fontSize: helper.getHeight(16),
    textDecorationLine: "underline",
  },
});
