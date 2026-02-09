import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Pressable, TextInput } from "react-native";
// This is related to old design. If we need we have to redesign according to new react native components
// import { Icon } from "native-base";
import Colors from "../constants/Colors";

const redeemCodeInput =
  ({
     _this
   }) => {
    return (
      <View style={styles.passwordInputContainer}>
        <View style={styles.passwordInputInnerContainer}>
          <TouchableOpacity
            onPress={() => {
              _this.setState({ showRedeemCodeInput: false });
              if(_this.onRedeemInputClosePress){
                _this.onRedeemInputClosePress();
              }
            }}
            style={styles.closeButton}>
            {/* <Icon
              type={"SimpleLineIcons"}
              name={"close"}
              style={{
                fontSize: 27,
                color: "#00000034"
              }}/> */}
          </TouchableOpacity>
          <Text style={styles.passwordText}>Redeem Code</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder={"12345"}
            placeholderTextColor={"#0000001A"}
            autoCapitalize="none"
            onChangeText={(text) => _this.onChangeRedeemCode(text)}/>
          <Pressable
            onPress={_this.onRedeemInputDonePress}
            style={[styles.addButton, { backgroundColor: "white", alignSelf: "center" }]}>
            <Text
              style={[styles.buttonText, { color: Colors.primaryColor }]}>
              done
            </Text>
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
    justifyContent: "center"
  },
  passwordInputInnerContainer: {
    backgroundColor: "#EDEDED",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "78.5%",
    height: null,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0
    },
    shadowRadius: 4
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
      width: 0
    },
    shadowRadius: 4,
    padding: 10
  },
  passwordText: { fontSize: 18, fontWeight: "bold", color: "black", marginBottom: 14 },
  passwordInput: {
    width: "73.42%",
    textAlign: "center",
    fontSize: 24,
    backgroundColor: "white",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: {
      height: 4,
      width: 0
    },
    shadowRadius: 4,
    borderRadius: 30,
    flex: 0,
    marginBottom: 10
  },
  addButton: {
    borderColor: Colors.primaryColor,
    borderRadius: 50,
    borderWidth: 1,
    alignSelf: "flex-start",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0
    },
    backgroundColor: "white",
    shadowRadius: 4,
    padding: 10,
    paddingHorizontal: 8
  }
});


export default redeemCodeInput;
