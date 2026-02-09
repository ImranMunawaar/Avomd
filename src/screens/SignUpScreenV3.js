import React, { Component } from "react";
import {
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Alert,
  Platform,
  UIManager,
  Text,
  ActivityIndicator,
  LayoutAnimation,
  PlatformColor,
} from "react-native";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/functions";
import "@react-native-firebase/auth";
import { getDeeplink, setDeeplink } from "../models/modules";
import { deeplinkPaths, fontFamily, fontWeight } from "../constants/strings";
// import { setUserId, logEvent, setUserProperties } from "expo-firebase-analytics";
import * as Analytics from "../services/Analytics";
import * as Crypto from "expo-crypto";
import * as AppleAuth from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import Colors from "../constants/Colors";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabaseInstance, getHeight, getWidth } from "../services/helper";
import crashlytics from "@react-native-firebase/crashlytics";
import { connect } from "react-redux";
import store from "../store";
import { LIVE_DB, STAGING_DB } from "../constants/strings";
import { getBottomSpace, getStatusBarHeight } from "../services/iphoneXHelper";
import { ScrollView } from "react-native-gesture-handler";
import { getDefaultChannels } from "../services/default";

// const config = {
//   apiKey: firebaseAuthIntegration.options.apiKey,
//   databaseURL: firebaseAuthIntegration.options.databaseURL,
//   projectId: firebaseAuthIntegration.options.projectId,
// };

// let firebaseAuth;
// try {
//   firebaseAuth = firebase.initializeApp(config);
// } catch (err) {
//   crashlytics().recordError(err);
//   if (!/already exists/.test(err.message)) {
//     console.error("Firebase initialization error", err.stack);
//   }
// }

/**These imports are for bulk authentication**/
//import series from "async/series";

/**Bulk authentication imports**/

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const defaultState = {
  form: "SIGN_UP",
  firstName: "",
  lastName: "",
  signUpEmail: "",
  signInEmail: "",
  forgotEmail: "",
  firstNameError: null,
  lastNameError: null,
  signUpEmailError: null,
  signInEmailError: null,
  forgotEmailError: null,
  signUpPassword: "",
  signInPassword: "",
  signUpPasswordError: null,
  signInPasswordError: null,
  passwordInputEyeIcon: "eye",
  passwordInputEye: false,
  signInEyeIcon: "eye",
  signInEye: false,
  refererId: "",
  channelCode: "",
  isForgot: false,
  targetModule: null,
};
class SignUpScreenV3 extends Component {
  constructor(props) {
    super(props);
    this.clicksCount = 0;
    GoogleSignin.configure({
      webClientId:
        "241855441634-g621e6a93itaqbd8o5pp1ckjt18sefnb.apps.googleusercontent.com",
    });
    this.state = { ...defaultState, logs: "" };
    this.initialSubscription = [];

    /**Code for bulk user authentication**/
    /*const emails = require("../../emails");
    console.log("Testing emails", emails.length);*/

    /*const emails = [{
        email: "robert.sacks@downstate.edu",
        name: "Robert Sacks",
      }]*/

    /*let funcArray = emails.map(item => {
      return (callback) => this.signUpUserScript(item.email, item.name, callback);
    });*/

    //console.log(funcArray);

    //series(funcArray, (err, results) => console.log(JSON.stringify({ results })));

    /**Getting all users**/
    //this.getAllUsers();

    /*this.updateFirebaseDbScript({
      "email": "test@pmpediatrics.com",
      "name": "Test Mopeds",
      "subscriptions": ["uniquecodetesting", "avomd_public"],
      "team": "pmpediatrics"
    });*/

    /**Validate created users**/
    //this.validateLogins();
  }

