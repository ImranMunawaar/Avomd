import React, { Component } from "react";
import { View, Text, Animated, Pressable } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import styles from "./styles";
import ChannelItem from "./channelitem";
import { BubbleCard } from "../../components/BubbleCardV2";
import { getHeight, getWidth } from "../../services/helper";

const iconConfigs = {
  "public": {
    type: "MaterialIcons",
    name: "public"
  },
  "private": {
    type: "MaterialIcons",
    name: "lock-outline"
  },
  "hidden": {
    //type: "MaterialCommunityIcons",
    //name: "eye-off-outline"
    type: "MaterialIcons",
    name: "public"
  }
};

const SwipeableChannelItem =
  ({
     description,
     channel,
     isPublic,
     isAdded,
     isLast,
     onAddPress,
     onDeletePress
   }) => {
    const publicity = channel.publicity.toLowerCase();
    const currentIcon = publicity && publicity !== "" ? iconConfigs[publicity] : iconConfigs["public"];

    const rightActions = (progress, dragX) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [0, 0, 0, 1]
      });
      return (
        <Pressable
          style={styles.deleteButton}
          onPress={onDeletePress}>
          <Animated.Text
            style={styles.deleteText}>
            Delete
          </Animated.Text>
        </Pressable>
      );
    };
    return (
      <View style={[styles.cardStyle, { marginBottom: isLast ? getHeight(35) : styles.cardStyle.marginBottom }]}>
        <View style={{ borderRadius: getHeight(20), overflow: "hidden" }}>
          <Swipeable
            key={channel.code}
            containerStyle={{ overflow: "hidden" }}
            childrenContainerStyle={{
              paddingHorizontal: getHeight(20),
              paddingTop: getHeight(12),
              paddingBottom: getHeight(15),
              backgroundColor: "white"
            }}
            renderRightActions={rightActions}>
            <View style={{ marginBottom: getHeight(4), flexDirection: "row" }}>
              <Text style={styles.titleText}>{channel.channelTitle}</Text>
            </View>
            <View style={{ marginBottom: getHeight(7) }}>
              <Text style={styles.authorText}>{channel.author ? channel.author : "Team AvoMD et al"}</Text>
            </View>
            <Text numberOfLines={3} style={styles.descriptionText}>{description}</Text>
          </Swipeable>
        </View>
      </View>
    );
  };

export default SwipeableChannelItem;
