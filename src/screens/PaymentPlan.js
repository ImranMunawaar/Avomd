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
  TouchableWithoutFeedback,
  Pressable
} from "react-native";
// This is related to preop. If we have to use it we should have to import it from react native
// import { Icon } from "native-base";
import { fontFamily, fontWeight } from "../constants/strings";
import PasswordInput from "../components/passwordInput";
import RedeemCodeInput from "../components/redeemCodeInput";
import * as Analytics from "../services/Analytics";
import * as helper from "../services/helper";
import IAPStore from "../services/IAPStore";
import store from "../store";
import Env from "../constants/Env";
import Colors from "../constants/Colors";
import { buildVariants } from "../constants/strings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isIphoneX } from "../services/iphoneXHelper";
import crashlytics from "@react-native-firebase/crashlytics";

export class PaymentPlan extends Component {
  constructor(props) {
    super(props);
    this.clicksCount = 0;
    this.availableRedeemCodes = [];

    Env.REDEEM_CODES.forEach((redeemCode) => {
      this.availableRedeemCodes.push(...redeemCode.codes);
    });
    this.state = {
      trialMonths: 1,
      paymentPlans:
        Platform.OS === "ios"
          ? Env.PAYMENT_PLANS.filter((plan) => plan.title !== "Redeem Code")
          : Env.PAYMENT_PLANS,
    };
  }

