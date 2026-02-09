import React from "react";
import { Platform, StatusBar, View } from "react-native";
import { Svg, Path } from "react-native-svg";
import { getHeight, getWidth, deviceWidth } from "../services/helper";
import Layout from "../constants/Layout";

const bubbleDistanceFromEdge = getWidth(14);

const BubbleCard = (props) => {
  const {
    answer,
    full,
    isLast,
    style,
    onLayout,
    isChatItem,
    expanded,
    groupCard,
    groupChoice,
    isCalculator,
    title,
  } = props;
  const balloonStyle = [
    ...(isChatItem
      ? answer
        ? [styles.itemOut]
        : [styles.itemIn]
      : [
          {
            marginStart: getWidth(19),
            marginEnd: getWidth(19),
            maxWidth: null,
          },
        ]),
    ...(isLast && !groupCard
      ? [
          styles.spacings,
          styles.upperShadow,
          {
            marginStart: 0,
            marginEnd: 0,
            flex: 1,
            marginTop: getHeight(24),
            maxWidth: null,
          },
        ]
      : groupCard
      ? [styles.groupCard]
      : [styles.balloon, styles.spacings]),
    ...(expanded && !isLast && !groupCard
      ? [
          {
            marginStart: getWidth(14),
            marginEnd: getWidth(14),
            flexShrink: 1,
            maxWidth: null,
            width: Layout.window.width - getWidth(28),
          },
        ]
      : []),
    ...(full ? [styles.full] : []),
    ...(groupChoice ? [styles.groupCard, styles.groupChoice] : []),
    ...(groupCard
      ? [
          {
            marginBottom: 0,
            marginTop: 0,
            marginStart: 0,
            marginEnd: 0,
            paddingStart: 0,
            paddingEnd: 0,
          },
        ]
      : []),
    ...(style ? [style] : []),
  ];
  /* console.log("Texting", {
    title,
    isChatItem,
    groupCard,
    answer,
    isCalculator,
    isLast,
  }); */
  return (
    <View
      onLayout={onLayout && onLayout}
      style={[
        {
          flexDirection: answer ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[
          balloonStyle,
          isChatItem && !answer
            ? {
                borderTopLeftRadius: 0,
                borderTopRightRadius: getHeight(30),
                backgroundColor: style?.backgroundColor
                  ? style.backgroundColor
                  : "#FFFFFF",
              }
            : isChatItem && answer
            ? {
                borderTopRightRadius: 0,
                borderTopLeftRadius: getHeight(30),
                backgroundColor: "#F9F9F9",
              }
            : {
                backgroundColor: isCalculator
                  ? style?.backgroundColor
                    ? style.backgroundColor
                    : "#FFFFFF"
                  : "#F9F9F9",
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              },
          isCalculator || groupCard ? { backgroundColor: "transparent" } : {},
        ]}
      >
        {props.children}
      </View>
    </View>
  );
};

const styles = {
  cardStyle: {},
  container: {
    flex: 1,
    ...Platform.select({
      android: {
        marginTop: StatusBar.currentHeight,
      },
    }),
  },
  itemIn: {
    marginStart: getWidth(12),
    marginRight: bubbleDistanceFromEdge,
    maxWidth: deviceWidth - (getWidth(12) + bubbleDistanceFromEdge),
  },
  itemOut: {
    marginRight: getWidth(12),
    marginLeft: bubbleDistanceFromEdge,
    maxWidth: deviceWidth - (getWidth(12) + bubbleDistanceFromEdge),
  },
  full: {
    flex: 1,
    marginStart: getWidth(14),
    marginEnd: getWidth(14),
  },
  groupCard: {
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: "#fff",
    //marginBottom: getHeight(12),
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  groupChoice: {
    flex: 1,
  },
  balloon: {
    flex: 0,
    zIndex: -1,
    borderRadius: getHeight(30),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: getHeight(2),
    },
    shadowOpacity: 0.15,
    shadowRadius: getHeight(8),
    elevation: 8,
  },
  upperShadow: {
    flex: 0,
    zIndex: -1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -getHeight(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: getHeight(4),
    elevation: 8,
  },
  spacings: {
    marginBottom: getHeight(12),
    paddingHorizontal: getWidth(20),
    paddingTop: getHeight(20),
    paddingBottom: getHeight(20),
  },
  arrowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    flex: 1,
  },
  arrowLeftContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  arrowRightContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },

  arrowLeft: {
    left: -6,
  },

  arrowRight: {
    right: -6,
  },
};

export { BubbleCard };
