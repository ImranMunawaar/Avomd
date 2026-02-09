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
} from "react-native";

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";

import Colors from "../constants/Colors";
import crashlytics from "@react-native-firebase/crashlytics";

/*
passwordReset: email => {
  return firebase.auth().sendPasswordResetEmail(email)
},*/

export class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      errorMessage: "",
    };
    this.forgotPassword = this.forgotPassword.bind(this);
  }

  async componentDidMount() {}

  async forgotPassword() {
    const email = this.state.email;

    try {
      await firebase.auth().sendPasswordResetEmail(email);
      this.props.navigation.navigate("SignIn");
    } catch (error) {
      crashlytics().recordError(error);
      console.log(error);
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.fullSize} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.signin_container}
          keyboardShouldPersistTaps="never"
          scrollEnabled={false}
        >
          <Text style={styles.text}>Forgot Password?</Text>
          <View style={styles.signin_form_container}>
            <Text>{this.state.errorMessage}</Text>
            <TextInput
              style={styles.signin_input}
              onChangeText={(email) => this.setState({ email })}
              value={this.state.email}
              placeholder="EMAIL ADDRESS"
              autoCapitalize="none"
              onFocus={() => this.setState({ email: "" })}
              underlineColorAndroid="#fff"
            />
          </View>
          <View style={styles.signin_actions_container}>
            <TouchableOpacity
              onPress={this.forgotPassword}
              style={styles.signin_button}
            >
              <Text style={styles.signin_button_text}>Send Email</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

/*
<TouchableOpacity onPress={() => this.props.navigation.navigate('ForgotPassword')}>
              <Text style={styles.signup_button}>
                FORGOT PASSWORD?
              </Text>
            </TouchableOpacity>
 */

const styles = StyleSheet.create({
  fullSize: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  signin_container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
  },
  signin_form_container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signin_actions_container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
  signin_input: {
    width: 200,
    height: 40,
    borderColor: "gray",
    borderBottomWidth: 1,
    marginTop: 5,
    marginBottom: 20,
    textAlign: "left",
    fontSize: 10,
  },
  signin_button: {
    backgroundColor: Colors.infoBoxThemeColor,
    width: Dimensions.get("window").width,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  forgot_button: {
    backgroundColor: "#ca303f",
    width: Dimensions.get("window").width,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  signin_button_text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 10,
  },
  signup_button: {
    backgroundColor: "#fff",
    color: Colors.infoBoxThemeColor,
    width: 200,
    margin: 10,
    height: 20,
    fontSize: 13,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
