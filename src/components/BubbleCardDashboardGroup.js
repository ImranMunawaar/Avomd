import React from "react";
import { Platform, StatusBar, View } from "react-native";
import { Svg, Path } from "react-native-svg";
import { getHeight, getWidth } from "../services/helper";

const BubbleCardDashboardGroup = (props) => {
  const { answer, onLayout, isChatItem, groupCard, groupChoice } = props;
  // console.log("  GroupCard : ",groupCard , " isChatItem : " , isChatItem ,"    answer ",answer,"  Full : ", full, "  isLast : ", isLast, "  style ", style, "  onLayout : ",onLayout, "  expanded :" ,expanded);
  const balloonStyle = [
    { backgroundColor: "#FCFCFC" },
    ...(groupCard
      ? [styles.groupCard, styles.spacingsForGroupCard, styles]
      : []),
    ...(groupChoice ? [styles.groupCard, styles.groupChoice] : []),
  ];
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
            ? { borderTopLeftRadius: 0 }
            : isChatItem && answer
            ? { borderTopRightRadius: 0 }
            : "",
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

  groupCard: {
    elevation: 0,
    //marginBottom: getHeight(12),
    paddingHorizontal: getWidth(1),
    paddingTop: getHeight(1),
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

  spacingsForGroupCard: {
    marginBottom: getHeight(12),
    paddingBottom: getHeight(27),
  },
};

export { BubbleCardDashboardGroup };
