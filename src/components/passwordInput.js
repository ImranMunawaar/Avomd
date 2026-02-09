import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, Pressable, TextInput } from "react-native";
import { getHeight, getWidth } from "../services/helper";
import Colors from "../constants/Colors";
import { fontFamily } from "../constants/strings";

const PasswordInput = ({ _this }) => {
  const { showPasswordInput } = _this.state;
  return (
    <View style={styles.passwordInputContainer}>
      <View style={styles.passwordInputInnerContainer}>
        <TouchableOpacity
          onPress={() => _this.setState({ showPasswordInput: false })}
          style={styles.closeButton}
        >
          <Image
            source={require("../images/close.png")}
            style={{
              width: getWidth(27),
              height: getHeight(27),
            }}
          />
        </TouchableOpacity>
        <Text style={styles.passwordText}>Password</Text>
        <TextInput
          accessible={true}
          accessibilityLabel="passwordChannel"
          style={styles.passwordInput}
          placeholder={"•••••"}
          placeholderTextColor={"#0000001A"}
          autoCapitalize="none"
          onChangeText={(text) => _this.onChangePassword(text)}
          secureTextEntry
        />
        <Pressable
          disabled={!_this.state.invitationCode}
          onPress={_this.onDonePress}
          accessible={true}
          accessibilityLabel="btnDone"
          style={[
            styles.addButton,
            {
              alignSelf: "center",
              backgroundColor: Colors.button,
              opacity: !_this.state.invitationCode ? 0.5 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: "#ffffff" }]}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordInputContainer: {
    position: "absolute",
    backgroundColor: "#00000040",
    top: 0,
    bottom: 0,
    start: 0,
    end: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 4.1,
  },
  passwordInputInnerContainer: {
    backgroundColor: "#EDEDED",
    borderRadius: getHeight(22),
    alignItems: "center",
    justifyContent: "center",
    width: "78.5%",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowRadius: 4,
    zIndex: 400,
  },
  closeButton: {
    position: "absolute",
    end: 0,
    top: 0,
    backgroundColor: "transparent",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowRadius: 4,
    padding: getHeight(12),
  },
  passwordText: {
    fontSize: getHeight(18),
    fontWeight: "600",
    color: "black",
    marginVertical: getHeight(15),
    fontFamily: fontFamily.Bold,
  },
  passwordInput: {
    width: "73.42%",
    textAlign: "center",
    fontSize: getHeight(26),
    backgroundColor: "white",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowRadius: 4,
    borderRadius: getHeight(32),
    flex: 0,
    marginBottom: getHeight(15),
  },
  addButton: {
    borderRadius: getHeight(40),
    alignSelf: "flex-start",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowRadius: 4,
    padding: getHeight(10),
    paddingHorizontal: getWidth(17),
    marginBottom: getHeight(20),
  },
  buttonText: {
    fontSize: getHeight(16),
    fontFamily: fontFamily.Bold,
    fontWeight: "600",
    lineHeight: getHeight(16),
  },
});

export default PasswordInput;