  async componentDidMount() {
    //RNIap.initConnection();
    let tryOnce = await AsyncStorage.getItem("tryOnce");
    if (!tryOnce || tryOnce === "done") {
      tryOnce = 3;
    } else tryOnce = Number(tryOnce);
    if (tryOnce > 0) {
      this.setState({ tryOnce: tryOnce });
    }
    try {
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
      }
      //Analytics.track(Analytics.events.CLICK_START_NOW);
    } catch (e) {
      crashlytics().recordError(e);
      console.log("IAP STORE error", e);
    }
    //console.log(IAPStore.activeProducts);
  }

  componentWillUnmount() {
    //RNIap.endConnection();
  }

  onPaymentPlanPress = (index, plan) => {
    switch (index) {
      case 0:
        const planSelected = plan.isSelected;
        this.setState((prevState) => {
          let paymentPlans = [...prevState.paymentPlans];
          paymentPlans.forEach(
            (paymentPlan) => (paymentPlan.isSelected = false)
          );
          paymentPlans[index].isSelected = !planSelected;
          return { paymentPlans };
        });
        Analytics.track(Analytics.events.CLICK_INDIVIDUAL_PLAN);
        break;
      case 1:
        if (Platform.OS === "ios") {
          IAPStore.presentCodeRedemptionSheet()
            .then(() => {
              console.log("Code redeemed");
            })
            .catch((e) => {
              console.log("Error", e);
              crashlytics().recordError(e);
            });
          return;
        }
        this.setState({ showRedeemCodeInput: true });
        break;
      case 2:
        this.setState({ showPasswordInput: true });
        Analytics.track(Analytics.events.CLICK_INSTITUTIONAL_PLAN);
        break;
    }
  };

  onStartPress = async () => {
    let { trialMonths, paymentPlans } = this.state;
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
    if (!paymentPlans[0].isSelected) {
      alert("Please select any payment plan first");
      return;
    }

    // this.props.navigation.navigate("SignUp");
    // return;

    try {
      // IAPStore.buy(Platform.select({
      //   ios: `iap_individual_intro_${this.state.trialMonths}m`,
      //   android: `iap_individual_${this.state.trialMonths}m`
      // }), err => {
      let productSku =
        trialMonths === 1 && Platform.OS === "ios"
          ? `individual_yearly_1fm`
          : `individual_yearly_${trialMonths}m`;
      //console.log("Test", productSku);
      IAPStore.buy(productSku, (err) => {
        if (!err) {
          this.props.navigation.navigate("SignUp");
          Analytics.track(Analytics.events.CLICK_START_NOW);
        } else {
          Analytics.track(Analytics.events.SUBSCRIPTION_FAILED, {
            error: err.code,
            message: err.Error ? err.Error : err,
          });
        }
      });
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
      Analytics.track(Analytics.events.REDEEM_CODE_NOT_EXIST, {
        redeemCode: this.state.redeemCode,
      });
      alert("This redeem code does not exist");
      return;
    }
    Env.REDEEM_CODES.forEach((redeemCode) => {
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
          onPress={async () => {
            await IAPStore.restore();
            if (IAPStore.activeProducts.length > 0) {
              Analytics.track(Analytics.events.IAPHUB_PURCHASE_RESTORE, {
                iaphub_restore_message: "Purchases restored",
              });
              this.setState({ paymentRestored: true });
            } else {
              Analytics.track(Analytics.events.IAPHUB_PURCHASE_RESTORE, {
                iaphub_restore_message: "You Dont have any active products",
              });
            }
          }}
          style={{
            alignSelf: "flex-end",
            marginTop: isIphoneX()
              ? helper.getHeight(50)
              : helper.getHeight(25),
            marginEnd: helper.getWidth(20),
          }}
        >
          <Text style={{ fontSize: helper.getHeight(17) }}>Restore</Text>
        </TouchableOpacity>
        <View
          style={{
            paddingStart: helper.getWidth(30),
            paddingEnd: helper.getWidth(30),
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              this.clicksCount++;
              if (this.cancelClearCount) {
                clearTimeout(this.cancelClearCount);
              }
              this.cancelClearCount = setTimeout(() => {
                this.clicksCount = 0;
              }, 1000);
              if (this.clicksCount === 5) {
                this.clicksCount = 0;
                Alert.alert("", "Do you want to bypass the payment process?", [
                  {
                    text: "Yes",
                    onPress: async () => {
                      this.props.navigation.navigate("SignUp");
                    },
                  },
                  {
                    text: "No",
                  },
                ]);
              }
            }}
          >
            <View>
              <Text style={styles.onboardTitleLine1}>
                Get your first {trialMonths > 1 ? trialMonths : ""} month
                {trialMonths > 1 ? "s" : ""} free
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.onboardTitleLine2}>
            No commitment. Cancel anytime.
          </Text>
          <View style={styles.termsAndPolicy}>
            <TouchableOpacity
              onPress={() => Linking.openURL(Env.TERMS_AND_CONDITIONS)}
            >
              <Text style={styles.hyperLinkText}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.aboutUsText}> and </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(Env.PRIVACY_POLICY)}
            >
              <Text style={styles.hyperLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ justifyContent: "center", zIndex: 0 }}>
          {this.state.paymentPlans.map((plan, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => this.onPaymentPlanPress(index, plan)}
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
          <ScrollView style={{ maxHeight: helper.getHeight(65) }}>
            <Text
              style={{
                fontSize: helper.getHeight(16),
                alignSelf: "center",
                color: "#a5a5a5",
                marginTop: helper.getHeight(10),
                marginHorizontal: helper.getWidth(30),
              }}
            >
              Subscriptions ($19.99 / year) automatically renew unless
              auto-renew is turned off. Cancellations at least 24 hours prior to
              subscription renewal will not be charged. You can manage your
              subscription and/or turn off auto-renewal from your Account
              Settings after purchase.
            </Text>
          </ScrollView>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={this.onStartPress}
          style={[
            styles.nextButton,
            {
              marginBottom:
                tryOnce > 0 && !Env.TRY_ONCE_AVAILABLE
                  ? styles.nextButton.marginBottom
                  : helper.getHeight(59),
            },
          ]}
        >
          <Text style={styles.nextText}>
            {paymentRestored
              ? "Continue"
              : `Start Free ${trialMonths} Month${trialMonths > 1 ? "s" : ""}`}
          </Text>
        </Pressable>
        {Env.TRY_ONCE_AVAILABLE === true && (
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
    marginTop: helper.getHeight(60),
    textAlign: "center",
    color: "#000000",
    fontFamily: fontFamily.Regular,
  },
  onboardTitleLine2: {
    fontFamily: fontFamily.Regular,
    fontSize: helper.getHeight(20),
    textAlign: "center",
    fontWeight: fontWeight.Light,
    alignSelf: "center",
    marginTop: helper.getHeight(10),
    marginBottom: helper.getHeight(10),
  },
  paymentPlanButton: {
    width: helper.getWidth(314),
    height: helper.getHeight(70),
    borderRadius: helper.getHeight(70 / 2),
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
    fontWeight: "700",
    fontSize: helper.getHeight(24),
    fontFamily: fontFamily.Regular,
  },
  planSubTitleText: {
    fontWeight: "300",
    fontSize: helper.getHeight(16),
    fontFamily: fontFamily.Regular,
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
    backgroundColor: Colors.button,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: helper.getHeight(7),
    marginTop: helper.getHeight(20),
  },
  tryOnceText: {
    color: "black",
    fontWeight: "bold",
    fontSize: helper.getHeight(16),
    textDecorationLine: "underline",
    alignSelf: "center",
    marginBottom: helper.getHeight(20),
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
