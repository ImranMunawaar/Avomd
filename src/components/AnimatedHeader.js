import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from "react-native";
import { getWidth, getHeight } from "../services/helper";
import { getStatusBarHeight } from "../services/iphoneXHelper";
import { fontFamily } from "../constants/strings";

const ARROW_HEIGHT = getHeight(28);

const AnimatedHeader = ({
  animatedValue,
  moduleTitle,
  onBackPress,
  adminModule,
}) => {
  const TOP_SPACE =
    Platform.OS === "ios" ? getStatusBarHeight(true) : getHeight(3);
  const COLLAPSED_HEADER_HEIGHT = TOP_SPACE + getHeight(55);
  const EXPANDED_HEADER_HEIGHT =
    COLLAPSED_HEADER_HEIGHT + getHeight(adminModule ? 65 : 40);
  const HEADER_HEIGHT = EXPANDED_HEADER_HEIGHT;
  const ARROW_TOP_SPACE =
    COLLAPSED_HEADER_HEIGHT - (ARROW_HEIGHT + getHeight(15));
  const EXTRAPOLATE = "clamp";
  const MIN_INPUT = 0;

  const headerHeight = animatedValue.interpolate({
    inputRange: [MIN_INPUT, HEADER_HEIGHT],
    outputRange: [
      EXPANDED_HEADER_HEIGHT - TOP_SPACE,
      COLLAPSED_HEADER_HEIGHT - TOP_SPACE,
    ],
    extrapolate: EXTRAPOLATE,
  });

  const headerPaddingStart = animatedValue.interpolate({
    inputRange: [MIN_INPUT, HEADER_HEIGHT],
    outputRange: [getWidth(30), getWidth(10)],
    extrapolate: EXTRAPOLATE,
  });

  const headerPaddingBottom = animatedValue.interpolate({
    inputRange: [MIN_INPUT, HEADER_HEIGHT],
    outputRange: [getHeight(5), getHeight(10)],
    extrapolate: EXTRAPOLATE,
  });

  const animatedHeaderHeight = animatedValue.interpolate({
    inputRange: [MIN_INPUT, HEADER_HEIGHT],
    outputRange: [0, COLLAPSED_HEADER_HEIGHT - getHeight(5)],
    extrapolate: EXTRAPOLATE,
  });

  const animatedFontSize = animatedValue.interpolate({
    inputRange: [MIN_INPUT, HEADER_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: EXTRAPOLATE,
  });

  return (
    <View
      style={{
        paddingTop: TOP_SPACE,
      }}
    >
      <Animated.View
        style={{
          ...styles.header,
          height: animatedHeaderHeight,
          flex: 1,
        }}
      />
      <Animated.View
        style={{
          zIndex: 20,
          height: headerHeight,
          justifyContent: "flex-end",
          paddingStart: headerPaddingStart,
          paddingBottom: headerPaddingBottom,
          paddingEnd: getWidth(15),
          elevation: 9,
          backgroundColor: "transparent",
        }}
      >
        <Animated.Text
          style={{
            ...styles.moduleTitle,
            transform: [{ scale: animatedFontSize }],
          }}
          numberOfLines={adminModule ? 2 : 1}
        >
          {moduleTitle}
        </Animated.Text>
      </Animated.View>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="headerBackBtn"
        style={{
          position: "absolute",
          zIndex: 100,
          top: ARROW_TOP_SPACE - getHeight(10),
          elevation: 9,
        }}
        onPress={() => {
          if (onBackPress) {
            onBackPress();
          }
        }}
      >
        <Image
          source={require("../images/arrow.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default AnimatedHeader;

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    shadowColor: "#bfbfbf",
    shadowOpacity: 1,
    shadowOffset: {
      height: 10,
      width: 0,
    },
    start: 0,
    end: 0,
    shadowRadius: 5,
    borderBottomColor: "#bfbfbf",
    top: 0,
    flexDirection: "row",
    zIndex: 5,
    elevation: 8,
    backgroundColor: "white",
  },
  moduleTitle: {
    fontSize: getHeight(24),
    color: "#000000",
    fontFamily: fontFamily.Bold,
  },
  backIcon: {
    height: ARROW_HEIGHT,
    width: ARROW_HEIGHT,
    marginStart: getWidth(16),
    marginEnd: getWidth(10),
    marginTop: getHeight(15),
    resizeMode: "contain",
  },
});
