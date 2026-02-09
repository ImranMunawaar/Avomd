import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { getWidth, getHeight } from "../../services/helper";
import { useNavigation } from "@react-navigation/native";

export default function ChannelsEmptyState(props) {
  const navigation = useNavigation();

  const [displayView, setDisplayView] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setDisplayView(true);
    }, 3000);
  }, []);
  const {
    styles,
    activeChannelLength,
    loadingData,
    moduleListLength,
    keyword,
  } = props;
  if (displayView) {
    return activeChannelLength === 0 ? (
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: getHeight(50),
          zIndex: 1,
        }}
      >
        <Image
          source={require("../../images/empty.png")}
          style={{ width: getWidth(268), height: getHeight(268) }}
        />

        <Text numberOfLines={2} style={styles.emptyStateText}>
          You don’t have any subscribed channels yet!
        </Text>

        <Text numberOfLines={2} style={styles.emptyStateSubText}>
          Get started by adding channels
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Subscription", {});
          }}
          style={styles.addEmptyStateButton}
        >
          <Image
            source={require("../../images/plus.png")}
            style={{
              alignContent: "flex-start",
              justifyContent: "flex-start",
              width: getWidth(20),
              height: getHeight(14),
              marginTop: getHeight(3),
            }}
            // style={{ width: getWidth(4), height: getHeight(12) }}
          />
          <Text style={styles.emptyStateAddSubsButtonText}>Add Channel</Text>
        </TouchableOpacity>
      </View>
    ) : (
      !loadingData && activeChannelLength > 0 && moduleListLength === 0 && (
        <View style={styles.emptyStateContainer}>
          <View />
          <Text numberOfLines={2} style={styles.emptyText}>
            {keyword === "" || keyword === null
              ? "There are no modules in this channel yet."
              : `No results found for ‘${keyword}’`}
          </Text>
        </View>
      )
    );
  } else {
    return null;
  }
}
