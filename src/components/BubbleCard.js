import React from "react";
import { Platform, StatusBar, View } from "react-native";
import { Svg, Path } from "react-native-svg";
import Colors from "../constants/Colors";

const bubbleDistanceFromEdge = 30;

const BubbleCard = props => {
  const { answer, full, isAction, style, onLayout } = props;
  const balloonStyle = [
    styles.balloon,
    { backgroundColor: answer ? Colors.secondaryColor : "#FCFCFC" },
    ...(answer ? [styles.itemOut] : [styles.itemIn]),
    ...(full ? [styles.full] : []),
    ...(style ? [style] : [])
  ];
  const arrowContainerStyle = [styles.arrowContainer];
  arrowContainerStyle.push(answer ? styles.arrowRightContainer : styles.arrowLeftContainer);
  return (
    <View
      onLayout={onLayout && onLayout}
      style={[
        {
          flexDirection: answer ? "row-reverse" : "row"
        },
        styles.item
      ]}>
      <View style={balloonStyle}>
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
    borderWidth: 0,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 10,
    borderBottomWidth: 0,
    elevation: 0,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    overflow: "hidden"
  },
  container: {
    flex: 1,
    ...Platform.select({
      android: {
        marginTop: StatusBar.currentHeight
      }
    })
  },
  item: {
    marginVertical: 5
  },
  itemIn: {
    marginLeft: 20,
    marginRight: bubbleDistanceFromEdge
  },
  itemOut: {
    marginRight: 20,
    marginLeft: bubbleDistanceFromEdge
  },
  full: {
    flex: 1,
    marginLeft: 23,
    marginRight: 23
  },
  balloon: {
    flex: 0,
    zIndex: -1,
    padding: 5,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 15
  },
  arrowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    flex: 1
  },
  arrowLeftContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-start"
  },
  arrowRightContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },

  arrowLeft: {
    left: -6
  },

  arrowRight: {
    right: -6
  }
};

export { BubbleCard };
