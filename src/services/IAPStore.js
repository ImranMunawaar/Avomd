import { Alert } from "react-native";
import Iaphub from "react-native-iaphub";
import pkg from "../../package.json";
import { getUniqueId } from "react-native-device-info";
import crashlytics from "@react-native-firebase/crashlytics";
import * as Analytics from "../services/Analytics";
import { useNavigation } from "@react-navigation/native";

const SUPPORT_EMAIL = "support@avomd.io";

class IAPStore {
  isInitialized = false;
  skuProcessing = null;
  productsForSale = null;
  activeProducts = null;

  // Init IAPHUB
  async init() {
    // Init iaphub2
    await Iaphub.start({
      // The app id is available on the settings page of your app
      appId: "613f25069bf07f0c7db46465",
      // The (client) api key is available on the settings page of your app
      apiKey: "kWRwPldnNgXNLu8mt0A53mjsglTnLc4a",
      // The environment is used to determine the webhooks configuration ('production', 'staging', 'development')
      environment: "production",
      // Allow anonymous purchase
      allowAnonymousPurchase: true,
    });
    // Add device params
    await Iaphub.setDeviceParams({ appVersion: pkg.version });
    await Iaphub.login(await getUniqueId());
    // Iaphub is now initialized and ready to use
    this.isInitialized = true;
    // Listen to user updates and refresh productsForSale/activeProducts
    Iaphub.addEventListener("onUserUpdate", async () => {
      await this.refreshProducts();
    });
    Iaphub.addEventListener("onError", async (err) => {
      console.log("-> Got err: ", err);
    });
    Iaphub.addEventListener("onReceipt", async (receipt) => {
      //console.log("-> Got receipt: ", receipt);
    });
    Iaphub.addEventListener("onBuyRequest", async (opts) => {
      console.log("-> Got buy request: ", opts);
    });
  }

  // Login
  async login(userId) {
    await Iaphub.login(userId);
  }

  // Logout
  async logout() {
    await Iaphub.logout();
  }

  // Refresh products
  async refreshProducts() {
    try {
      this.activeProducts = await Iaphub.getActiveProducts();
      this.productsForSale = await Iaphub.getProductsForSale();
    } catch (err) {
      console.error(err);
    }
  }

