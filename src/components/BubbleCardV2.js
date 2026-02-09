import React from "react";
import { Platform, StatusBar, View, Text } from "react-native";
import { Svg, Path } from "react-native-svg";
import { getHeight, getWidth } from "../services/helper";

const bubbleDistanceFromEdge = 30;

const BubbleCard = (props) => {
  const { answer, full, isAction, isLast, style, onLayout, isChatItem } = props;
  const balloonStyle = [
    ...(isLast ? [] : [styles.balloon]),
    { backgroundColor: "#FCFCFC" },
    ...(answer ? [styles.itemOut] : [styles.itemIn]),
    ...(full ? [styles.full] : []),
    ...(style ? [style] : []),
  ];
  const arrowContainerStyle = [styles.arrowContainer];
  arrowContainerStyle.push(
    answer ? styles.arrowRightContainer : styles.arrowLeftContainer
  );
  return (
    <View
      onLayout={onLayout && onLayout}
      style={[
        {
          flexDirection: answer ? "row-reverse" : "row",
        },
      ]}
    >
      <View style={balloonStyle}>
        {isChatItem && (
          <View
            style={[
              {
                width: getHeight(40),
                height: getHeight(40),
                backgroundColor: "white",
                position: "absolute",
                top: 0,
                end: 0,
              },
              answer ? { end: 0 } : { start: 0 },
            ]}
          />
        )}
        <View style={styles.cardStyle}>{props.children}</View>
        {/* <View style={arrowContainerStyle}>
          {answer && (
            <Svg
              style={styles.arrowRight}
              width={15}
              height={17}
              viewBox="32.485 17.5 15.515 17.5"
              enable-background="new 32.485 17.5 15.515 17.5">
              <Path d="M48,35c-7-4-6-8.75-6-17.5C28,17.5,29,35,48,35z" fill="#BDF9D5" x="0" y="0" />
            </Svg>
          )}
          {!answer && (
            <Svg
              style={styles.arrowLeft}
              width={15}
              height={17}
              viewBox="32.484 17.5 15.515 17.5"
              enable-background="new 32.485 17.5 15.515 17.5">
              <Path
                d="M38.484,17.5c0,8.75,1,13.5-6,17.5C51.484,35,52.484,17.5,38.484,17.5z"
                fill="#F5F5F5"
                x="0"
                y="0"
              />
            </Svg>
          )}
        </View> */}
      </View>
    </View>
  );
};

const styles = {
  cardStyle: {
    paddingHorizontal: getHeight(20),
    paddingTop: getHeight(12),
    paddingBottom: getHeight(15),
  },
  container: {
    flex: 1,
    ...Platform.select({
      android: {
        marginTop: StatusBar.currentHeight,
      },
    }),
  },
  item: { marginBottom: 24 },
  itemIn: {
    marginLeft: 20,
    marginRight: bubbleDistanceFromEdge,
  },
  itemOut: {
    marginRight: 20,
    marginLeft: bubbleDistanceFromEdge,
  },
  full: {
    flex: 1,
    marginLeft: 23,
    marginRight: 23,
  },
  balloon: {
    flex: 0,
    zIndex: -1,
    borderRadius: getHeight(30),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 24,
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
