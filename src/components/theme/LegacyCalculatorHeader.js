import React, { Component } from "react";
import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import { getHeight, getWidth } from "../../services/helper";
import { fontFamily } from "../../constants/strings";
export class LegacyCalculatorHeader extends Component {
  render() {
    const { onBackPress, title, hasTabs, onRightPress, navigation } =
      this.props;
    return (
      <View
        style={{
          flexDirection: "row",
        }}
        hasTabs={hasTabs}
        iosBarStyle={"dark-content"}
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
              navigation.goBack();
            }}
          >
            <Image
              source={require("../../images/closesidebar.png")}
              style={{
                height: getHeight(35),
                width: getHeight(35),
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
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