  // Call this method when an user click on one of your products
  async buy(productSku, callback) {
    try {
      this.skuProcessing = productSku;
      var transaction = await Iaphub.buy(productSku);
      this.skuProcessing = null;
      console.log("transaction info is", transaction);
      if (transaction) {
        Analytics.track(Analytics.events.IAPHUD_TRANSACTION, {
          iaphub_transaction_id: transaction.id,
          iaphub_sku: transaction.sku,
          iaphub_purchase: transaction.purchase,
          iaphub_status: transaction.webhookStatus,
        });
      } else {
        Analytics.track(Analytics.events.IAPHUD_TRANSACTION, {
          iaphub_transaction: transaction,
        });
      }
      // The webhook could not been sent to my server
      if (transaction.webhookStatus == "failed") {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: "Purchase delayed",
          iaphub_message:
            "Your purchase was successful but we need some more time to validate it, should arrive soon! Otherwise contact the support (" +
            SUPPORT_EMAIL +
            ")",
        });
        Alert.alert(
          "Purchase delayed",
          "Your purchase was successful but we need some more time to validate it, should arrive soon! Otherwise contact the support (" +
            SUPPORT_EMAIL +
            ")"
        );
      }
      // Everything was successful! Yay!
      else {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: "Purchase successful",
          iaphub_message: "Your purchase has been processed successfully!",
        });
        Alert.alert(
          "Purchase successful",
          "Your purchase has been processed successfully!"
        );
      }
      callback();
      // Refresh the user to update the products for sale
      /*try {
        await this.getActiveProducts();
        await this.getProductsForSale();
    } catch (err) {
        crashlytics().recordError(err);
        console.error(err);
      }*/
    } catch (err) {
      crashlytics().recordError(err);
      this.skuProcessing = null;
      console.log(err);
      // Purchase popup cancelled by the user (ios only)
      if (err.code == "user_cancelled") {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: err.code,
          iaphub_message: "User Cancelled the purchase",
        });
        callback(err);
        return;
      }
      // Couldn't buy product because it has been bought in the past but hasn't been consumed (restore needed)
      else if (err.code == "product_already_owned") {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: err.code,
          iaphub_message:
            "Please restore your purchases in order to fix that issue",
        });
        callback(err);
        Alert.alert(
          "Product already owned",
          "Please restore your purchases in order to fix that issue",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Restore", onPress: () => Iaphub.restore() },
          ]
        );
      }
      // The payment has been deferred (its final status is pending external action such as 'Ask to Buy')
      else if (err.code == "deferred_payment") {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: err.code,
          iaphub_message:
            "Your purchase has been processed but is awaiting approval",
        });
        callback(err);
        Alert.alert(
          "Purchase awaiting approval",
          "Your purchase has been processed but is awaiting approval"
        );
      }
      // The receipt has been processed on IAPHUB but something went wrong
      else if (err.code == "receipt_validation_failed") {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: err.code,
          iaphub_message:
            "We're having trouble validating your transaction. Give us some time, we'll retry to validate your transaction ASAP!",
        });
        callback(err);
        Alert.alert(
          "We're having trouble validating your transaction",
          "Give us some time, we'll retry to validate your transaction ASAP!"
        );
      }
      // The receipt hasn't been validated on IAPHUB (Could be an issue like a network error...)
      else if (err.code == "receipt_request_failed") {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: err.code,
          iaphub_message:
            "We're having trouble validating your transaction. lease try to restore your purchases later (Button in the settings) or contact the support (" +
            SUPPORT_EMAIL +
            ")",
        });
        callback(err);
        Alert.alert(
          "We're having trouble validating your transaction",
          "Please try to restore your purchases later (Button in the settings) or contact the support (" +
            SUPPORT_EMAIL +
            ")"
        );
      }
      // The user has already an active subscription on a different platform (android or ios)
      else if (err.code == "cross_platform_conflict") {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: err.code,
          iaphub_message: `Seems like you already have a subscription on ${err.params.platform} Please use the same platform to change your subscription or wait for your current subscription to expire`,
        });
        callback(err);
        Alert.alert(
          `Seems like you already have a subscription on ${err.params.platform}`,
          `Please use the same platform to change your subscription or wait for your current subscription to expire`
        );
      }
      // Couldn't buy product for many other reasons (the user shouldn't be charged)
      else {
        Analytics.track(Analytics.events.IAPHUB_PAYMENT_DETAILS, {
          iapub_error_title: err,
          iaphub_message:
            "Purchase error We were not able to process your purchase, please try again later or contact the support (" +
            SUPPORT_EMAIL +
            ")",
        });
        callback(err);
        Alert.alert(
          "Purchase error",
          "We were not able to process your purchase, please try again later or contact the support (" +
            SUPPORT_EMAIL +
            ")"
        );
      }
    }
  }

  // Call this method to restore the user purchases (you should have a button, it is usually displayed on the settings page)
  async restore() {
    const navigation = useNavigation();
    var response = await Iaphub.restore();
    Alert.alert("Restore", "Purchases restored", [
      {
        text: "OK",
        onPress: () => {
          navigation.navigate("SignUp", {});
        },
      },
    ]);
  }

  // Call this method to show the subscriptions page
  async showManageSubscriptions() {
    await Iaphub.showManageSubscriptions();
  }

  // Call this method to present the ios code redemption sheet
  async presentCodeRedemptionSheet() {
    await Iaphub.presentCodeRedemptionSheet();
  }
}

export default new IAPStore();
