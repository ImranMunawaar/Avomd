import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
} from "react-native";
import { fontFamily } from "../../constants/strings";
import { getWidth, getHeight } from "../../services/helper";

export function CalculatorHeader(props) {
  const { onBackPress, title } = props;
  return (
    <View
      style={{
        flexDirection: "row",
        // backgroundColor: "white",
        //  alignItems: "flex-end",
        //paddingBottom: getHeight(3),
        // zIndex: 500,
        //marginBottom: getWidth(10),
        // elevation: 8,
      }}
    >
      <View style={styles.headerContentContainer}>
        <View
          style={{
            alignItems: title ? "flex-start" : "center",
            width: title ? "70%" : "100%",
            start: title ? getWidth(30) : null,
            paddingTop: getHeight(3),
          }}
        >
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>
        <TouchableOpacity
          style={{ marginEnd: getWidth(13) }}
          onPress={() => {
            if (onBackPress) {
              onBackPress();
            }
          }}
        >
          <Image
            source={require("../../images/closesidebar.png")}
            style={{
              height: getHeight(35),
              width: getWidth(35),
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContentContainer: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: getHeight(15),
    //alignItems: "center",
  },
  title: {
    fontSize: getHeight(25),
    fontWeight: "700",
    fontFamily: fontFamily.Bold,
    color: "#000000",
    marginTop: getHeight(10),
  },
  backIcon: {
    color: "black",
    fontSize: getHeight(33),
  },
});
