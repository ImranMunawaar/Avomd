import React, { Component } from "react";
import { View, Text, Image, Pressable } from "react-native";
import styles from "./styles";
import { getHeight, getWidth } from "../../services/helper";
import Colors from "../../constants/Colors";

const iconConfigs = {
  public: {
    name: require("../../images/public.png"),
  },
  private: {
    name: require("../../images/lock.png"),
  },
  hidden: {
    name: require("../../images/public.png"),
  },
};

const ChannelItem = ({
  description,
  channel,
  isPublic,
  isAdded,
  isLast,
  isFirst,
  onAddPress,
  isSectionList,
}) => {
  const publicity = channel.publicity.toLowerCase();
  const isLocked = channel.invitationCode && channel.invitationCode !== "";
  const currentIcon = iconConfigs[isLocked ? "private" : "public"];
  return (
    <View
      key={channel.code}
      style={[
        styles.cardStyle,
        {
          width: getWidth(210),
          marginStart:
            getWidth(16) + (isSectionList && isFirst ? getWidth(9) : 0),
          marginEnd: isLast ? getWidth(16) : 0,
          paddingStart: getWidth(19),
          paddingEnd: getWidth(15),
          paddingVertical: getWidth(15),
        },
      ]}
    >
      <View
        style={{
          marginBottom: getHeight(4),
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text numberOfLines={3} style={styles.titleText}>
          {channel.channelTitle}
        </Text>
        <Image
          source={currentIcon.name}
          style={{
            marginTop: getHeight(3),
            marginStart: getWidth(5),
            width: getHeight(17),
            height: getHeight(17),
          }}
        />
      </View>
      <View style={{ marginBottom: getHeight(7) }}>
        <Text style={styles.authorText}>
          {channel.author ? channel.author : "Team AvoMD et al"}
        </Text>
      </View>
      <Text numberOfLines={3} style={styles.descriptionText}>
        {description}
      </Text>
      <View style={{ flex: 1, marginTop: getHeight(4) }} />
      <Pressable
        onPress={onAddPress}
        style={[
          styles.addButton,
          styles.buttonText,
          { backgroundColor: isAdded ? Colors.button : "white" },
          { color: isAdded ? "white" : Colors.button },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            { color: isAdded ? "white" : Colors.button },
          ]}
        >
          {isAdded ? "Unsubscribe" : "add"}
        </Text>
      </Pressable>
    </View>
  );
};

export default ChannelItem;