  async signUpUserScript(email, name, callback) {
    await firebase.auth().signOut();
    const emailKey = email.replace(/@|\.|#|\$|\[|\]/g, "_");
    setTimeout(async () => {
      await firebase
        .auth()
        .createUserWithEmailAndPassword(email, "12341234")
        //.signInWithEmailAndPassword(email, "12341234")
        .then(async (data) => {
          var db = getDatabaseInstance();
          const basestr = "users/" + emailKey + "/";
          var writer = db.ref(basestr + "name");
          writer.set(name);
          writer = db.ref(basestr + "email");
          writer.set(email);

          setTimeout(() => {
            callback(null, "User Signed Up " + email + " " + name);
          }, 3000);

          //await this.performTimeConsumingTask();
        })
        .catch((err) => {
          crashlytics().recordError(err);
          console.log("Error", email, err);
          setTimeout(() => {
            callback(null, "Error " + email + " " + err);
          }, 3000);
        });
    }, 1500);
    //await this.performTimeConsumingTask();
  }

  async getAllUsers() {
    const db = getDatabaseInstance();
    db.ref()
      .child("users")
      .once("value", (snapshot) => {
        let users = snapshot.val();
        //console.log(JSON.stringify(users));
        Object.values(users).forEach(async (user) => {
          if (
            user.email &&
            user.email.split("@")[1].toLowerCase() === "pmpediatrics.com"
          ) {
            await this.updateFirebaseDbScript(user);
          }
        });
      });
  }

  async updateFirebaseDbScript(user) {
    let newUser = {
      email: user.email,
      name: user.name,
      teams: ["pmpediatrics"],
    };
    if (user.subscriptions) {
      newUser.subscriptions = user.subscriptions;
    }
    try {
      await getDatabaseInstance()
        .ref(`users/${user.email}`.replace(/[@.]/g, "_"))
        .set(newUser);
    } catch (e) {
      crashlytics().recordError(e);
      console.log(user.email, "Update firebase db error", e);
    }
  }

  async componentWillUnmount() {
    let { path, queryParams } = getDeeplink();
    const deeplink = {
      path: path,
      queryParams: {
        ...queryParams,
        email: null,
        password: null,
        bypassCredential: null,
        targetModule: this.state.targetModule, // if dynamic link have one module
        isFromHeartFlow: this.state.targetModule ? true : false,
      },
    };
    setDeeplink(deeplink);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    let { deeplink } = this.props;
    if (deeplink?.updateTimestamp !== prevProps?.deeplink?.updateTimestamp) {
      this.handleDeeplink();
    }
  }

  async componentDidMount() {
    const isAppleAuthAvailable = await AppleAuth.isAvailableAsync();
    this.setState({
      startTimestamp: new Date().getTime(),
      isAppleAuthAvailable,
    });
    Analytics.track(Analytics.events.VIEW_ONBOARDING_SCREEN);
    this.initialSubscription = await getDefaultChannels();
    this.handleDeeplink();
    const prev = await AsyncStorage.getItem("previousLogin");
    if (prev) {
      this.setState({ signInEmail: prev, form: "SIGN_IN" });
    }
  }

  handleDeeplink = async () => {
    let { path, queryParams } = getDeeplink();
    if (
      path === deeplinkPaths.SUBSCRIBE_CHANNEL &&
      queryParams &&
      queryParams.code
    ) {
      //check if dynamic link have one module
      let { channels } = store.getState().persist;
      let singleChannelInfo = channels.allChannels[queryParams.code];
      if (singleChannelInfo.whitelistObj.length === 1) {
        this.setState({ targetModule: singleChannelInfo.whitelistObj[0].code });
      }
      this.initialSubscription = [queryParams.code];
      this.qrChannelCode = queryParams.code;
      if (queryParams.refererId) {
        this.refererId = queryParams.refererId;
      }
      if (queryParams.referredTo)
        this.setState({ signUpEmail: queryParams.referredTo });
      if (queryParams.qrFirstName)
        this.setState({ firstName: queryParams.qrFirstName });
      if (queryParams.qrLastName)
        this.setState({ lastName: queryParams.qrLastName });
      if (queryParams.qrInstitution)
        this.qrInstitution = queryParams.qrInstitution;
      if (queryParams.pwd) this.pwd = queryParams.pwd;
    }
    if (path === deeplinkPaths.ENTERPRISE) {
      if (queryParams && queryParams.email && queryParams.password) {
        this.setState(
          {
            signInEmail: queryParams.email,
            signInPassword: queryParams.password,
          },
          () => this.signInUser()
        );
      }
    } else if (path === deeplinkPaths.CDS) {
      if (queryParams.refererId) {
        this.refererId = queryParams.refererId;
      }
      if (queryParams && queryParams.bypassCredential) {
        let byPassEmail =
          Constants.installationId + "_" + queryParams.bypassCredential;
        //console.log("Device Unique ID", byPassEmail);
        let user = await AsyncStorage.getItem("user");
        if (!user) {
          user = {};
        }
        user.email = byPassEmail;
        user.isByPassUser = true;
        this.updateUser(user);
        this.props.navigation.navigate("Modules");
      }
    }
  };

  onJobTypeChange = (value) => {
    this.setState({
      jobType: value,
    });
  };

  getValue = () => {
    return this.state.jobType;
  };

  updateUser = async (user) => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  };

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };

  signInGoogle = async () => {};

  signInGoogleV2 = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      //console.log({ userInfo });
      const credential = firebase.auth.GoogleAuthProvider.credential(
        userInfo.idToken
      );
      const firstName = userInfo.user?.middleName
        ? userInfo.user?.givenName + " " + userInfo.user?.middleName
        : userInfo.user?.givenName;
      const lastName = userInfo.user?.familyName;
      await this.socialSignIn(
        {
          ...userInfo.user,
          firstName,
          lastName,
          name: firstName + " " + lastName,
        },
        credential,
        "google"
      );
    } catch (error) {
      console.log("Error", error);
      crashlytics().recordError(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  socialSignIn = async (user, credential, authProvider) => {
    //console.log("socialSignIn params", JSON.stringify({user, credential, authProvider}));
    const self = this;
    self.setState({ loading: true });
    const db = getDatabaseInstance();
    let exists = false;
    let userDB;

    await firebase
      .auth()
      .signInWithCredential(credential)
      .then((data) => {
        exists = !data.additionalUserInfo.isNewUser;
        /**fetching user from db */
        db.ref()
          .child("users")
          .child(data.user.uid)
          .once("value", (snapshot) => {
            userDB = snapshot.val();
          });

        console.log(data.user.email, exists ? "exists" : "doesn't exist");
        //console.log("firebaseAuthIntegration resp", JSON.stringify(data));
        if (exists) {
          if (this.refererId && this.refererId !== "") {
            this.addUserReferred(data.user.uid);
            this.addReferredFrom(data.user.uid);
            Analytics.identify(data.user.email, {
              $name: userDB?.name,
              $email: userDB?.email,
              "last seen date": new Date().toString(),
              referredFrom: this.refererId,
              qrChannel: this.qrChannelCode,
            });
          } else {
            Analytics.identify(data.user.email, {
              $name: userDB?.name,
              $email: userDB?.email,
              "last seen date": new Date().toString(),
            });
          }
          Analytics.track(Analytics.events.LOGIN, {
            type: authProvider,
            duration: this.duration(),
          });

          self.updateUser({
            uid: data.user.uid,
            email: data.user.email,
            gid: user.id,
            name: userDB?.name,
          });
          self.setState({ loading: false });
          self.props.dispatch({
            type: "SET_IS_USER_LOGGED_IN",
            data: true,
          });
          self.props.navigation.navigate("Modules");
          AsyncStorage.setItem("previousLogin", data.user.email);
        } else {
          const basestr = "users/" + data.user?.uid + "/";
          var writer = db.ref(basestr + "name");
          writer.set(user.name);
          writer = db.ref(basestr + "firstName");
          writer.set(user.firstName);
          writer = db.ref(basestr + "lastName");
          writer.set(user.lastName);
          writer = db.ref(basestr + "email");
          writer.set(user.email);
          writer = db.ref(basestr + "subscriptions");
          writer.set(this.initialSubscription);
          if (this.refererId && this.refererId !== "") {
            writer = db.ref(
              basestr + "/" + "referredFrom" + "/" + this.qrChannelCode
            );
            writer.set(this.refererId);
          }
          self.updateUser({
            uid: data.user.uid,
            gid: user.id,
            email: user.email,
            name: user.name,
          });
          this.addUserReferred(data.user.uid);

          const signUpDate = new Date().toString();
          if (this.refererId !== "") {
            Analytics.identify(user.email, {
              $name: user?.name,
              $email: user?.email,
              "sign up date": signUpDate,
              "account type": authProvider,
              "last seen date": signUpDate,
              referredFrom: this.refererId,
              qrChannel: this.qrChannelCode,
            });
          } else {
            Analytics.identify(user.email, {
              $name: user?.name,
              $email: user?.email,
              "sign up date": signUpDate,
              "account type": authProvider,
              "last seen date": signUpDate,
            });
          }
          Analytics.track(Analytics.events.SIGNUP, {
            type: authProvider,
            duration: this.duration(),
          });
          self.setState({ loading: false });
          self.props.navigation.navigate("Survey");
        }
      })
      .catch((err) => {
        self.setState({ loading: false });
        console.log("signInWithCredential error", err);
        crashlytics().recordError(err);
        Analytics.track(
          Analytics.events[authProvider.toUpperCase() + "_SIGNUP_SIGNIN_ERROR"],
          { error: err.message }
        );
      });
  };

  appleAuthLogs = (logs) => {
    console.log(logs);
    this.setState((prevState) => {
      return { logs: prevState.logs + logs + "\n" };
    });
  };

  addUserReferred = async (UserUid) => {
    if (this.refererId) {
      const updateReferringData = firebase
        .functions()
        .httpsCallable("updateReferringData");
      updateReferringData({
        referrerEmail: this.refererId,
        channelCode: this.qrChannelCode,
        uid: UserUid,
      })
        .then((result) => {
          console.log("result : ", result.data.response);
        })
        .catch((error) => {
          const code = error.code;
          const message = error.message;
          const details = error.details;
          console.log(
            "error code : ",
            code,
            "  message : ",
            message,
            " details : ",
            details
          );
        });
    }
  };

  addReferredFrom = async (userUid) => {
    if (this.refererId) {
      getDatabaseInstance()
        .ref("/users/" + userUid)
        .once("value")
        .then((snapshot) => {
          var db = getDatabaseInstance();
          const basestr = "users/" + userUid + "/" + "referredFrom" + "/";
          if (snapshot.val().referredFrom) {
            if (!snapshot.val().referredFrom[this.qrChannelCode]) {
              var writer = db.ref(basestr + this.qrChannelCode);
              writer.set(this.refererId);
            }
          } else {
            var writer = db.ref(basestr + this.qrChannelCode);
            writer.set(this.refererId);
          }
        });
    }
  };

  signupUser = async () => {
    const self = this;
    self.setState({ loading: true });
    var success = true;
    let { signUpEmail, signUpPassword, firstName, lastName } = this.state;
    if (firstName === "") {
      const errMsg = "First Name required";
      this.setState({ firstNameError: errMsg });

      success = false;
    }
    if (lastName === "") {
      const errMsg = "Last Name required";
      this.setState({ lastNameError: errMsg });

      success = false;
    }
    if (signUpEmail === "") {
      const errMsg = "Email required";
      this.setState({ signUpEmailError: errMsg });
      Analytics.track(Analytics.events.SIGNUP_ERROR, {
        type: "email",
        error: errMsg,
      });

      success = false;
    }
    if (signUpPassword === "") {
      const errMsg = "Password required";
      this.setState({ signUpPasswordError: errMsg });
      Analytics.track(Analytics.events.SIGNUP_ERROR, {
        type: "email",
        error: errMsg,
      });

      success = false;
    }

    if (!success) {
      self.setState({ loading: false });
      return;
    }
    const emailKey = signUpEmail.replace(/@|\.|#|\$|\[|\]/g, "_");
    await firebase
      .auth()
      .createUserWithEmailAndPassword(
        this.state.signUpEmail,
        this.state.signUpPassword
      )
      .then((data) => {
        var db = getDatabaseInstance();
        const basestr = "users/" + data.user.uid + "/";
        var writer = db.ref(basestr + "firstName");
        writer.set(self.state.firstName);
        writer = db.ref(basestr + "lastName");
        writer.set(self.state.lastName);
        writer = db.ref(basestr + "name");
        writer.set(self.state.firstName + " " + self.state.lastName);
        writer = db.ref(basestr + "email");
        writer.set(self.state.signUpEmail);
        writer = db.ref(basestr + "subscriptions");
        writer.set(this.initialSubscription);
        if (this.refererId && this.refererId !== "") {
          writer = db.ref(
            basestr + "/" + "referredFrom" + "/" + this.qrChannelCode
          );
          writer.set(this.refererId);
        }
        self.updateUser({
          uid: data.user.uid,
          email: data.user.email,
          firstName: self.state.firstName,
          lastName: self.state.lastName,
        });
        this.addUserReferred(data.user.uid);

        const signUpDate = new Date().toString();
        const firstName = self.state.firstName;
        const lastName = self.state.lastName;
        if (this.refererId !== "") {
          Analytics.identify(data.user.email, {
            $firstName: firstName,
            $lastName: lastName,
            $email: signUpEmail,
            "sign up date": signUpDate,
            "account type": "email",
            "last seen date": signUpDate,
            referredFrom: this.refererId,
            qrChannel: this.qrChannelCode,
          });
        } else {
          Analytics.identify(data.user.email, {
            $firstName: firstName,
            $lastName: lastName,
            $email: signUpEmail,
            "sign up date": signUpDate,
            "account type": "email",
            "last seen date": signUpDate,
            //num logins
          });
        }
        Analytics.track(Analytics.events.SIGNUP, {
          type: "email",
          duration: this.duration(),
        });

        AsyncStorage.setItem("previousLogin", data.user.email);
        self.setState({ loading: false });
        self.props.navigation.navigate("Survey");
      })
      .catch((err) => {
        console.log(err, err.message);
        crashlytics().recordError(err);

        Analytics.track(Analytics.events.SIGNUP_ERROR, {
          type: "email",
          error: err.message,
        });

        if (
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-email"
        ) {
          this.setState({
            signUpPasswordError: "The email or password is invalid",
          });
        } else if (err.code === "auth/email-already-in-use") {
          this.setState({ signUpEmailError: "The email is already in use" });
        }
        self.setState({ loading: false });
      });
  };

  focusedInput = (ref) => {
    this[ref].setNativeProps({
      style: {
        borderWidth: 1,
        borderColor: Colors.button,
      },
    });
    if (ref === "passwordInput") {
      this.setState({ passwordInputEye: true });
    } else if (ref === "passwordSignInInput") {
      this.setState({ signInEye: true });
    }

    this[ref].focus();
  };

  setAppEnvironment = (dbURL) => {
    store.dispatch({
      type: "SWITCH_DB",
      dbURL: dbURL,
    });
    store.dispatch({
      type: "CLEAR_CACHE",
    });
  };

  blurredInput = (ref) => {
    this[ref].setNativeProps({
      style: {
        borderWidth: 0,
        borderColor: "transparent",
      },
    });
    if (ref === "passwordInput") {
      this.setState({ passwordInputEye: false });
    } else if (ref === "passwordSignInInput") {
      this.setState({ signInEye: false });
    }
  };
  signInUser = async () => {
    this.setState({ loading: true });
    const email = this.state.signInEmail;
    const password = this.state.signInPassword;
    let success = true;
    // checks if email and password fields are empty
    if (email === "") {
      const errMsg = "Email required";
      this.setState({ signInEmailError: errMsg });
      Analytics.track(Analytics.events.LOGIN_ERROR, {
        type: "email",
        error: errMsg,
      });
      success = false;
    }
    if (password === "") {
      const errMsg = "Password required";
      this.setState({ signInPasswordError: errMsg });
      Analytics.track(Analytics.events.LOGIN_ERROR, {
        type: "email",
        error: errMsg,
      });
      success = false;
    }

    if (!success) {
      this.setState({ loading: false });
      return;
    }
    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((data) => {
        this.updateUser({
          uid: data.user.uid,
          email: data.user.email,
          name: data.user.displayName,
        });
        this.setState({ loading: false });
        AsyncStorage.setItem("previousLogin", data.user.email);
        this.props.dispatch({
          type: "SET_IS_USER_LOGGED_IN",
          data: true,
        });
        if (this.refererId !== "") {
          this.addUserReferred(data.user.uid);
          this.addReferredFrom(data.user.uid);
          Analytics.identify(data.user.email, {
            $email: email,
            "last seen date": new Date().toString(),
            referredFrom: this.refererId,
            qrChannel: this.qrChannelCode,
          });
        } else {
          Analytics.identify(data.user.email, {
            $email: email,
            "last seen date": new Date().toString(),
            //num logins
          });
        }
        Analytics.track(Analytics.events.LOGIN, {
          type: "email",
          duration: this.duration(),
        });

        this.props.navigation.navigate("Modules");
      })
      .catch((err) => {
        this.setState({ loading: false });
        console.log(err, err.message);
        crashlytics().recordError(err);

        Analytics.track(Analytics.events.LOGIN_ERROR, {
          type: "email",
          error: err.message,
        });

        if (
          err.code === "auth/wrong-password" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-email"
        ) {
          this.setState({
            signInPasswordError: "The email or password is invalid",
          });
        } else {
          this.setState({ signInPasswordError: "The user is not found" });
        }
      });
  };

  forgotPassword = async () => {
    const email = this.state.forgotEmail;
    if (email === "") {
      // check if email field is empty
      const errMsg = "Email required";
      this.setState({ forgotEmailError: errMsg });
      Analytics.track(Analytics.events.RESET_PASSWORD_ERROR, {
        for: email,
        error: errMsg,
      });
      this.setState({ loading: false });
      return;
    }
    await firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Analytics.track(Analytics.events.RESET_PASSWORD, { "sent to": email });
        Alert.alert(
          "Reset Password",
          "Password reset instructions have been sent to your email address!"
        );
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Analytics.track(Analytics.events.RESET_PASSWORD_ERROR, {
          for: email,
          error: err.message,
        });
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-email"
        ) {
          this.setState({ forgotEmailError: "The email is invalid" });
        } else {
          this.setState({ forgotEmailError: "The user is not found" });
        }
      });
  };

  forgotPasswordForm = () => {
    return (
      <View
        style={{
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <View>
          <Text style={styles.fieldTitleText}>Email Address</Text>
          <TextInput
            ref={(sie) => {
              this.forgotEmail = sie;
            }}
            style={styles.fieldInput}
            accessible={true}
            accessibilityLabel="emailAddressForgotPassword"
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => this.focusedInput("forgotEmail")}
            onBlur={() => this.blurredInput("forgotEmail")}
            onChangeText={(forgotEmail) => this.setState({ forgotEmail })}
          />
          <Text
           accessible={true}
           accessibilityLabel="errorEmail"
           style={styles.errorText}>{this.state.forgotEmailError}</Text>
        </View>
        <View>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel="resetPassword"
            style={[styles.createAccountButton, { marginTop: 0 }]}
            onPress={() => {
              Analytics.track(Analytics.events.CLICK_RESET_PASSWORD);
              this.forgotPassword();
            }}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
          <Text
            style={{
              ...styles.signIn,
              textAlign: "center",
              marginTop: getHeight(20),
            }}
            onPress={() => {
              LayoutAnimation.spring();
              Analytics.track(Analytics.events.CLICK_CREATE_AN_ACCOUNT_LINK);
              this.setState({ ...defaultState, form: "SIGN_UP" });
            }}
          >
            Create an account
          </Text>
        </View>
      </View>
    );
  };

  signInApple = async () => {
    const self = this;
    self.setState({ loading: true });
    //const csrf = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );

    try {
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.email) {
        let secureData = await SecureStore.getItemAsync(credential.user);
        if (secureData) {
          secureData = JSON.parse(secureData);
          credential.email = secureData.email;
          credential.fullName = secureData.fullName;
        } else {
          this.setState({ loading: false });
          Alert.alert(
            "Oops!",
            "Your Apple Sign-In has an error. Please reset your Apple Sign-In account for avoMD and sign in again: \n\nSettings -> Tap the first item in the menu [your device name] -> Password/Security -> Apps Using Apple ID -> avoMD -> Stop Using Apple ID"
          );
          return;
        }
      }

      SecureStore.setItemAsync(
        credential.user,
        JSON.stringify({
          email: credential.email,
          fullName: credential.fullName,
          appleIdentityToken: credential.identityToken,
        })
      );
      //console.log("Apple Auth Successfull", credential);
      //const provider = new firebase.auth.OAuthProvider("apple.com");
      const firebaseCredential = firebase.auth.AppleAuthProvider.credential(
        credential.identityToken,
        nonce
      );
      const firstName = credential.fullName?.middleName
        ? credential.fullName?.givenName + " " + credential.fullName?.middleName
        : credential.fullName?.givenName;
      const lastName = credential.fullName?.familyName;
      const name = firstName + " " + lastName;
      await self.socialSignIn(
        {
          email: credential.email,
          name,
          id: credential.user,
          firstName,
          lastName,
        },
        firebaseCredential,
        "apple"
      );
    } catch (e) {
      crashlytics().recordError(e);
      console.log("Error", e);
      if (e.code === "ERR_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
    self.setState({ loading: false });
  };

  onCreatePress = () => {
    let { form } = this.state;
    let isSignUp = form === "SIGN_UP";
    if (isSignUp) {
      Analytics.track(Analytics.events.CLICK_CREATE_ACCOUNT);
      this.signupUser();
    } else {
      Analytics.track(Analytics.events.CLICK_SIGN_IN);
      this.signInUser();
    }
  };

  onChangeForm = (isSignUp) => {
    //LayoutAnimation.easeInEaseOut();
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    isSignUp
      ? this.setState(
          {
            firstNameError: null,
            lastNameError: null,
            signUpEmailError: null,
            signUpPasswordError: null,
          },
          () => {
            this.setState({ form: "SIGN_IN" });
          }
        )
      : this.setState(
          { signInEmailError: null, signInPasswordError: null },
          () => {
            this.setState({ form: "SIGN_UP" });
          }
        );
  };

  render() {
    let { loading, form } = this.state;
    const { dbURL } = this.props;

    let isSignUp = form === "SIGN_UP";
    return (
      <View style={styles.fullSize}>
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
              Alert.alert(
                "",
                "You are switching to " +
                  (dbURL === LIVE_DB ? "staging" : "live") +
                  " environment?",
                [
                  {
                    text: "Yes",
                    onPress: async () => {
                      this.setAppEnvironment(
                        dbURL === LIVE_DB ? STAGING_DB : LIVE_DB
                      );
                    },
                  },
                  {
                    text: "No",
                  },
                ]
              );
            }
          }}
        >
          <Image source={{ uri: "logo" }} style={styles.logo} />
        </TouchableWithoutFeedback>
        {this.state.isForgot ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.onboardTitleLine1}>Forgot{"\n"}Password</Text>
            {this.forgotPasswordForm()}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {isSignUp ? (
              <Text style={styles.onboardTitleLine1}>{"Set Up Account"}</Text>
            ) : (
              <Text style={styles.onboardTitleLine1}>{"Sign In"}</Text>
            )}
            <View
              style={{
                justifyContent: "space-between",
                flex: 1,
              }}
            >
              <View>
                {isSignUp && (
                  <View>
                    <Text style={styles.fieldTitleText}>First Name</Text>
                    <TextInput
                      testID={"textInputFirstName"}
                      style={styles.fieldInput}
                      ref={(sie) => {
                        this.firstName = sie;
                      }}
                      onFocus={() => this.focusedInput("firstName")}
                      onBlur={() => {
                        if (this.state.firstName != "")
                          this.setState({ firstNameError: null });
                        this.blurredInput("firstName");
                      }}
                      value={this.state.firstName}
                      onChangeText={(firstName) => this.setState({ firstName })}
                      onSubmitEditing={() => {
                        if (this.state.firstName != "")
                          this.setState({ firstNameError: null });
                        this.focusedInput("lastName");
                      }}
                    />
                    {this.state.firstNameError && isSignUp && (
                      <Text style={styles.errorText}>
                        {" "}
                        {this.state.firstNameError}
                      </Text>
                    )}
                  </View>
                )}
                {isSignUp && (
                  <View>
                    <Text style={styles.fieldTitleText}>Last Name</Text>
                    <TextInput
                      testID={"textInputLastName"}
                      style={styles.fieldInput}
                      ref={(sie) => {
                        this.lastName = sie;
                      }}
                      onFocus={() => this.focusedInput("lastName")}
                      onBlur={() => {
                        if (this.state.lastName != "")
                          this.setState({ lastNameError: null });
                        this.blurredInput("lastName");
                      }}
                      value={this.state.lastName}
                      onChangeText={(lastName) => this.setState({ lastName })}
                      onSubmitEditing={() => {
                        if (this.state.lastName != "")
                          this.setState({ lastNameError: null });
                        this.focusedInput("emailSignInInput");
                      }}
                    />
                    {this.state.lastNameError && isSignUp && (
                      <Text style={styles.errorText}>
                        {" "}
                        {this.state.lastNameError}
                      </Text>
                    )}
                  </View>
                )}
                <View>
                  <Text style={styles.fieldTitleText}>Email Address</Text>
                  <TextInput
                    testID={"textInputEmailAddress"}
                    style={[styles.fieldInput, { fontSize: getHeight(14) }]}
                    ref={(sie) => {
                      this.emailSignInInput = sie;
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onFocus={() => this.focusedInput("emailSignInInput")}
                    onBlur={() => this.blurredInput("emailSignInInput")}
                    value={
                      isSignUp ? this.state.signUpEmail : this.state.signInEmail
                    }
                    onChangeText={(signInEmail) =>
                      this.setState(
                        isSignUp
                          ? { signUpEmail: signInEmail }
                          : { signInEmail }
                      )
                    }
                    onSubmitEditing={() =>
                      this.focusedInput("passwordSignInInput")
                    }
                    accessible={true}
                    accessibilityLabel="emailAdressInput"
                  />
                  {this.state.signUpEmailError && isSignUp && (
                    <Text style={styles.errorText}>
                      {" "}
                      {this.state.signUpEmailError}
                    </Text>
                  )}
                  {this.state.signInEmailError && !isSignUp && (
                    <Text style={styles.errorText}>
                      {" "}
                      {this.state.signInEmailError}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={[styles.fieldTitleText]}>Password</Text>
                  <View style={[styles.fieldInput, { paddingHorizontal: 0 }]}>
                    <TextInput
                      testID={"textInputPassword"}
                      style={{
                        width: null,
                        height: getHeight(42),
                        borderRadius: getHeight(42) / 2,
                        backgroundColor: "white",
                        paddingHorizontal: getWidth(22),
                        fontSize: getHeight(14),
                      }}
                      ref={(sip) => {
                        this.passwordSignInInput = sip;
                      }}
                      autoCapitalize="none"
                      onFocus={() => this.focusedInput("passwordSignInInput")}
                      onBlur={() => this.blurredInput("passwordSignInInput")}
                      textContentType="password"
                      secureTextEntry={this.state.signInEyeIcon === "eye"}
                      onSubmitEditing={() => {
                        if (isSignUp) {
                          if (this.state.signUpPassword.length < 8) {
                            this.setState({
                              signUpPasswordError:
                                "Password must be longer than 8 characters",
                            });
                          } else {
                            this.setState({ signUpPasswordError: null });
                          }
                        }
                      }}
                      onChangeText={(signInPassword) =>
                        this.setState(
                          isSignUp
                            ? { signUpPassword: signInPassword }
                            : { signInPassword }
                        )
                      }
                      accessible={true}
                      accessibilityLabel="passwordInput"
                    />
                    {this.state.signInEye ? (
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          end: 0,
                          paddingVertical: getHeight(8),
                          paddingHorizontal: getWidth(6),
                        }}
                        onPress={() =>
                          this.setState({
                            signInEyeIcon:
                              this.state.signInEyeIcon === "eye"
                                ? "eye-off"
                                : "eye",
                          })
                        }
                      >
                        <Image
                          style={{
                            height: getHeight(27),
                            width: getHeight(27),
                          }}
                          source={
                            this.state.signInEyeIcon === "eye"
                              ? require("../images/eye-off.png")
                              : require("../images/eye.png")
                          }
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {this.state.signUpPasswordError && isSignUp && (
                    <Text style={styles.errorText}>
                      {" "}
                      {this.state.signUpPasswordError}
                    </Text>
                  )}
                  {this.state.signInPasswordError && !isSignUp && (
                    <Text style={styles.errorText}>
                      {" "}
                      {this.state.signInPasswordError}
                    </Text>
                  )}
                </View>
              </View>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignSelf: "center",
                  }}
                >
                  {Platform.OS === "ios" && this.state.isAppleAuthAvailable && (
                    <TouchableOpacity
                      style={[styles.appleButton, { marginEnd: getWidth(16) }]}
                      onPress={this.signInApple}
                    >
                      <Image
                        style={styles.appleImage}
                        source={require("../../assets/appleIcon.png")}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.appleButton}
                    onPress={this.signInGoogleV2}
                  >
                    <Image
                      style={styles.appleImage}
                      source={require("../../assets/googleIcon.png")}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignSelf: "center",
                    marginTop: getHeight(28),
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.newUserText}>
                    {isSignUp ? "Already an AvoMD user? " : "New user? "}
                  </Text>
                  <TouchableOpacity
                    accessible={true}
                    accessibilityLabel={isSignUp ? "signInLink" : "signUpLink"}
                    testID={isSignUp ? "buttonCreateAccount" : "buttonSignIn"}
                    onPress={() => {
                      this.onChangeForm(isSignUp);
                    }}
                  >
                    <Text
                      style={{
                        color: "#08A88E",
                        fontFamily: fontFamily.Regular,
                        fontSize: getHeight(14),
                      }}
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={this.onCreatePress}
                  style={styles.createAccountButton}
                  accessible={true}
                  accessibilityLabel={
                    isSignUp ? "signUpButton" : "signInButton"
                  }
                >
                  <Text style={styles.buttonText}>
                    {isSignUp ? "Create an account" : "Sign In"}
                  </Text>
                </TouchableOpacity>
                {!isSignUp && (
                  <TouchableOpacity
                    style={{ alignSelf: "center" }}
                    onPress={() => {
                      Analytics.track(Analytics.events.CLICK_RESET_PASSWORD);
                      this.setState({ isForgot: true });
                      LayoutAnimation.spring();
                    }}
                  >
                    <Text
                      style={{
                        color: "#08A88E",
                        fontFamily: fontFamily.Bold,
                        fontSize: getHeight(14),
                        fontWeight: "700",
                        paddingTop: getHeight(20),
                      }}
                    >
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        {loading && (
          <View style={styles.loadingIndicatorContainer}>
            <View style={styles.loadingIndicatorBackground} />
            <ActivityIndicator color="white" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  logo: {
    width: getWidth(80),
    height: getHeight(80),
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: getHeight(16),
  },
  fieldTitleText: {
    color: "black",
    fontWeight: "400",
    fontSize: getHeight(14),
    marginStart: getWidth(60),
    marginBottom: getHeight(4),
    marginTop: getHeight(12),
    fontFamily: fontFamily.Regular,
  },
  errorText: {
    color: "red",
    fontWeight: "400",
    fontSize: getHeight(13),
    marginHorizontal: getWidth(60),
    marginTop: getHeight(6),
    fontFamily: fontFamily.Regular,
  },
  createAccountButton: {
    backgroundColor: "#08A88E",
    borderRadius: getHeight(30),
    marginTop: getHeight(24),
    marginHorizontal: getWidth(25),
    height: getHeight(45),
    width: getWidth(325),
    justifyContent: "center",
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
    shadowRadius: getHeight(10),
  },
  signIn: {
    color: "#08A88E",
    fontSize: getHeight(14),
    fontWeight: "700",
    fontFamily: fontFamily.Regular,
  },
  fullSize: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingTop: getStatusBarHeight(true),
    paddingBottom: Platform.select({
      ios: getHeight(34),
      android: getHeight(20),
    }),
  },
  errorText: {
    color: "red",
    fontWeight: "400",
    fontSize: getHeight(13),
    marginHorizontal: getWidth(55),
    marginTop: getHeight(6),
    fontFamily: fontFamily.Regular,
  },
  buttonText: {
    textAlign: "center",
    fontSize: getHeight(14),
    fontWeight: "700",
    color: "white",
    fontFamily: fontFamily.Regular,
    fontStyle: "normal",
  },
  onboardTitleLine1: {
    fontSize: getHeight(24),
    fontWeight: "bold",
    marginTop: getHeight(20),
    textAlign: "center",
    alignSelf: "center",
    fontFamily: fontFamily.Regular,
    marginBottom: getHeight(28),
  },
  fieldInput: {
    width: getWidth(299),
    height: getHeight(42),
    borderRadius: getHeight(42) / 2,
    alignSelf: "center",
    elevation: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    backgroundColor: "white",
    shadowRadius: 4,
    paddingHorizontal: getWidth(22),
  },
  appleButton: {
    width: getHeight(48),
    height: getHeight(48),
    borderRadius: getHeight(48) / 2,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowRadius: 4,
    backgroundColor: "white",
  },
  appleImage: {
    width: getHeight(48),
    height: getHeight(48),
    borderRadius: getHeight(48) / 2,
    resizeMode: "cover",
  },
  newUserText: {
    color: "black",
    fontWeight: fontWeight.Light,
    fontSize: getHeight(14),
    fontFamily: fontFamily.Regular,
  },
  loadingIndicatorContainer: {
    ...StyleSheet.absoluteFill,
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  loadingIndicatorBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "grey",
    opacity: 0.5,
  },
});

export default connect((state) => ({
  deeplink: state.general.deeplink,
  dbURL: state.persist.dbURL,
}))(SignUpScreenV3);
