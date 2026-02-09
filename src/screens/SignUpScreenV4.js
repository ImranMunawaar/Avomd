import React, { Component } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Alert,
  Platform,
  UIManager,
  LayoutAnimation,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Text
} from "react-native";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";
import "@react-native-firebase/functions";
import { isValid, getDeeplink, setDeeplink } from "../models/modules";
import { deeplinkPaths, fontWeight } from "../constants/strings";
// import { setUserId, logEvent, setUserProperties } from "expo-firebase-analytics";
import * as Analytics from "../services/Analytics";
import * as Crypto from "expo-crypto";
import * as AppleAuth from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import * as helper from "../services/helper";
import Layout from "../constants/Layout";
import store from "../store";
import Env from "../constants/Env";
import Colors from "../constants/Colors";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getHeight,
  getWidth,
  validateEmail,
  isAndroid,
} from "../services/helper";
import { buildVariants, fontFamily } from "../constants/strings";
import { getUniqueId } from "react-native-device-info";
import crashlytics from "@react-native-firebase/crashlytics";

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
  signUpEmailError: null,
  signInEmailError: null,
  forgotEmailError: null,
  signUpPassword: "",
  signInPassword: "",
  signUpPasswordError: null,
  signInPasswordError: null,
  confirmPassword: "",
  confirmPasswordError: null,
  passwordInputEyeIcon: "eye",
  passwordInputEye: false,
  confirmPasswordInputEyeIcon: "eye",
  confirmPasswordInputEye: false,
  signInEyeIcon: "eye",
  signInEye: false,
  isForgot: false,
};
const googleSignInButton = require("../../assets/google-sign-in.png");

const { width, height } = Image.resolveAssetSource(googleSignInButton);

const widthAuthButton = Layout.window.width / 2;
const heightAuthButton = (widthAuthButton * height) / width;

export class SignUpScreenV4 extends Component {
  constructor(props) {
    super(props);
    GoogleSignin.configure({
      webClientId:
        "241855441634-g621e6a93itaqbd8o5pp1ckjt18sefnb.apps.googleusercontent.com",
    });
    this.state = { ...defaultState, logs: "" };
    const releaseConfigurations = require("../../releaseConfigurations.json");
    this.initialSubscription =
      releaseConfigurations.targets[
        releaseConfigurations.activeReleaseTarget
      ].defaultInitialChannels;

    /**Code for bulk user authentication**/
    //import emails from "../../emails";
    /*console.log("Testing emails", emails.length);
    let array = [{
      "name": "Bill K.Tolar",
      "email": "ktolar@pmpediatrics.com"
    }];


    let funcArray = emails.map(item => {
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
  }

  async signUpUserScript(email, name, callback) {
    await firebase.auth().signOut();
    const emailKey = email.replace(/@|\.|#|\$|\[|\]/g, "_");
    setTimeout(async () => {
      await firebase
        .auth()
        //.createUserWithEmailAndPassword(email, "12341234")
        .signInWithEmailAndPassword(email, "12341234")
        .then(async (data) => {
          var db = helper.getDatabaseInstance();
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
    const db = helper.getDatabaseInstance();
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
      await helper
        .getDatabaseInstance()
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
      },
    };
    setDeeplink(deeplink);
  }

  async componentDidMount() {
    const isAppleAuthAvailable = await AppleAuth.isAvailableAsync();
    this.setState({
      startTimestamp: new Date().getTime(),
      isAppleAuthAvailable,
    });
    Analytics.track(Analytics.events.VIEW_ONBOARDING_SCREEN);

    const prev = await AsyncStorage.getItem("previousLogin");
    if (prev) {
      this.setState({ signInEmail: prev, form: "SIGN_IN" });
    }

    let { path, queryParams } = getDeeplink();
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
    } /*else if (path === deeplinkPaths.CDS) {
      if (queryParams && queryParams.bypassCredential) {
        //let byPassEmail = Constants.installationId + "_" + queryParams.bypassCredential;
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
    }*/
  }

  onJobTypeChange = (value) => {
    this.setState({
      jobType: value,
    });
  };

  getValue = () => {
    return this.state.jobType;
  };

