import React from "react";
import { getHeight, getWidth } from "../../services/helper";
import { Image, Text, View } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { fontFamily } from "../../constants/strings";

export default function ToastMsg(props) {
  const { toastMsg } = props;
  const toastConfig = {
    /*
      Overwrite 'success' type,
      by modifying the existing `BaseToast` component
    */
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderRadius: getHeight(3),
          borderColor: "#2E3438",
          backgroundColor: "#2E3438",
        }}
        contentContainerStyle={{
          paddingHorizontal: getWidth(16),
          paddingVertical: getHeight(14),
        }}
        text1Style={{
          fontSize: getHeight(14),
          color: "#FFFFFF",
          fontWeight: "400",
          fontFamily: fontFamily.Regular,
        }}
      />
    ),
    /*
      Overwrite 'error' type,
      by modifying the existing `ErrorToast` component
    */
    error: (props) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 17,
        }}
        text2Style={{
          fontSize: 15,
        }}
      />
    ),
    /*
      Or create a completely new type - `customToast`,
      building the layout from scratch.
  
      I can consume any custom `props` I want.
      They will be passed when calling the `show` method (see below)
    */
    customToast: ({ text1, props }) => (
      <View
        style={{
          borderRadius: getHeight(3),
          borderColor: "#2E3438",
          width: getWidth(343),
          height: getHeight(48),
          backgroundColor: "#2E3438",
          flexDirection: "row",
          shadowColor: "black",
          shadowOpacity: 0.15,
          shadowOffset: {
            height: getHeight(4),
            width: 0,
          },
          alignSelf: "flex-start",
          // position: "absolute",
          //bottom: 0,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            marginVertical: getHeight(14),
            marginLeft: getWidth(14),
            flex: 0.95,
          }}
        >
          {toastMsg != undefined && toastMsg != "" ? toastMsg : text1}
        </Text>
        <Image
          source={require("../../images/checkmark.png")}
          style={{
            marginVertical: getHeight(18),
            width: getWidth(16),
            height: getHeight(16),
          }}
        />
      </View>
    ),
    customErrorToast: ({ text1, props }) => (
      <View
        style={{
          borderRadius: getHeight(3),
          borderColor: "#2E3438",
          width: getWidth(343),
          height: getHeight(48),
          backgroundColor: "#F94B50",
          flexDirection: "row",
          shadowColor: "black",
          shadowOpacity: 0.15,
          shadowOffset: {
            height: getHeight(4),
            width: 0,
          },
          alignSelf: "flex-start",
          // position: "absolute",
          //bottom: 0,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            marginVertical: getHeight(14),
            marginLeft: getWidth(14),
            flex: 0.95,
          }}
        >
          {toastMsg != undefined && toastMsg != "" ? toastMsg : text1}
        </Text>
        <Image
          source={require("../../images/error.png")}
          style={{
            marginVertical: getHeight(18),
            width: getWidth(16),
            height: getHeight(16),
          }}
        />
      </View>
    ),
  };
  return (
    <>
      <View style={{ position: "absolute", bottom: 0, left: getWidth(15) }}>
        <Toast position="bottom" config={toastConfig} />
      </View>
    </>
  );
}
