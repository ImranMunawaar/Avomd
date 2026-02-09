import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { isValid } from "../models/modules";
import { BubbleCard } from "./BubbleCard";
import { BALLON_ELEVATION, fontFamily } from "../constants/strings";
import { getHeight, getWidth } from "../services/helper";
import Colors from "../constants/Colors";

const SegmentedButton = (props) => {
  const { elements, setVariable, targetVariable, getVar, subtitles, interact } =
    props;
  const shouldShowAsColumn =
    elements.length > 5 ||
    elements.some((value) => value.length > 30) ||
    elements.join().length > 30;
  const horizontalPaddingValue =
    elements.join().length > 26 ? getWidth(15) : getWidth(5);

  if (!getVar(targetVariable)) {
    // address the default values
    elements.map((item, i) => {
      if (item.substr(-1) === "!") {
        //console.log(item);
        //setVariable( targetVariable, i)
      }
    });
  }

  return (
    <View style={{ flexDirection: "column" }}>
      <View
        style={{
          alignSelf: "center",
          justifyContent: "center",
          //flexDirection: shouldShowAsColumn ? "column" : "row",
          marginTop: getHeight(8),
          flex: 1,
        }}
      >
        {elements.map((value, key) => {
          //const active = getVar(item.targetVariable) === key;
          const active = getVar(targetVariable) === key;
          const isFirst = key === 0;
          const isLast = key === elements.length - 1;
          return (
            <TouchableOpacity
              key={key}
              style={{
                ...styles.nextButtonStyle,
                ...styles.balloonButtonStyle,
                alignSelf: "stretch",
                backgroundColor: active ? Colors.button : "#FFFFFF",
                marginBottom: isLast ? 0 : getHeight(11),
              }}
              onPress={() => {
                interact();
                setVariable(targetVariable, key);
                // no next button.
                //moveToNextStep();
              }}
            >
              <Text
                numberOfLines={1}
                uppercase={false}
                style={{
                  ...styles.buttonTextStyle,
                  color: active ? "#FFFFFF" : "#000000",
                }}
              >
                {value.replace("!", "")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/*{subtitles && isValid(getVar(targetVariable)) && (
        <Text
          style={{
            ...styles.subtitleTextStyle,
            color: "#EA8065"
          }}>
          {subtitles[getVar(targetVariable)]}
        </Text>
      )}
      {subtitles && !isValid(getVar(targetVariable)) && (
        <Text
          style={{
            ...styles.subtitleTextStyle,
            color: "#FF9E7E"
          }}>
          Not Selected
        </Text>
      )}*/}
    </View>
  );
};

const styles = StyleSheet.create({
  nextButtonStyle: {
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#F4F4F4",
    height: getHeight(48),
    borderRadius: getHeight(48) / 2,
    paddingHorizontal: getWidth(35),
    alignItems: "center",
  },
  balloonButtonStyle: {
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
    shadowRadius: getHeight(10),
    elevation: BALLON_ELEVATION,
  },
  buttonTextStyle: {
    fontSize: getHeight(16),
    fontWeight: "400",
    fontFamily: fontFamily.Medium,
    color: "#000000",
    lineHeight: getHeight(16),
  },
  subtitleTextStyle: {
    marginTop: getHeight(7),
    fontSize: getHeight(12),
    marginStart: getWidth(12),
    fontFamily: fontFamily.Regular,
    fontWeight: "500",
  },
});

export { SegmentedButton };