  updateUser = async (user) => {
    //console.log(user)
    if (user.finishLater) user.finishLater = null;
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

      //console.log({userInfo});
      const credential = firebase.auth.GoogleAuthProvider.credential(
        userInfo.idToken
      );
      await this.socialSignIn(userInfo.user, credential, "google");
    } catch (error) {
      crashlytics().recordError(error);
      console.log("Error", error);
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
    this.setState({ loading: true });
    const self = this;
    let exists = false,
      dbUser,
      isUserRestricted = false;
    const deviceId = await getUniqueId();
    /**Calling firebase function for checking device id restriction */
    try {
      const isUserDeviceRestricted = firebase
        .functions()
        .httpsCallable("isUserDeviceRestricted");
      const res = await isUserDeviceRestricted({
        userEmail: signUpEmail,
        deviceId: deviceId,
      });
      isUserRestricted = res.data.response;
    } catch (err) {
      console.log("Error isUserDeviceRestricted", err);
    }

    if (Env.BUILD_VARIANT === buildVariants.COLUMBIA && isUserRestricted) {
      this.setState({ loading: false });
      Alert.alert(
        "Device Limit Exceeds",
        "You cannot use this email address on more than 3 devices. Please use any other one."
      );
      return;
    }

    await firebase
      .auth()
      .signInWithCredential(credential)
      .then(async (data) => {
        exists = !data.additionalUserInfo.isNewUser;
        /** fetching user record from DB */
        await helper
          .getDatabaseInstance()
          .ref()
          .child("users")
          .child(data.user.uid)
          .once("value", (snapshot) => {
            dbUser = snapshot.val();
          });
        if (exists) {
          this.updateUserFirebaseDB(data.user.uid, dbUser, user, false);
          Analytics.identify(data.user.email, {
            "last seen date": new Date().toString(),
            //num logins
          });
          Analytics.track(Analytics.events.LOGIN, {
            type: authProvider,
            duration: this.duration(),
          });

          self.updateUser({
            uid: data.user.uid,
            email: data.user.email,
            gid: user.id,
          });
          this.setState({ loading: false });
          self.props.navigation.navigate("Modules");
          AsyncStorage.setItem("previousLogin", data.user.email);
        } else {
          this.updateUserFirebaseDB(data.user.uid, dbUser, user, true);
          self.updateUser({
            uid: data.user.uid,
            gid: user.id,
            email: user.email,
          });

          const signUpDate = new Date().toString();
          Analytics.identify(user.email, {
            "sign up date": signUpDate,
            "account type": authProvider,
            "last seen date": signUpDate,
            //num logins
          });
          Analytics.track(Analytics.events.SIGNUP, {
            type: authProvider,
            duration: this.duration(),
          });
          this.setState({ loading: false });
          self.props.navigation.navigate("Questionnaire");
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
        crashlytics().recordError(err);
        console.log("signInWithCredential error", err);
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

  signupUser = async () => {
    const self = this;
    var success = true;
    let { signUpEmail, signUpPassword, confirmPassword } = this.state;
    if (!isValid(signUpEmail)) {
      const errMsg = "Email is required";
      this.setState({ signUpEmailError: errMsg });
      Analytics.track(Analytics.events.SIGNUP_ERROR, {
        type: "email",
        error: errMsg,
      });

      success = false;
    }

    if (!validateEmail(signUpEmail)) {
      const errMsg = "Please enter valid email";
      this.setState({ signUpEmailError: errMsg });
      Analytics.track(Analytics.events.SIGNUP_ERROR, {
        type: "email",
        error: errMsg,
      });

      success = false;
    }
    if (success) {
      this.setState({ signUpEmailError: "" });
    }

    if (!isValid(signUpPassword)) {
      const errMsg = "Password is required";
      this.setState({ signUpPasswordError: errMsg });
      Analytics.track(Analytics.events.SIGNUP_ERROR, {
        type: "email",
        error: errMsg,
      });

      success = false;
    } else {
      this.setState({ signUpPasswordError: "" });
    }
    /*if (signUpPassword !== confirmPassword) {
      const errMsg = "Passwords must match";
      this.setState({ confirmPasswordError: errMsg });
      Analytics.track(Analytics.events.SIGNUP_ERROR, { type: "email", error: errMsg });

      success = false;
    }*/

    if (!success) {
      return;
    }
    this.setState({
      signUpPasswordError: "",
      signUpEmailError: "",
      loading: true,
    });
    let isUserRestricted = false,
      dbUser = {};
    const deviceId = await getUniqueId();
    /**Calling firebase function for checking device id restriction */
    try {
      const isUserDeviceRestricted = firebase
        .functions()
        .httpsCallable("isUserDeviceRestricted");
      const res = await isUserDeviceRestricted({
        userEmail: signUpEmail,
        deviceId: deviceId,
      });
      isUserRestricted = res.data.response;
    } catch (err) {
      console.log("Error isUserDeviceRestricted", err);
    }

    if (Env.BUILD_VARIANT === buildVariants.COLUMBIA && isUserRestricted) {
      this.setState({ loading: false });
      Alert.alert(
        "Device Limit Exceeds",
        "You cannot use this email address on more than 3 devices. Please use any other one."
      );
      return;
    }

    await firebase
      .auth()
      .createUserWithEmailAndPassword(
        this.state.signUpEmail,
        this.state.signUpPassword
      )
      .then((data) => {
        this.updateUserFirebaseDB(
          data.user.uid,
          dbUser,
          { email: self.state.signUpEmail },
          true
        );
        self.updateUser({ uid: data.user.uid, email: data.user.email });

        const signUpDate = new Date().toString();
        Analytics.identify(data.user.email, {
          "sign up date": signUpDate,
          "account type": "email",
          "last seen date": signUpDate,
          //num logins
        });
        Analytics.track(Analytics.events.SIGNUP, {
          type: "email",
          duration: this.duration(),
        });

        AsyncStorage.setItem("previousLogin", data.user.email);

        self.props.navigation.navigate("Questionnaire");
      })
      .catch((err) => {
        this.setState({ loading: false });
        console.log(err, err.message);
        crashlytics().recordError(err);
        Analytics.track(Analytics.events.SIGNUP_ERROR, {
          type: "email",
          error: err.message,
        });

        if (err.message.toLowerCase().includes("password")) {
          self.setState({ signUpPasswordError: err.message });
        } else if (
          err.message.toLowerCase().includes("email address") ||
          err.message.toLowerCase().includes("email")
        ) {
          self.setState({ signUpEmailError: err.message });
        }
      });
  };

  focusedInput = (ref) => {
    /*this[ref].setNativeProps({
      style: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#3AE27C"
      }
    });*/
    if (ref === "passwordInput") {
      this.setState({ passwordInputEye: true });
    } else if (ref === "confirmPasswordInput") {
      this.setState({ confirmPasswordInputEye: true });
    } else if (ref === "passwordSignInInput") {
      this.setState({ signInEye: true });
    }
    this.setState({ forgotEmailError: null });
    this[ref].focus();
  };

  blurredInput = (ref) => {
    /*this[ref].setNativeProps({
      style: {
        backgroundColor: "#D5F1E0",
        borderWidth: 0,
        borderColor: "transparent"
      }
    });*/
    if (ref === "passwordInput") {
      this.setState({ passwordInputEye: false });
    } else if (ref === "confirmPasswordInput") {
      this.setState({ confirmPasswordInputEye: false });
    } else if (ref === "passwordSignInInput") {
      this.setState({ signInEye: false });
    }
  };

  signUpForm = () => {
    return (
      <View>
        <View style={styles.doubleInput}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              ref={(c) => {
                this.firstNameInput = c;
              }}
              style={styles.textInput}
              onFocus={() => this.focusedInput("firstNameInput")}
              onBlur={() => this.blurredInput("firstNameInput")}
              onSubmitEditing={() => this.focusedInput("lastNameInput")}
              onChangeText={(firstName) => this.setState({ firstName })}
            />
          </View>
          <View style={{ ...styles.inputWrap, marginLeft: -20 }}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              ref={(c) => {
                this.lastNameInput = c;
              }}
              style={styles.textInput}
              onFocus={() => this.focusedInput("lastNameInput")}
              onBlur={() => this.blurredInput("lastNameInput")}
              onSubmitEditing={() => this.focusedInput("emailInput")}
              onChangeText={(lastName) => this.setState({ lastName })}
            />
          </View>
        </View>
        <View style={styles.inputWrap}>
          <Text
            style={{
              color: "red",
              fontSize: 13,
              width: 300,
              fontFamily: fontFamily.Regular,
            }}
          >
            {this.state.signUpEmailError}
          </Text>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            ref={(c) => {
              this.emailInput = c;
            }}
            style={styles.textInput}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => this.focusedInput("emailInput")}
            onBlur={() => this.blurredInput("emailInput")}
            onSubmitEditing={() => this.focusedInput("passwordInput")}
            onChangeText={(signUpEmail) => this.setState({ signUpEmail })}
          />
        </View>
        <View style={styles.inputWrap}>
          <Text
            style={{
              color: "red",
              fontSize: 12,
              width: 300,
              fontFamily: fontFamily.Regular,
            }}
          >
            {this.state.signUpPasswordError}
          </Text>
          <Text style={styles.label}>Password</Text>
          <View>
            <TextInput
              ref={(c) => {
                this.passwordInput = c;
              }}
              style={styles.textInput}
              autoCapitalize="none"
              onFocus={() => this.focusedInput("passwordInput")}
              onBlur={() => this.blurredInput("passwordInput")}
              onSubmitEditing={() => {
                if (this.state.signUpPassword.length < 8) {
                  this.setState({
                    signUpPasswordError:
                      "Password must be longer than 8 characters",
                  });
                } else {
                  this.setState({ signUpPasswordError: null });
                  this.focusedInput("confirmPasswordInput");
                }
              }}
              textContentType="password"
              secureTextEntry={this.state.passwordInputEyeIcon === "eye"}
              onChangeText={(signUpPassword) =>
                this.setState({ signUpPassword })
              }
            />
            {this.state.passwordInputEye ? (
              <TouchableOpacity
                style={{ position: "absolute", top: 10, right: 5 }}
                onPress={() =>
                  this.setState({
                    passwordInputEyeIcon:
                      this.state.passwordInputEyeIcon === "eye"
                        ? "eye-off"
                        : "eye",
                  })
                }
              >
                <Image
                  style={{ height: getHeight(24), width: getWidth(24) }}
                  source={
                    this.state.passwordInputEyeIcon === "eye"
                      ? require("../images/eye-off.png")
                      : require("../images/eye.png")
                  }
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <View style={styles.inputWrap}>
          <Text
            style={{
              color: "red",
              fontSize: 12,
              width: 300,
              fontFamily: fontFamily.Regular,
            }}
          >
            {this.state.confirmPasswordError}
          </Text>
          <Text style={styles.label}>Confirm Password</Text>
          <View>
            <TextInput
              ref={(c) => {
                this.confirmPasswordInput = c;
              }}
              style={styles.textInput}
              autoCapitalize="none"
              onFocus={() => this.focusedInput("confirmPasswordInput")}
              onBlur={() => this.blurredInput("confirmPasswordInput")}
              textContentType="password"
              secureTextEntry={this.state.confirmPasswordInputEyeIcon === "eye"}
              onChangeText={(confirmPassword) => {
                this.setState({ confirmPassword });
                if (confirmPassword !== this.state.signUpPassword) {
                  this.confirmPasswordInput.setNativeProps({
                    style: {
                      borderColor: "red",
                    },
                  });
                } else {
                  this.confirmPasswordInput.setNativeProps({
                    style: {
                      borderColor: "#3AE27C",
                    },
                  });
                }
              }}
            />
            {this.state.confirmPasswordInputEye ? (
              <TouchableOpacity
                style={{ position: "absolute", top: 10, right: 5 }}
                onPress={() =>
                  this.setState({
                    confirmPasswordInputEyeIcon:
                      this.state.confirmPasswordInputEyeIcon === "eye"
                        ? "eye-off"
                        : "eye",
                  })
                }
              >
                <Image
                  style={{ height: getHeight(24), width: getWidth(24) }}
                  source={
                    this.state.confirmPasswordInputEyeIcon === "eye"
                      ? require("../images/eye-off.png")
                      : require("../images/eye.png")
                  }
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <Pressable
          style={styles.createAccountButton}
          onPress={() => {
            Analytics.track(Analytics.events.CLICK_CREATE_ACCOUNT);
            this.signupUser();
          }}
        >
          <Text style={{ textAlign: "center", fontFamily: fontFamily.Regular }}>
            CREATE ACCOUNT
          </Text>
        </Pressable>
        <Text style={styles.already}>
          Already have an account?{" "}
          <Text
            style={styles.signIn}
            onPress={() => {
              Analytics.track(Analytics.events.CLICK_SIGN_IN_LINK);
              this.setState({
                ...defaultState,
                form: "SIGN_IN",
              });
            }}
          >
            Sign In
          </Text>
        </Text>
      </View>
    );
  };

  signInUser = async () => {
    const email = this.state.signInEmail;
    const password = this.state.signInPassword;

    if (!isValid(email)) {
      const errMsg = "Please enter valid email";
      this.setState({ signInEmailError: errMsg });
      Analytics.track(Analytics.events.LOGIN_ERROR, {
        type: "Email",
        error: errMsg,
      });
      return;
    }
    if (!validateEmail(email)) {
      const errMsg = "Please enter valid email";
      this.setState({ signInEmailError: errMsg });
      Analytics.track(Analytics.events.LOGIN_ERROR, {
        type: "Email",
        error: errMsg,
      });
      return;
    }

    if (!isValid(password)) {
      const errMsg = "Password is required";
      this.setState({ signInPasswordError: errMsg });
      Analytics.track(Analytics.events.LOGIN_ERROR, {
        type: "Password",
        error: errMsg,
      });
      return;
    }

    this.setState({
      signInEmailError: "",
      signInPasswordError: "",
      loading: true,
    });
    let dbUser,
      isUserRestricted = false;
    const deviceId = await getUniqueId();
    /**Calling firebase function for checking device id restriction */
    try {
      const isUserDeviceRestricted = firebase
        .functions()
        .httpsCallable("isUserDeviceRestricted");
      const res = await isUserDeviceRestricted({
        userEmail: signUpEmail,
        deviceId: deviceId,
      });
      isUserRestricted = res.data.response;
    } catch (err) {
      console.log("Error isUserDeviceRestricted", err);
    }

    if (Env.BUILD_VARIANT === buildVariants.COLUMBIA && isUserRestricted) {
      this.setState({ loading: false });
      Alert.alert(
        "Device Limit Exceeds",
        "You cannot use this email address on more than 3 devices. Please use any other one."
      );
      return;
    }

    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (data) => {
        //*fetching user record from DB */
        await helper
          .getDatabaseInstance()
          .ref()
          .child("users")
          .child(data.user.uid)
          .once("value", (snapshot) => {
            dbUser = snapshot.val();
          });
        // if (!dbUser?.deviceIds) {
        //   dbUser = {};
        //   dbUser.deviceIds = [];
        // }
        this.updateUserFirebaseDB(data.user.uid, dbUser, {}, false);
        this.updateUser({ uid: data.user.uid, email: data.user.email });
        AsyncStorage.setItem("previousLogin", data.user.email);

        Analytics.identify(data.user.email, {
          "last seen date": new Date().toString(),
          //num logins
        });
        Analytics.track(Analytics.events.LOGIN, {
          type: "email",
          duration: this.duration(),
        });

        this.setState({ loading: false });
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

        if (err.message.toLowerCase().includes("password")) {
          this.setState({ signInPasswordError: err.message });
        } else if (
          err.message.toLowerCase().includes("email address") ||
          err.message.toLowerCase().includes("email")
        ) {
          this.setState({ signInEmailError: err.message });
        }
      });
  };

  signInForm = () => {
    return (
      <View>
        <Pressable
          transparent
          iconLeft
          onPress={async () => {
            Analytics.track(Analytics.events.CLICK_CREATE_AN_ACCOUNT_LINK);
            this.setState({ ...defaultState, form: "SIGN_UP" });
          }}
          style={{ width: "50%" }}
        >
          <Image
            style={{ height: getHeight(20), width: getWidth(20) }}
            source={require("../images/arrow.png")}
          />
          <Text
            style={{ ...styles.signIn, marginLeft: 23, position: "absolute" }}
          >
            Create an account
          </Text>
        </Pressable>
        <View style={styles.inputWrap}>
          <Text
            style={{
              color: "red",
              fontSize: 13,
              width: 300,
              fontFamily: fontFamily.Regular,
            }}
          >
            {this.state.signInEmailError}
          </Text>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            ref={(sie) => {
              this.emailSignInInput = sie;
            }}
            style={styles.textInput}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => this.focusedInput("emailSignInInput")}
            onBlur={() => this.blurredInput("emailSignInInput")}
            value={this.state.signInEmail}
            onChangeText={(signInEmail) => this.setState({ signInEmail })}
            onSubmitEditing={() => this.focusedInput("passwordSignInInput")}
          />
        </View>
        <View style={styles.inputWrap}>
          <Text
            style={{
              color: "red",
              fontSize: 12,
              width: 300,
              fontFamily: fontFamily.Regular,
            }}
          >
            {this.state.signInPasswordError}
          </Text>
          <Text style={styles.label}>Password</Text>
          <View>
            <TextInput
              ref={(sip) => {
                this.passwordSignInInput = sip;
              }}
              style={styles.textInput}
              autoCapitalize="none"
              onFocus={() => this.focusedInput("passwordSignInInput")}
              onBlur={() => this.blurredInput("passwordSignInInput")}
              textContentType="password"
              secureTextEntry={this.state.signInEyeIcon === "eye"}
              onChangeText={(signInPassword) =>
                this.setState({ signInPassword })
              }
            />
            {this.state.signInEye ? (
              <TouchableOpacity
                style={{ position: "absolute", paddingTop: 10, paddingEnd: 5 }}
                onPress={() =>
                  this.setState({
                    signInEyeIcon:
                      this.state.signInEyeIcon === "eye" ? "eye-off" : "eye",
                  })
                }
              >
                <Image
                  style={{ height: getHeight(24), width: getWidth(24) }}
                  source={
                    this.state.signInEyeIcon === "eye"
                      ? require("../images/eye-off.png")
                      : require("../images/eye.png")
                  }
                />
              </TouchableOpacity>
            ) : null}
            <Text
              style={{ ...styles.signIn, textDecorationLine: "none" }}
              onPress={() => {
                Analytics.track(Analytics.events.CLICK_FORGOT_PASSWORD_LINK);
                this.setState({ ...defaultState, form: "FORGOT" });
              }}
            >
              Forgot password?
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.createAccountButton}
          onPress={() => {
            Analytics.track(Analytics.events.CLICK_SIGN_IN);
            this.signInUser();
          }}
        >
          <Text style={{ textAlign: "center", fontFamily: fontFamily.Regular }}>
            SIGN IN
          </Text>
        </Pressable>
      </View>
    );
  };

  forgotPasswordForm = () => {
    return (
      <View>
        <Text style={styles.fieldTitleText}>Email Address</Text>
        <TextInput
          style={styles.fieldInput}
          ref={(sie) => {
            this.forgotEmail = sie;
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => this.focusedInput("forgotEmail")}
          onBlur={() => this.blurredInput("forgotEmail")}
          value={this.state.forgotEmail}
          onChangeText={(forgotEmail) => this.setState({ forgotEmail })}
        />
        <Text
          style={{
            color: "red",
            fontSize: 12,
            marginStart: getWidth(64),
            marginEnd: getWidth(64),
            fontFamily: fontFamily.Regular,
            marginTop: getHeight(10),
          }}
        >
          {this.state.forgotEmailError}
        </Text>

        <TouchableOpacity
          onPress={this.forgotPassword}
          style={{
            ...styles.nextButton,
            marginTop: this.state.forgotEmailError
              ? getHeight(245)
              : getHeight(258),
          }}
        >
          <Text style={styles.nextText}>Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignSelf: "center" }}
          onPress={() => {
            this.setState({ isForgot: false, form: "SIGN_UP" });
          }}
        >
          <Text
            style={{
              color: Colors.borderColor,
              fontFamily: fontFamily.Bold,
              fontSize: getHeight(16),
              fontWeight: "700",
            }}
          >
            Create an account
          </Text>
        </TouchableOpacity>
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
      const firebaseCredential = new firebase.auth.AppleAuthProvider.credential(
        credential.identityToken,
        nonce
      );
      const name = credential.fullName.givenName;
      await self.socialSignIn(
        { email: credential.email, name, id: credential.user },
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

  onContinuePress = () => {
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

  forgotPassword = async () => {
    const email = this.state.forgotEmail;
    await firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert(
          "Reset Password",
          "Password reset instructions have been sent to your email address!"
        );
        Analytics.track(Analytics.events.RESET_PASSWORD, { "sent to": email });
      })
      .catch((error) => {
        this.setState({ forgotEmailError: error.message });
        crashlytics().recordError(error);
        Analytics.track(Analytics.events.RESET_PASSWORD_ERROR, {
          for: email,
          error: error.message,
        });
      });
  };

  render() {
    let { form, loading } = this.state;
    let isSignUp = form === "SIGN_UP";
    return (
      <SafeAreaView style={styles.fullSize}>
        {this.state.isForgot ? (
          <View>
            <Text style={styles.forgotTitle}>Forgot{"\n"}Password</Text>
            {this.forgotPasswordForm()}
          </View>
        ) : (
          <View style={styles.fullSize}>
            {isSignUp ? (
              <Text style={styles.onboardTitleLine1}>{"Set up account"}</Text>
            ) : (
              <Text style={styles.onboardTitleLine1}>{"Sign In"}</Text>
            )}
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1, position: "relative" }}>
                <Text style={styles.fieldTitleText}>Email Address</Text>
                <TextInput
                  style={styles.fieldInput}
                  ref={(sie) => {
                    this.emailSignInInput = sie;
                  }}
                  accessible={true}
                  accessibilityLabel="emailAddressForgotPassword"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => this.focusedInput("emailSignInInput")}
                  onBlur={() => this.blurredInput("emailSignInInput")}
                  value={
                    isSignUp ? this.state.signUpEmail : this.state.signInEmail
                  }
                  onChangeText={(signInEmail) =>
                    this.setState(
                      isSignUp ? { signUpEmail: signInEmail } : { signInEmail }
                    )
                  }
                  onSubmitEditing={() =>
                    this.focusedInput("passwordSignInInput")
                  }
                />
                <Text
                  style={{
                    color: "red",
                    fontSize: 12,
                    marginStart: getWidth(54),
                    fontFamily: fontFamily.Regular,
                    marginTop: getHeight(10),
                  }}
                >
                  {isSignUp
                    ? this.state.signUpEmailError
                    : this.state.signInEmailError}
                </Text>
                <Text
                  style={[styles.fieldTitleText, { marginTop: getHeight(8) }]}
                >
                  Password
                </Text>
                <View style={[styles.fieldInput, { paddingHorizontal: 0 }]}>
                  <TextInput
                    style={{
                      width: null,
                      height: getHeight(42),
                      borderRadius: getHeight(42) / 2,
                      backgroundColor: "white",
                      paddingHorizontal: getWidth(15),
                    }}
                    ref={(sip) => {
                      this.passwordSignInInput = sip;
                    }}
                    autoCapitalize="none"
                    onFocus={() => this.focusedInput("passwordSignInInput")}
                    onBlur={() => this.blurredInput("passwordSignInInput")}
                    textContentType="password"
                    secureTextEntry={this.state.signInEyeIcon === "eye"}
                    onChangeText={(signInPassword) =>
                      this.setState(
                        isSignUp
                          ? { signUpPassword: signInPassword }
                          : { signInPassword }
                      )
                    }
                    value={
                      isSignUp
                        ? this.state.signUpPassword
                        : this.state.signInPassword
                    }
                  />
                  {this.state.signInEye ? (
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        end: 0,
                        paddingVertical: getHeight(11),
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
                        style={{ height: getHeight(24), width: getHeight(24) }}
                        source={
                          this.state.signInEyeIcon === "eye"
                            ? require("../images/eye-off.png")
                            : require("../images/eye.png")
                        }
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Text
                  style={{
                    color: "red",
                    fontSize: 12,
                    marginStart: getWidth(54),
                    marginTop: getHeight(10),
                  }}
                >
                  {isSignUp
                    ? this.state.signUpPasswordError
                    : this.state.signInPasswordError}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignSelf: "center",
                    marginTop: isAndroid ? getHeight(0) : getHeight(28),
                  }}
                >
                  {Platform.OS === "ios" && this.state.isAppleAuthAvailable && (
                    <TouchableOpacity
                      style={[
                        styles.appleButton,
                        { marginEnd: getWidth(11.65) },
                      ]}
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
                    marginTop: getHeight(53),
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.newUserText}>
                    {isSignUp ? "Already an AvoMD user? " : "New user? "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      LayoutAnimation.spring();
                      this.setState({ form: isSignUp ? "SIGN_IN" : "SIGN_UP" });
                    }}
                  >
                    <Text
                      style={{
                        color: Env.SIGN_IN_TEXT_COLOR,
                        fontWeight: fontWeight.Bold,
                        fontFamily: fontFamily.Regular,
                      }}
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Pressable
                  onPress={this.onContinuePress}
                  style={styles.nextButton}
                >
                  <Text style={styles.nextText}>Continue</Text>
                </Pressable>
                {!isSignUp && (
                  <TouchableOpacity
                    accessible={true}
                    accessibilityLabel="resetPassword"
                    style={{ alignSelf: "center" }}
                    onPress={() => {
                      Analytics.track(Analytics.events.CLICK_RESET_PASSWORD);
                      this.setState({ isForgot: true });
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.borderColor,
                        fontFamily: fontFamily.Bold,
                        fontSize: getHeight(16),
                        fontWeight: "700",
                      }}
                    >
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* <TouchableOpacity onPress={async () => {
            let user = JSON.stringify(await AsyncStorage.getItem("user"));
            store.dispatch({
              type: "SET_GENERAL_VAR",
              key: "finishLater",
              data: true
            });
            if (!user) {
              user = { finishLater: true };
            }
            await AsyncStorage.setItem("user", JSON.stringify(user));
            this.props.navigation.navigate("Modules");
          }}>
            <Text
              style={styles.tryOnceText}>
              Finish Later
            </Text>
          </TouchableOpacity> */}
          </View>
        )}
        {loading && (
          <View style={styles.loadingIndicatorContainer}>
            <View style={styles.loadingIndicatorBackground} />
            <ActivityIndicator color="white" />
          </View>
        )}
      </SafeAreaView>
    );
  }
  updateUserFirebaseDB = async (userUid, dbUser, user, isNewUser) => {
    if (!dbUser?.deviceIds) {
      dbUser = {};
      dbUser.deviceIds = [];
    }
    const deviceId = await getUniqueId();
    const db = helper.getDatabaseInstance();
    const baseStr = "users/" + userUid + "/";
    let writer = db.ref(baseStr + "deviceIds");
    if (!dbUser?.deviceIds?.includes(deviceId)) {
      dbUser.deviceIds.push(deviceId);
      writer.set(dbUser.deviceIds);
    }
    if (isNewUser) {
      if (user.name) {
        writer = db.ref(baseStr + "name");
        writer.set(user.name);
      }
      writer = db.ref(baseStr + "email");
      writer.set(user.email);
      writer = db.ref(baseStr + "subscriptions");
      writer.set(this.initialSubscription);
      if (Env.BUILD_VARIANT === buildVariants.PREOP) {
        writer = db.ref(baseStr + "isPreOpUser");
        writer.set(true);
      } else if (Env.BUILD_VARIANT === buildVariants.COLUMBIA) {
        writer = db.ref(baseStr + "isColumbiaUser");
        writer.set(true);
      }
    }
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    position: "absolute",
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 30,
    borderRadius: 10,
  },
  title: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontSize: 30,
    color: "#FFF",
  },
  googleButton: {
    resizeMode: "contain",
    flex: 1,
    aspectRatio: widthAuthButton / heightAuthButton,
  },
  separator: {
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
    color: "rgba(66, 66, 66, 0.6)",
  },
  doubleInput: {
    display: "flex",
    flexDirection: "row",
  },
  inputWrap: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  label: { fontFamily: fontFamily.Regular },
  textInput: {
    height: 35,
    backgroundColor: Colors.primaryColor,
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 5,
    textAlign: "left",
    fontSize: 14,
    borderRadius: 4,
  },
  createAccountButton: {
    backgroundColor: "#08CA68",
    borderRadius: 6,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  already: {
    marginTop: 35,
    marginLeft: "auto",
    marginRight: "auto",
    fontFamily: fontFamily.Regular,
  },
  signIn: {
    color: "#02BB71",
    textDecorationLine: "underline",
    fontFamily: fontFamily.Regular,
  },
  fullSize: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  forgotTitle: {
    fontSize: getHeight(40),
    fontWeight: "bold",
    marginTop: getHeight(78),
    textAlign: "center",
    alignSelf: "center",
    fontFamily: fontFamily.Regular,
    marginBottom: getHeight(58),
  },
  onboardTitleLine1: {
    fontSize: getHeight(40),
    fontWeight: "bold",
    marginTop: getHeight(100),
    textAlign: "center",
    alignSelf: "center",
    fontFamily: fontFamily.Regular,
    marginBottom: getHeight(58),
  },
  fieldTitleText: {
    color: "black",
    fontWeight: fontWeight.Light,
    fontSize: getHeight(16),
    marginStart: getWidth(54),
    marginBottom: getHeight(10),
    fontFamily: fontFamily.Regular,
  },
  fieldInput: {
    width: getWidth(277),
    height: getHeight(42),
    borderRadius: getHeight(42) / 2,
    alignSelf: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    backgroundColor: "white",
    shadowRadius: 4,
    paddingHorizontal: 15,
  },
  appleButton: {
    width: getHeight(37),
    height: getHeight(37),
    borderRadius: getHeight(37) / 2,
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
    width: getHeight(37),
    height: getHeight(37),
    borderRadius: getHeight(37) / 2,
    resizeMode: "cover",
  },
  newUserText: {
    color: "black",
    fontWeight: fontWeight.Light,
    fontSize: getHeight(16),
    fontFamily: fontFamily.Regular,
  },
  nextButton: {
    width: getWidth(255),
    height: getHeight(58),
    borderRadius: getHeight(58 / 2),
    alignSelf: "center",
    elevation: 4,
    marginTop: isAndroid ? getHeight(59) : getHeight(120),
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    backgroundColor: Env.PRIMARY_COLOR,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getHeight(10),
  },
  nextText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 21,
  },
  tryOnceText: {
    color: "black",
    fontWeight: fontWeight.Light,
    fontSize: 16,
    alignSelf: "center",
    marginBottom: 51,
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
